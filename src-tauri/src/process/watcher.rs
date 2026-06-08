use tauri::Emitter;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::time::{sleep, Duration};

use super::manager::{BotStatus, ProcessManager};

fn save_log(conn: &rusqlite::Connection, bot_id: &str, stream: &str, message: &str) {
    let ts = chrono::Utc::now().to_rfc3339();
    let _ = crate::db::logs::insert(conn, bot_id, &ts, stream, message);
}

fn update_crash_count(conn: &rusqlite::Connection, bot_id: &str) {
    let _ = conn.execute(
        "UPDATE bots SET crash_count = crash_count + 1, updated_at = ?2 WHERE id = ?1",
        rusqlite::params![bot_id, chrono::Utc::now().to_rfc3339()],
    );
}

pub fn spawn_watcher<R: tauri::Runtime>(
    app_handle: tauri::AppHandle<R>,
    manager: std::sync::Arc<ProcessManager>,
    db: std::sync::Arc<crate::db::DbState>,
    bot_id: String,
    mut child: tokio::process::Child,
    auto_restart: String,
    app_state: std::sync::Arc<crate::AppState>,
) {
    tokio::spawn(async move {
        let pid = child.id();

        if let Some(pid_val) = pid {
            if let Some(mut p) = manager.processes.get_mut(&bot_id) {
                p.pid = Some(pid_val);
                p.status = BotStatus::Starting;
                p.start_time = Some(chrono::Utc::now());
            }

            let _ = app_handle.emit("bot:status", serde_json::json!({
                "botId": bot_id,
                "status": "starting",
                "pid": pid_val,
            }));

            sleep(Duration::from_secs(2)).await;

            if let Some(mut p) = manager.processes.get_mut(&bot_id) {
                if matches!(p.status, BotStatus::Starting) {
                    p.status = BotStatus::Running;
                    let _ = app_handle.emit("bot:status", serde_json::json!({
                        "botId": bot_id,
                        "status": "running",
                        "pid": pid_val,
                    }));
                }
            }
        }

        // Capture stdout
        let stdout = child.stdout.take();
        let stdout_handle = app_handle.clone();
        let bot_id_stdout = bot_id.clone();
        let db_stdout = std::sync::Arc::clone(&db);
        let stdout_task = tokio::spawn(async move {
            if let Some(stdout) = stdout {
                let reader = BufReader::new(stdout);
                let mut lines = reader.lines();
                while let Ok(Some(line)) = lines.next_line().await {
                    if let Ok(conn) = db_stdout.conn.lock() {
                        save_log(&conn, &bot_id_stdout, "stdout", &line);
                    }
                    let _ = stdout_handle.emit("bot:log", serde_json::json!({
                        "botId": bot_id_stdout,
                        "stream": "stdout",
                        "message": line,
                        "ts": chrono::Utc::now().to_rfc3339(),
                    }));
                }
            }
        });

        // Capture stderr
        let stderr = child.stderr.take();
        let stderr_handle = app_handle.clone();
        let bot_id_stderr = bot_id.clone();
        let db_stderr = std::sync::Arc::clone(&db);
        let stderr_task = tokio::spawn(async move {
            if let Some(stderr) = stderr {
                let reader = BufReader::new(stderr);
                let mut lines = reader.lines();
                while let Ok(Some(line)) = lines.next_line().await {
                    if let Ok(conn) = db_stderr.conn.lock() {
                        save_log(&conn, &bot_id_stderr, "stderr", &line);
                    }
                    let _ = stderr_handle.emit("bot:log", serde_json::json!({
                        "botId": bot_id_stderr,
                        "stream": "stderr",
                        "message": line,
                        "ts": chrono::Utc::now().to_rfc3339(),
                    }));
                }
            }
        });

        let exit = child.wait().await;
        let mut should_restart = false;

        stdout_task.await.ok();
        stderr_task.await.ok();

        if let Ok(status) = exit {
            let crashed = !status.success();

            if let Some(mut p) = manager.processes.get_mut(&bot_id) {
                p.pid = None;
                if crashed {
                    p.status = BotStatus::Crashed;
                    p.crash_count += 1;
                    p.last_crash = Some(chrono::Utc::now());

                    if auto_restart == "always" || auto_restart == "on_crash" {
                        if p.crash_count < 5 {
                            should_restart = true;
                        }
                    }

                    // Update DB crash count so it persists across sessions
                    if let Ok(conn) = db.conn.lock() {
                        update_crash_count(&conn, &bot_id);
                    }
                } else {
                    p.status = BotStatus::Stopped;
                }
            }

            let _ = app_handle.emit("bot:status", serde_json::json!({
                "botId": bot_id,
                "status": if crashed { "crashed" } else { "stopped" },
                "exitCode": status.code(),
            }));
        }

        if should_restart {
            let delay = match manager.processes.get(&bot_id).map(|p| p.crash_count) {
                Some(1) => 5,
                Some(2) => 10,
                Some(3) => 30,
                Some(4) => 60,
                _ => 60,
            };

            let _ = app_handle.emit("bot:status", serde_json::json!({
                "botId": bot_id,
                "status": "crashed",
                "restartIn": delay,
            }));

            sleep(Duration::from_secs(delay)).await;

            // Verify we haven't exceeded crash limit after delay
            if let Some(p) = manager.processes.get(&bot_id) {
                if p.crash_count >= 5 {
                    return;
                }
            }

            // Actually restart the bot
            let _ = crate::do_start_bot(app_state, bot_id.clone(), app_handle.clone()).await;
        }
    });
}
