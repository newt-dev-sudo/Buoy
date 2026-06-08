use dashmap::DashMap;
use std::sync::Mutex;
use sysinfo::System;

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BotMetrics {
    pub bot_id: String,
    pub cpu_pct: f64,
    pub mem_mb: f64,
    pub uptime_secs: u64,
}

pub struct MetricsCollector {
    pub system: Mutex<System>,
    pub metrics: DashMap<String, BotMetrics>,
}

impl MetricsCollector {
    pub fn new() -> Self {
        Self {
            system: Mutex::new(System::new_all()),
            metrics: DashMap::new(),
        }
    }

    pub fn refresh(&self, bot_id: &str, pid: u32) {
        let mut sys = self.system.lock().unwrap();
        sys.refresh_process(sysinfo::Pid::from(pid as usize));

        if let Some(process) = sys.process(sysinfo::Pid::from(pid as usize)) {
            let mem_bytes = process.memory();
            let mem_mb = mem_bytes as f64 / (1024.0 * 1024.0);
            let cpu_pct = process.cpu_usage() as f64;
            let uptime_secs = process.run_time();

            self.metrics.insert(
                bot_id.to_string(),
                BotMetrics {
                    bot_id: bot_id.to_string(),
                    cpu_pct,
                    mem_mb,
                    uptime_secs,
                },
            );
        }
    }

    pub fn get(&self, bot_id: &str) -> Option<BotMetrics> {
        self.metrics.get(bot_id).map(|m| m.clone())
    }
}

impl Default for MetricsCollector {
    fn default() -> Self {
        Self::new()
    }
}
