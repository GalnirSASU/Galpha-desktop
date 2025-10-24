use anyhow::{Context, Result};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tracing::{debug, error, info, warn};

pub struct RecordingSession {
    pub id: String,
    pub start_time: u64,
    pub output_path: PathBuf,
    pub quality: RecordingQuality,
    pub status: RecordingStatus,
    pub ffmpeg_process: Option<Child>,
}

#[derive(Debug, Clone, Copy, serde::Serialize, serde::Deserialize)]
pub enum RecordingQuality {
    Low,    // 720p 30fps
    Medium, // 1080p 30fps
    High,   // 1080p 60fps
    Ultra,  // 1440p 60fps
}

impl RecordingQuality {
    pub fn to_fps(&self) -> u32 {
        match self {
            RecordingQuality::Low | RecordingQuality::Medium => 30,
            RecordingQuality::High | RecordingQuality::Ultra => 60,
        }
    }

    pub fn to_resolution(&self) -> (u32, u32) {
        match self {
            RecordingQuality::Low => (1280, 720),
            RecordingQuality::Medium | RecordingQuality::High => (1920, 1080),
            RecordingQuality::Ultra => (2560, 1440),
        }
    }

    pub fn to_bitrate(&self) -> &str {
        match self {
            RecordingQuality::Low => "2500k",
            RecordingQuality::Medium => "5000k",
            RecordingQuality::High => "8000k",
            RecordingQuality::Ultra => "12000k",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum RecordingStatus {
    Recording,
    Stopped,
    Failed,
}

pub struct Recorder {
    current_session: Arc<Mutex<Option<RecordingSession>>>,
}

impl Recorder {
    pub fn new() -> Self {
        Self {
            current_session: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn start_recording(
        &self,
        output_dir: PathBuf,
        quality: RecordingQuality,
    ) -> Result<String> {
        // Check if already recording
        {
            let session = self.current_session.lock().unwrap();
            if let Some(s) = &*session {
                if s.status == RecordingStatus::Recording {
                    return Err(anyhow::anyhow!("Recording already in progress"));
                }
            }
        }

        // Create unique session ID
        let session_id = uuid::Uuid::new_v4().to_string();
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Ensure output directory exists
        if !output_dir.exists() {
            std::fs::create_dir_all(&output_dir)
                .context("Failed to create output directory")?;
        }

        // Create output path
        let filename = format!("galpha_recording_{}_{}.mp4", timestamp, &session_id[..8]);
        let output_path = output_dir.join(filename);

        info!(
            "Starting recording session {} to {:?}",
            session_id, output_path
        );

        // Start FFmpeg process
        let ffmpeg_process = self.start_ffmpeg(&output_path, quality)?;

        // Create recording session
        let session = RecordingSession {
            id: session_id.clone(),
            start_time: timestamp,
            output_path: output_path.clone(),
            quality,
            status: RecordingStatus::Recording,
            ffmpeg_process: Some(ffmpeg_process),
        };

        // Store session
        {
            let mut current = self.current_session.lock().unwrap();
            *current = Some(session);
        }

        Ok(session_id)
    }

    fn start_ffmpeg(&self, output_path: &PathBuf, quality: RecordingQuality) -> Result<Child> {
        let (width, height) = quality.to_resolution();
        let fps = quality.to_fps();
        let bitrate = quality.to_bitrate();

        // Platform-specific FFmpeg command
        #[cfg(target_os = "macos")]
        {
            // macOS recording is currently disabled due to compatibility issues
            return Err(anyhow::anyhow!(
                "L'enregistrement vidéo n'est pas encore supporté sur macOS. \
                Cette fonctionnalité est disponible sur Windows uniquement."
            ));
        }

        #[cfg(target_os = "windows")]
        let mut cmd = {
            let mut c = Command::new("ffmpeg");
            // For Windows, capture screen with gdigrab
            // Note: This captures video only. Audio capture on Windows requires specific device names
            // which vary per system. Users can add audio manually if needed.
            c.args(&[
                "-f",
                "gdigrab",
                "-framerate",
                &fps.to_string(),
                "-draw_mouse",
                "1",
                "-i",
                "desktop",
                "-vf",
                &format!("scale={}:{}", width, height),
                "-c:v",
                "libx264",
                "-preset",
                "ultrafast",
                "-crf",
                "23",
                "-b:v",
                bitrate,
                "-pix_fmt",
                "yuv420p",
                "-y",
                output_path.to_str().unwrap(),
            ]);
            c
        };

        #[cfg(target_os = "linux")]
        let mut cmd = {
            let mut c = Command::new("ffmpeg");
            c.args(&[
                "-f",
                "x11grab",
                "-framerate",
                &fps.to_string(),
                "-video_size",
                &format!("{}x{}", width, height),
                "-i",
                ":0.0",
                "-c:v",
                "libx264",
                "-preset",
                "ultrafast",
                "-b:v",
                bitrate,
                "-y",
                output_path.to_str().unwrap(),
            ]);
            c
        };

        cmd.stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .context("Failed to start FFmpeg process")
    }

    pub async fn stop_recording(&self) -> Result<String> {
        // Extract process and info while holding the lock, then release it
        let (mut process_opt, session_id, output_path) = {
            let mut session = self.current_session.lock().unwrap();

            match session.as_mut() {
                Some(s) if s.status == RecordingStatus::Recording => {
                    info!("Stopping recording session {}", s.id);
                    let process = s.ffmpeg_process.take();
                    let id = s.id.clone();
                    let path = s.output_path.to_string_lossy().to_string();
                    s.status = RecordingStatus::Stopped;
                    (process, id, path)
                }
                _ => return Err(anyhow::anyhow!("No active recording session")),
            }
        }; // Lock is released here

        // Now handle the process without holding the lock
        if let Some(mut process) = process_opt.take() {
            // Send signal to FFmpeg to stop recording gracefully
            #[cfg(unix)]
            {
                unsafe {
                    libc::kill(process.id() as i32, libc::SIGINT);
                }
            }

            #[cfg(windows)]
            {
                let _ = process.kill();
            }

            // Wait for process to finish (without holding lock)
            tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
            let _ = process.wait();
        }

        info!("Recording saved to: {}", output_path);
        Ok(output_path)
    }

    pub fn get_status(&self) -> Option<RecordingStatus> {
        let session = self.current_session.lock().unwrap();
        session.as_ref().map(|s| s.status)
    }

    pub fn is_recording(&self) -> bool {
        let session = self.current_session.lock().unwrap();
        matches!(
            &*session,
            Some(s) if s.status == RecordingStatus::Recording
        )
    }
}

impl Drop for RecordingSession {
    fn drop(&mut self) {
        // Ensure FFmpeg process is killed when session is dropped
        if let Some(mut process) = self.ffmpeg_process.take() {
            let _ = process.kill();
            warn!("FFmpeg process forcefully killed during session cleanup");
        }
    }
}
