use dashmap::DashMap;
use std::sync::Arc;
use tokio::process::Child;

#[derive(Debug, Clone)]
pub enum BotStatus {
    Stopped,
    Starting,
    Running,
    Stopping,
    Crashed,
}

impl ToString for BotStatus {
    fn to_string(&self) -> String {
        match self {
            BotStatus::Stopped => "stopped".to_string(),
            BotStatus::Starting => "starting".to_string(),
            BotStatus::Running => "running".to_string(),
            BotStatus::Stopping => "stopping".to_string(),
            BotStatus::Crashed => "crashed".to_string(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct BotProcess {
    pub bot_id: String,
    pub child: Option<Arc<tokio::sync::Mutex<Child>>>,
    pub status: BotStatus,
    pub pid: Option<u32>,
    pub start_time: Option<chrono::DateTime<chrono::Utc>>,
    pub crash_count: u32,
    pub last_crash: Option<chrono::DateTime<chrono::Utc>>,
}

pub struct ProcessManager {
    pub processes: DashMap<String, BotProcess>,
}

impl ProcessManager {
    pub fn new() -> Self {
        Self {
            processes: DashMap::new(),
        }
    }

    pub fn get_status(&self, bot_id: &str) -> Option<BotStatus> {
        self.processes.get(bot_id).map(|p| p.status.clone())
    }

    pub fn get_pid(&self, bot_id: &str) -> Option<u32> {
        self.processes.get(bot_id).and_then(|p| p.pid)
    }

    pub fn set_status(&self, bot_id: &str, status: BotStatus) {
        if let Some(mut p) = self.processes.get_mut(bot_id) {
            p.status = status;
        }
    }

    pub fn record_crash(&self, bot_id: &str) {
        if let Some(mut p) = self.processes.get_mut(bot_id) {
            p.crash_count += 1;
            p.last_crash = Some(chrono::Utc::now());
            p.status = BotStatus::Crashed;
        }
    }

    pub fn reset_crash_count(&self, bot_id: &str) {
        if let Some(mut p) = self.processes.get_mut(bot_id) {
            p.crash_count = 0;
        }
    }
}

impl Default for ProcessManager {
    fn default() -> Self {
        Self::new()
    }
}
