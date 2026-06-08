use std::process::Stdio;
use tokio::process::Command;

pub fn build_command(
    program: &str,
    runtime: &str,
    path: &str,
    entry_point: &str,
    args: &[String],
    env_vars: &[(String, String)],
) -> Result<Command, String> {
    let extra_args: Vec<String> = match runtime {
        "node" => {
            if entry_point.ends_with(".ts") {
                vec!["tsx".to_string(), entry_point.to_string()]
            } else {
                vec![entry_point.to_string()]
            }
        }
        "python" => vec![entry_point.to_string()],
        "custom" => {
            let parts: Vec<&str> = entry_point.split_whitespace().collect();
            if parts.is_empty() {
                return Err("Custom entry point is empty".to_string());
            }
            parts[1..].iter().map(|s| s.to_string()).collect()
        }
        _ => return Err(format!("Unknown runtime: {}", runtime)),
    };

    let mut cmd = Command::new(program);
    cmd.current_dir(path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .kill_on_drop(true);

    for arg in &extra_args {
        cmd.arg(arg);
    }
    for arg in args {
        cmd.arg(arg);
    }
    for (key, value) in env_vars {
        cmd.env(key, value);
    }

    Ok(cmd)
}
