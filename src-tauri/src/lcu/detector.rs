use sysinfo::{ProcessesToUpdate, System};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::time::sleep;
use tracing::{info, debug};

#[derive(Clone)]
pub struct LolDetector {
    system: Arc<Mutex<System>>,
    is_running: Arc<Mutex<bool>>,
}

impl LolDetector {
    pub fn new() -> Self {
        Self {
            system: Arc::new(Mutex::new(System::new_all())),
            is_running: Arc::new(Mutex::new(false)),
        }
    }

    /// Check if League of Legends is currently running
    pub fn is_lol_running(&self) -> bool {
        let mut sys = self.system.lock().unwrap();
        sys.refresh_processes(ProcessesToUpdate::All, true);

        // Check for common LoL process names across platforms
        let lol_processes = [
            "LeagueClient",
            "LeagueClientUx",
            "League of Legends",
            "RiotClientUx",
            "Riot Client",
            "RiotClientServices",
            "LeagueOfLegends",
        ];

        for process in sys.processes().values() {
            let process_name = process.name().to_string_lossy().to_lowercase();

            for &lol_name in &lol_processes {
                if process_name.contains(&lol_name.to_lowercase()) {
                    info!("Found League of Legends process: {} (matched: {})", process.name().to_string_lossy(), lol_name);
                    return true;
                }
            }
        }

        debug!("League of Legends not detected in {} running processes", sys.processes().len());
        false
    }

    /// Start monitoring for League of Legends process
    pub async fn start_monitoring<F>(&self, callback: F)
    where
        F: Fn(bool) + Send + 'static,
    {
        let detector = self.clone();
        *detector.is_running.lock().unwrap() = true;

        tokio::spawn(async move {
            let mut was_running = false;

            while *detector.is_running.lock().unwrap() {
                let is_running = detector.is_lol_running();

                if is_running != was_running {
                    if is_running {
                        info!("League of Legends has started!");
                    } else {
                        info!("League of Legends has stopped!");
                    }
                    callback(is_running);
                    was_running = is_running;
                }

                sleep(Duration::from_secs(2)).await;
            }
        });
    }

    /// Stop monitoring
    pub fn stop_monitoring(&self) {
        *self.is_running.lock().unwrap() = false;
        info!("Stopped League of Legends monitoring");
    }

    /// Get the League of Legends install path (platform-specific)
    pub fn get_lol_path() -> Option<String> {
        #[cfg(target_os = "windows")]
        {
            // Common Windows paths
            let paths = vec![
                "C:\\Riot Games\\League of Legends",
                "C:\\Program Files\\Riot Games\\League of Legends",
                "C:\\Program Files (x86)\\Riot Games\\League of Legends",
            ];

            for path in paths {
                if std::path::Path::new(path).exists() {
                    return Some(path.to_string());
                }
            }
        }

        #[cfg(target_os = "macos")]
        {
            let path = "/Applications/League of Legends.app";
            if std::path::Path::new(path).exists() {
                return Some(path.to_string());
            }
        }

        None
    }
}

impl Default for LolDetector {
    fn default() -> Self {
        Self::new()
    }
}
