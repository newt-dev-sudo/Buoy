use std::sync::Arc;
use tauri::{Emitter, Manager};

mod commands;
mod db;
mod process;

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BotWithStatus {
    #[serde(flatten)]
    pub bot: db::bots::Bot,
    pub status: String,
    pub pid: Option<u32>,
    pub cpu_pct: Option<f64>,
    pub mem_mb: Option<f64>,
    pub uptime_secs: Option<u64>,
}

fn merge_bot_status(
    bot: db::bots::Bot,
    pm: &process::manager::ProcessManager,
    mc: &process::metrics::MetricsCollector,
) -> BotWithStatus {
    let status = pm.get_status(&bot.id)
        .map(|s| s.to_string())
        .unwrap_or_else(|| "stopped".to_string());
    let pid = pm.get_pid(&bot.id);
    let metrics = pid.and_then(|_| mc.get(&bot.id));
    BotWithStatus {
        bot,
        status,
        pid,
        cpu_pct: metrics.as_ref().map(|m| m.cpu_pct),
        mem_mb: metrics.as_ref().map(|m| m.mem_mb),
        uptime_secs: metrics.as_ref().map(|m| m.uptime_secs),
    }
}

#[tauri::command]
async fn list_bots(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<Vec<BotWithStatus>, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let bots = db::bots::list(&conn).map_err(|e| e.to_string())?;
    let merged = bots.into_iter()
        .map(|b| merge_bot_status(b, &state.process_manager, &state.metrics))
        .collect();
    Ok(merged)
}

#[tauri::command]
async fn get_bot(state: tauri::State<'_, Arc<AppState>>, id: String) -> Result<Option<BotWithStatus>, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let bot = db::bots::get(&conn, &id).map_err(|e| e.to_string())?;
    Ok(bot.map(|b| merge_bot_status(b, &state.process_manager, &state.metrics)))
}

#[tauri::command]
async fn create_bot(state: tauri::State<'_, Arc<AppState>>, bot: serde_json::Value) -> Result<BotWithStatus, String> {
    let args = bot.get("args").and_then(|a| a.as_array())
        .map(|arr| serde_json::to_string(arr).unwrap_or_else(|_| "[]".to_string()))
        .unwrap_or_else(|| "[]".to_string());

    let new_bot = db::bots::Bot {
        id: uuid::Uuid::new_v4().to_string(),
        name: bot.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string(),
        path: bot.get("path").and_then(|v| v.as_str()).unwrap_or("").to_string(),
        runtime: bot.get("runtime").and_then(|v| v.as_str()).unwrap_or("node").to_string(),
        entry_point: bot.get("entryPoint").and_then(|v| v.as_str()).unwrap_or("").to_string(),
        args,
        auto_restart: bot.get("autoRestart").and_then(|v| v.as_str()).unwrap_or("never").to_string(),
        crash_count: 0,
        running: 0,
        created_at: chrono::Utc::now().to_rfc3339(),
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    db::bots::create(&conn, &new_bot).map_err(|e| e.to_string())?;
    Ok(merge_bot_status(new_bot, &state.process_manager, &state.metrics))
}

#[tauri::command]
async fn update_bot(state: tauri::State<'_, Arc<AppState>>, id: String, bot: serde_json::Value) -> Result<BotWithStatus, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    let existing = db::bots::get(&conn, &id).map_err(|e| e.to_string())?
        .ok_or_else(|| "Bot not found".to_string())?;

    let updated = db::bots::Bot {
        id: existing.id,
        name: bot.get("name").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or(existing.name),
        path: bot.get("path").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or(existing.path),
        runtime: bot.get("runtime").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or(existing.runtime),
        entry_point: bot.get("entryPoint").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or(existing.entry_point),
        args: bot.get("args").and_then(|a| a.as_array())
            .map(|arr| serde_json::to_string(arr).unwrap_or_else(|_| existing.args.clone()))
            .unwrap_or(existing.args),
        auto_restart: bot.get("autoRestart").and_then(|v| v.as_str()).map(|s| s.to_string()).unwrap_or(existing.auto_restart),
        crash_count: existing.crash_count,
        running: existing.running,
        created_at: existing.created_at,
        updated_at: chrono::Utc::now().to_rfc3339(),
    };
    db::bots::update(&conn, &id, &updated).map_err(|e| e.to_string())?;
    Ok(merge_bot_status(updated, &state.process_manager, &state.metrics))
}

#[tauri::command]
async fn delete_bot(state: tauri::State<'_, Arc<AppState>>, id: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    // Stop if running
    do_stop_bot(state.inner().clone(), id.clone(), app_handle).await.ok();
    // Delete from DB — cascade removes logs, env_vars, restart_events
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    db::bots::delete(&conn, &id).map_err(|e| e.to_string())?;
    Ok(())
}

fn check_runtime(program: &str) -> Result<(), String> {
    if std::process::Command::new(program).arg("--version").output().is_err() {
        return Err(format!(
            "'{}' was not found on this system. Please install it and ensure it's in your PATH.",
            program
        ));
    }
    Ok(())
}

fn resolve_program(runtime: &str, entry_point: &str, state: &AppState) -> Result<String, String> {
    match runtime {
        "node" => {
            if entry_point.ends_with(".ts") {
                Ok("npx".to_string())
            } else {
                let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
                Ok(db::settings::get(&conn, "nodePath").unwrap_or(None).unwrap_or_else(|| "node".to_string()))
            }
        }
        "python" => {
            let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
            Ok(db::settings::get(&conn, "pythonPath").unwrap_or(None).unwrap_or_else(|| "python".to_string()))
        }
        "custom" => {
            let first = entry_point.split_whitespace().next().unwrap_or("");
            if first.is_empty() {
                return Err("Custom entry point is empty".to_string());
            }
            Ok(first.to_string())
        }
        _ => Err(format!("Unknown runtime: {}", runtime)),
    }
}

pub async fn do_start_bot<R: tauri::Runtime>(state: Arc<AppState>, id: String, app_handle: tauri::AppHandle<R>) -> Result<(), String> {
    let (bot, env_vars) = {
        let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
        let bot = db::bots::get(&conn, &id).map_err(|e| e.to_string())?
            .ok_or_else(|| "Bot not found".to_string())?;
        let envs = db::env_vars::list(&conn, &id).map_err(|e| e.to_string())?;
        let env_pairs: Vec<(String, String)> = envs.into_iter()
            .map(|e| (e.key, String::from_utf8_lossy(&e.value_enc).to_string()))
            .collect();
        (bot, env_pairs)
    };

    let program = resolve_program(&bot.runtime, &bot.entry_point, &state)?;
    check_runtime(&program)?;

    let args: Vec<String> = serde_json::from_str(&bot.args).unwrap_or_default();
    let mut cmd = process::spawner::build_command(&program, &bot.runtime, &bot.path, &bot.entry_point, &args, &env_vars)?;
    let child = cmd.spawn().map_err(|e| format!("Failed to start bot: {}", e))?;

    state.process_manager.processes.insert(id.clone(), process::manager::BotProcess {
        bot_id: id.clone(),
        child: None,
        status: process::manager::BotStatus::Starting,
        pid: child.id(),
        start_time: Some(chrono::Utc::now()),
        crash_count: 0,
        last_crash: None,
    });

    process::watcher::spawn_watcher(
        app_handle,
        Arc::clone(&state.process_manager),
        Arc::clone(&state.db),
        id.clone(),
        child,
        bot.auto_restart.clone(),
        Arc::clone(&state),
    );

    // Persist running state so bots auto-restart after app relaunch
    {
        let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
        let _ = db::bots::set_running(&conn, &id, 1);
    }

    Ok(())
}

#[tauri::command]
async fn start_bot(state: tauri::State<'_, Arc<AppState>>, id: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    do_start_bot(state.inner().clone(), id, app_handle).await
}

async fn do_stop_bot(state: Arc<AppState>, id: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(mut proc) = state.process_manager.processes.get_mut(&id) {
        proc.status = process::manager::BotStatus::Stopping;
        let _ = app_handle.emit("bot:status", serde_json::json!({
            "botId": id,
            "status": "stopping",
        }));
    }

    if let Some(proc) = state.process_manager.processes.get(&id) {
        if let Some(pid) = proc.pid {
            let _ = tokio::process::Command::new("taskkill")
                .args(["/PID", &pid.to_string(), "/F"])
                .output()
                .await;
        }
    }

    state.process_manager.processes.remove(&id);

    // Clear persisted running state
    {
        let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
        let _ = db::bots::set_running(&conn, &id, 0);
    }

    Ok(())
}

#[tauri::command]
async fn stop_bot(state: tauri::State<'_, Arc<AppState>>, id: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    do_stop_bot(state.inner().clone(), id, app_handle).await
}

#[tauri::command]
async fn restart_bot(state: tauri::State<'_, Arc<AppState>>, id: String, app_handle: tauri::AppHandle) -> Result<(), String> {
    do_stop_bot(state.inner().clone(), id.clone(), app_handle.clone()).await?;
    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    do_start_bot(state.inner().clone(), id, app_handle).await
}

#[tauri::command]
async fn get_bot_logs(state: tauri::State<'_, Arc<AppState>>, id: String, limit: i64, cursor: Option<i64>) -> Result<Vec<db::logs::LogEntry>, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    db::logs::get_recent(&conn, &id, limit, cursor).map_err(|e| e.to_string())
}

#[tauri::command]
async fn clear_bot_logs(state: tauri::State<'_, Arc<AppState>>, id: String) -> Result<usize, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    db::logs::clear(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_metrics(state: tauri::State<'_, Arc<AppState>>) -> Result<Vec<process::metrics::BotMetrics>, String> {
    let metrics: Vec<process::metrics::BotMetrics> = state.metrics.metrics.iter()
        .map(|m| m.clone())
        .collect();
    Ok(metrics)
}

#[tauri::command]
async fn set_env_var(state: tauri::State<'_, Arc<AppState>>, bot_id: String, key: String, value: String) -> Result<(), String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    db::env_vars::set(&conn, &bot_id, &key, value.as_bytes(), &[0u8; 12]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn delete_env_var(state: tauri::State<'_, Arc<AppState>>, bot_id: String, key: String) -> Result<(), String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    db::env_vars::delete(&conn, &bot_id, &key).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn list_env_vars(state: tauri::State<'_, Arc<AppState>>, bot_id: String) -> Result<Vec<db::env_vars::EnvVar>, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    db::env_vars::list(&conn, &bot_id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn clone_repo(url: String, bot_id: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    let app_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    let target = app_dir.join("repos").join(&bot_id);
    let _ = std::fs::remove_dir_all(&target);
    std::fs::create_dir_all(&target).map_err(|e| e.to_string())?;

    let output = std::process::Command::new("git")
        .args(["clone", &url, target.to_str().unwrap_or("")])
        .output()
        .map_err(|e| format!("git clone failed: {}", e))?;

    if !output.status.success() {
        return Err(format!("Git clone failed: {}", String::from_utf8_lossy(&output.stderr)));
    }
    Ok(target.to_string_lossy().to_string())
}

#[tauri::command]
async fn detect_runtime(path: String) -> Result<serde_json::Value, String> {
    let entries = std::fs::read_dir(&path).map_err(|e| format!("Cannot read directory: {}", e))?;

    let mut has_package_json = false;
    let mut has_requirements_txt = false;
    let mut has_py_files = false;
    let mut has_js_files = false;
    let mut has_ts_files = false;
    let mut has_cargo_toml = false;
    let mut has_go_mod = false;
    let mut py_files: Vec<String> = Vec::new();
    let mut js_files: Vec<String> = Vec::new();
    let mut main_file: Option<String> = None;

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        let meta = entry.metadata().map_err(|e| e.to_string())?;
        if !meta.is_file() { continue; }

        if name == "package.json" {
            has_package_json = true;
            let contents = std::fs::read_to_string(entry.path()).map_err(|e| e.to_string())?;
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&contents) {
                // Try "main" field
                if let Some(main) = parsed.get("main").and_then(|v| v.as_str()) {
                    main_file = Some(main.to_string());
                }
                // Try scripts.start
                if main_file.is_none() {
                    if let Some(start) = parsed.get("scripts").and_then(|s| s.get("start")).and_then(|v| v.as_str()) {
                        let parts: Vec<&str> = start.split_whitespace().collect();
                        if parts.len() >= 2 && (parts[0] == "node" || parts[0].ends_with("node")) {
                            let arg = parts[1];
                            if arg == "." {
                                main_file = Some("index.js".to_string());
                            } else {
                                main_file = Some(arg.to_string());
                            }
                        }
                    }
                }
            }
        } else if name == "requirements.txt" {
            has_requirements_txt = true;
        } else if name == "Cargo.toml" {
            has_cargo_toml = true;
        } else if name == "go.mod" {
            has_go_mod = true;
        } else if name.ends_with(".py") {
            has_py_files = true;
            py_files.push(name.clone());
        } else if name.ends_with(".ts") && !name.ends_with(".d.ts") {
            has_ts_files = true;
            js_files.push(name.clone());
        } else if name.ends_with(".js") {
            has_js_files = true;
            js_files.push(name.clone());
        }
    }

    // Prioritized detection
    if has_package_json {
        let entry = main_file.unwrap_or_else(|| {
            if has_ts_files { "index.ts".to_string() }
            else { "index.js".to_string() }
        });
        return Ok(serde_json::json!({
            "runtime": "node",
            "entryPoint": entry,
            "provenance": "found package.json"
        }));
    }

    if has_cargo_toml {
        return Ok(serde_json::json!({
            "runtime": "custom",
            "entryPoint": "cargo run",
            "provenance": "found Cargo.toml"
        }));
    }

    if has_go_mod {
        return Ok(serde_json::json!({
            "runtime": "custom",
            "entryPoint": "go run .",
            "provenance": "found go.mod"
        }));
    }

    if has_requirements_txt || has_py_files {
        let entry = find_best_py_entry(&py_files);
        return Ok(serde_json::json!({
            "runtime": "python",
            "entryPoint": entry,
            "provenance": if has_requirements_txt { "found requirements.txt" } else { "found .py files" }
        }));
    }

    if has_ts_files {
        return Ok(serde_json::json!({
            "runtime": "node",
            "entryPoint": "index.ts",
            "provenance": "found .ts files"
        }));
    }

    if has_js_files {
        let entry = find_best_js_entry(&js_files);
        return Ok(serde_json::json!({
            "runtime": "node",
            "entryPoint": entry,
            "provenance": "found .js files"
        }));
    }

    Ok(serde_json::json!({
        "runtime": "custom",
        "entryPoint": "",
        "provenance": "no recognised project files found"
    }))
}

fn find_best_py_entry(files: &[String]) -> String {
    let candidates = ["main.py", "app.py", "bot.py", "run.py", "server.py", "__main__.py"];
    for c in candidates {
        if files.contains(&c.to_string()) { return c.to_string(); }
    }
    files.first().cloned().unwrap_or_else(|| "main.py".to_string())
}

fn find_best_js_entry(files: &[String]) -> String {
    let candidates = ["index.js", "main.js", "app.js", "bot.js", "server.js"];
    for c in candidates {
        if files.contains(&c.to_string()) { return c.to_string(); }
    }
    files.first().cloned().unwrap_or_else(|| "index.js".to_string())
}

#[tauri::command]
async fn install_deps(state: tauri::State<'_, Arc<AppState>>, bot_id: String) -> Result<String, String> {
    let bot = {
        let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
        db::bots::get(&conn, &bot_id).map_err(|e| e.to_string())?
            .ok_or_else(|| "Bot not found".to_string())?
    };

    fn resolve_cmd(name: &str) -> Result<String, String> {
        // Try `which` first (respects PATH on all platforms)
        if let Ok(path) = which::which(name) {
            return Ok(path.to_string_lossy().to_string());
        }
        // Windows fallback: npm is usually npm.cmd, pip might be pip.exe or pip3.exe
        #[cfg(target_os = "windows")]
        {
            for ext in [".cmd", ".exe", ".bat"] {
                let candidate = format!("{}{}", name, ext);
                if which::which(&candidate).is_ok() {
                    return Ok(candidate);
                }
            }
        }
        Err(format!("'{}' not found in PATH. Please install it.", name))
    }

    #[cfg(target_os = "windows")]
    fn make_cmd(program: &str, args: &[String]) -> (String, Vec<String>) {
        let lower = program.to_lowercase();
        if lower.ends_with(".cmd") || lower.ends_with(".bat") {
            let mut cmd_args = vec!["/C".to_string(), program.to_string()];
            cmd_args.extend_from_slice(args);
            return ("cmd.exe".to_string(), cmd_args);
        }
        (program.to_string(), args.to_vec())
    }

    #[cfg(not(target_os = "windows"))]
    fn make_cmd(program: &str, args: &[String]) -> (String, Vec<String>) {
        (program.to_string(), args.to_vec())
    }

    let (raw_program, raw_args): (String, Vec<String>) = match bot.runtime.as_str() {
        "node" => {
            let npm = resolve_cmd("npm")?;
            (npm, vec!["install".to_string()])
        }
        "python" => {
            // Try pip, then pip3
            let pip = resolve_cmd("pip")
                .or_else(|_| resolve_cmd("pip3"))?;
            (pip, vec!["install".to_string(), "-r".to_string(), "requirements.txt".to_string()])
        }
        _ => return Err("Dependency installation is only supported for Node.js and Python bots".to_string()),
    };

    let (program, args) = make_cmd(&raw_program, &raw_args);

    let output = tokio::process::Command::new(&program)
        .args(&args)
        .current_dir(&bot.path)
        .output()
        .await
        .map_err(|e| format!("Failed to spawn '{}': {}", program, e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    if !output.status.success() {
        return Err(format!("Installation failed:\n{}", stderr));
    }
    Ok(stdout.to_string())
}

#[tauri::command]
async fn get_setting(state: tauri::State<'_, Arc<AppState>>, key: String) -> Result<Option<String>, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    db::settings::get(&conn, &key).map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_setting(state: tauri::State<'_, Arc<AppState>>, key: String, value: String) -> Result<(), String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    db::settings::set(&conn, &key, &value).map_err(|e| e.to_string())
}

#[tauri::command]
async fn list_settings(state: tauri::State<'_, Arc<AppState>>) -> Result<Vec<db::settings::Setting>, String> {
    let conn = state.db.conn.lock().map_err(|e| e.to_string())?;
    db::settings::list(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
fn minimize_window(window: tauri::WebviewWindow) {
    let _ = window.minimize();
}

#[tauri::command]
fn maximize_window(window: tauri::WebviewWindow) {
    if window.is_maximized().unwrap_or(false) {
        let _ = window.unmaximize();
    } else {
        let _ = window.maximize();
    }
}

#[tauri::command]
fn hide_window(window: tauri::WebviewWindow) {
    let _ = window.hide();
}

#[tauri::command]
fn show_window(window: tauri::WebviewWindow) {
    let _ = window.show();
    let _ = window.set_focus();
}

#[tauri::command]
fn quit_app(window: tauri::WebviewWindow) {
    let app = window.app_handle();
    let state = app.state::<Arc<AppState>>();
    if let Ok(conn) = state.db.conn.lock() {
        for entry in state.process_manager.processes.iter() {
            let proc = entry.value();
            if let Some(pid) = proc.pid {
                let _ = std::process::Command::new("taskkill")
                    .args(["/PID", &pid.to_string(), "/F"])
                    .output();
            }
            let _ = db::bots::set_running(&conn, &proc.bot_id, 0);
        }
    }
    let _ = app.exit(0);
}

pub struct AppState {
    pub db: Arc<db::DbState>,
    pub process_manager: Arc<process::manager::ProcessManager>,
    pub metrics: Arc<process::metrics::MetricsCollector>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::AppleScript,
            None::<Vec<&'static str>>,
        ))
        .setup(|app| {
            let app_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&app_dir)?;
            let db = Arc::new(db::init_db(&app_dir)?);

            let pm = Arc::new(process::manager::ProcessManager::new());
            let mc = Arc::new(process::metrics::MetricsCollector::new());

            let state = Arc::new(AppState { db: Arc::clone(&db), process_manager: Arc::clone(&pm), metrics: Arc::clone(&mc) });
            app.manage(Arc::clone(&state));

            // Auto-restart bots that were running before last shutdown
            {
                let conn = db.conn.lock().map_err(|e| e.to_string())?;
                if let Ok(running_bots) = db::bots::get_running(&conn) {
                    let app_handle = app.handle().clone();
                    let state_clone = Arc::clone(&state);
                    std::thread::spawn(move || {
                        let rt = tokio::runtime::Runtime::new().unwrap();
                        rt.block_on(async move {
                            tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
                            for bot in running_bots {
                                let _ = do_start_bot(state_clone.clone(), bot.id, app_handle.clone()).await;
                            }
                        });
                    });
                }
            }

            // Prune old logs on startup (keep last 7 days)
            {
                let conn = db.conn.lock().map_err(|e| e.to_string())?;
                let cutoff = (chrono::Utc::now() - chrono::Duration::days(7)).to_rfc3339();
                let _ = conn.execute("DELETE FROM logs WHERE ts < ?1", [&cutoff]);
                let _ = conn.execute("DELETE FROM logs_fts WHERE rowid IN (SELECT id FROM logs WHERE ts < ?1)", [&cutoff]);
            }

            let app_handle = app.handle().clone();
            std::thread::spawn(move || {
                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(async move {
                    let mut interval = tokio::time::interval(tokio::time::Duration::from_secs(3));
                    loop {
                        interval.tick().await;
                        for entry in pm.processes.iter() {
                            let proc = entry.value();
                            if let Some(pid) = proc.pid {
                                if matches!(proc.status, process::manager::BotStatus::Running) {
                                    mc.refresh(&proc.bot_id, pid);
                                    let _ = app_handle.emit("bot:metrics", serde_json::json!({
                                        "botId": proc.bot_id,
                                        "metrics": mc.get(&proc.bot_id),
                                    }));
                                }
                            }
                        }
                    }
                });
            });

            let app_handle_close = app.handle().clone();
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = app_handle_close.emit("window:close-requested", ());
                    }
                });
            }

            let show_i = tauri::menu::MenuItem::with_id(app, "show", "Show Buoy", true, None::<&str>)?;
            let quit_i = tauri::menu::MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = tauri::menu::Menu::with_items(app, &[&show_i, &quit_i])?;

            if let Some(icon) = app.default_window_icon().cloned() {
                let _ = tauri::tray::TrayIconBuilder::new()
                    .icon(icon)
                    .tooltip("Buoy — Keep your bots afloat")
                    .menu(&menu)
                    .on_menu_event(|app, event| {
                        match event.id().as_ref() {
                            "show" => {
                                if let Some(window) = app.get_webview_window("main") {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                            "quit" => {
                                // Gracefully stop all running bots before exit
                                let state = app.state::<Arc<AppState>>();
                                let conn = state.db.conn.lock().unwrap();
                                for entry in state.process_manager.processes.iter() {
                                    let proc = entry.value();
                                    if let Some(pid) = proc.pid {
                                        let _ = std::process::Command::new("taskkill")
                                            .args(["/PID", &pid.to_string(), "/F"])
                                            .output();
                                    }
                                    let _ = db::bots::set_running(&conn, &proc.bot_id, 0);
                                }
                                let _ = app.exit(0);
                            }
                            _ => {}
                        }
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let tauri::tray::TrayIconEvent::Click { .. } = event {
                            if let Some(window) = tray.app_handle().get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    })
                    .build(app);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_bots, get_bot, create_bot, update_bot, delete_bot,
            start_bot, stop_bot, restart_bot,
            get_bot_logs, clear_bot_logs, get_metrics,
            set_env_var, delete_env_var, list_env_vars,
            clone_repo, detect_runtime, install_deps,
            get_setting, set_setting, list_settings,
            minimize_window, maximize_window, hide_window, show_window, quit_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
