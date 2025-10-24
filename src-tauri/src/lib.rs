mod lcu;
mod riot_api;
mod database;
mod discord;
mod recorder;

use lcu::{LolDetector, LcuConnector, ActiveGameInfo};
use riot_api::{RiotApiClient, MatchDetails};
use database::{Database, DbSummoner, DbMatch, PlayerStats, RankedStatsCache, MatchCacheMetadata};
use discord::{DiscordOAuth, DiscordUser};
use recorder::{Recorder, RecordingQuality};
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::State;
use chrono::Utc;
use tracing_subscriber;
use tracing::{info, warn};

// Application state - simplified to avoid Send issues
pub struct AppState {
    detector: Arc<Mutex<LolDetector>>,
    db: Arc<Mutex<Option<Database>>>,
    api_key: Arc<Mutex<Option<String>>>,
    region: Arc<Mutex<String>>,
    recorder: Arc<Mutex<Recorder>>,
}

// Initialize logging
fn init_logging() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();
}

// Tauri commands
#[tauri::command]
async fn check_lol_running(state: State<'_, AppState>) -> Result<bool, String> {
    let detector = state.detector.lock().await;
    Ok(detector.is_lol_running())
}

#[tauri::command]
async fn get_current_summoner(_state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let connector = LcuConnector::new().await
        .map_err(|e| format!("Failed to connect to LCU: {}", e))?;

    let summoner = connector.get_current_summoner().await
        .map_err(|e| format!("Failed to get summoner: {}", e))?;

    Ok(serde_json::to_value(summoner).unwrap())
}

#[tauri::command]
async fn get_active_game(_state: State<'_, AppState>) -> Result<Option<ActiveGameInfo>, String> {
    let connector = LcuConnector::new().await
        .map_err(|e| format!("Failed to connect to LCU: {}", e))?;

    let active_game = connector.get_active_game().await
        .map_err(|e| format!("Failed to get active game: {}", e))?;

    Ok(active_game)
}

#[tauri::command]
async fn initialize_database(state: State<'_, AppState>) -> Result<(), String> {
    let db = Database::new(None).await
        .map_err(|e| format!("Failed to initialize database: {}", e))?;

    let mut db_lock = state.db.lock().await;
    *db_lock = Some(db);

    Ok(())
}

#[tauri::command]
async fn save_summoner(
    state: State<'_, AppState>,
    puuid: String,
    game_name: String,
    tag_line: String,
    summoner_level: Option<i32>,
    profile_icon_id: Option<i32>,
) -> Result<(), String> {
    let db_lock = state.db.lock().await;
    let db = db_lock.as_ref()
        .ok_or("Database not initialized")?;

    let summoner = DbSummoner {
        puuid,
        game_name,
        tag_line,
        summoner_id: None,
        account_id: None,
        summoner_level,
        profile_icon_id,
        last_updated: Utc::now().timestamp(),
    };

    summoner.insert_or_update(db.pool()).await
        .map_err(|e| format!("Failed to save summoner: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn get_player_stats(
    state: State<'_, AppState>,
    puuid: String,
) -> Result<serde_json::Value, String> {
    let db_lock = state.db.lock().await;
    let db = db_lock.as_ref()
        .ok_or("Database not initialized")?;

    let stats = PlayerStats::calculate(db.pool(), &puuid).await
        .map_err(|e| format!("Failed to calculate stats: {}", e))?;

    Ok(serde_json::to_value(stats).unwrap())
}

#[tauri::command]
async fn initialize_riot_client(
    state: State<'_, AppState>,
    api_key: String,
    region: String,
) -> Result<(), String> {
    let mut key_lock = state.api_key.lock().await;
    *key_lock = Some(api_key);

    let mut region_lock = state.region.lock().await;
    *region_lock = region;

    Ok(())
}

#[tauri::command]
async fn fetch_match_history(
    state: State<'_, AppState>,
    puuid: String,
    count: usize,
) -> Result<Vec<String>, String> {
    // Create client on demand to avoid Send issues
    let key_lock = state.api_key.lock().await;
    let api_key = key_lock.as_ref()
        .ok_or("Riot API client not initialized")?.clone();
    drop(key_lock);

    let region_lock = state.region.lock().await;
    let region = region_lock.clone();
    drop(region_lock);

    let client = RiotApiClient::new(api_key, region);
    let match_ids = client.get_match_ids(&puuid, 0, count).await
        .map_err(|e| format!("Failed to fetch match IDs: {}", e))?;

    Ok(match_ids)
}

#[tauri::command]
async fn get_recent_matches(
    state: State<'_, AppState>,
    limit: i32,
) -> Result<Vec<serde_json::Value>, String> {
    let db_lock = state.db.lock().await;
    let db = db_lock.as_ref()
        .ok_or("Database not initialized")?;

    let matches = DbMatch::get_all(db.pool(), limit).await
        .map_err(|e| format!("Failed to get matches: {}", e))?;

    let json_matches: Vec<serde_json::Value> = matches
        .into_iter()
        .map(|m| serde_json::to_value(m).unwrap())
        .collect();

    Ok(json_matches)
}

#[tauri::command]
async fn get_account_by_riot_id(
    state: State<'_, AppState>,
    game_name: String,
    tag_line: String,
) -> Result<serde_json::Value, String> {
    // Get API key and region
    let key_lock = state.api_key.lock().await;
    let api_key = key_lock.as_ref()
        .ok_or("Riot API client not initialized. Please set your API key first.")?.clone();
    drop(key_lock);

    let region_lock = state.region.lock().await;
    let region = region_lock.clone();
    drop(region_lock);

    // Create client and fetch account
    let client = RiotApiClient::new(api_key, region);
    let account = client.get_account_by_riot_id(&game_name, &tag_line).await
        .map_err(|e| format!("Failed to fetch account: {}", e))?;

    Ok(serde_json::to_value(account).unwrap())
}

#[tauri::command]
async fn get_summoner_by_puuid(
    state: State<'_, AppState>,
    puuid: String,
) -> Result<serde_json::Value, String> {
    // Get API key and region
    let key_lock = state.api_key.lock().await;
    let api_key = key_lock.as_ref()
        .ok_or("Riot API client not initialized")?.clone();
    drop(key_lock);

    let region_lock = state.region.lock().await;
    let region = region_lock.clone();
    drop(region_lock);

    // Create client and fetch summoner
    let client = RiotApiClient::new(api_key, region);
    let summoner = client.get_summoner_by_puuid(&puuid).await
        .map_err(|e| format!("Failed to fetch summoner: {}", e))?;

    Ok(serde_json::to_value(summoner).unwrap())
}

#[tauri::command]
async fn get_ranked_stats(
    state: State<'_, AppState>,
    summoner_id: String,
) -> Result<serde_json::Value, String> {
    // Get API key and region
    let key_lock = state.api_key.lock().await;
    let api_key = key_lock.as_ref()
        .ok_or("Riot API client not initialized")?.clone();
    drop(key_lock);

    let region_lock = state.region.lock().await;
    let region = region_lock.clone();
    drop(region_lock);

    // Create client and fetch ranked stats
    let client = RiotApiClient::new(api_key, region);
    let ranked_stats = client.get_ranked_stats(&summoner_id).await
        .map_err(|e| format!("Failed to fetch ranked stats: {}", e))?;

    Ok(serde_json::to_value(ranked_stats).unwrap())
}

#[tauri::command]
async fn get_ranked_stats_by_puuid(
    state: State<'_, AppState>,
    puuid: String,
) -> Result<serde_json::Value, String> {
    // Get API key and region
    let key_lock = state.api_key.lock().await;
    let api_key = key_lock.as_ref()
        .ok_or("Riot API client not initialized")?.clone();
    drop(key_lock);

    let region_lock = state.region.lock().await;
    let region = region_lock.clone();
    drop(region_lock);

    // Create client and fetch ranked stats by PUUID
    let client = RiotApiClient::new(api_key, region);
    let ranked_stats = client.get_ranked_stats_by_puuid(&puuid).await
        .map_err(|e| format!("Failed to fetch ranked stats by PUUID: {}", e))?;

    Ok(serde_json::to_value(ranked_stats).unwrap())
}

#[tauri::command]
async fn get_match_details(
    state: State<'_, AppState>,
    match_id: String,
) -> Result<serde_json::Value, String> {
    let key_lock = state.api_key.lock().await;
    let api_key = key_lock.as_ref()
        .ok_or("Riot API client not initialized")?.clone();
    drop(key_lock);

    let region_lock = state.region.lock().await;
    let region = region_lock.clone();
    drop(region_lock);

    let client = RiotApiClient::new(api_key, region);
    let match_details = client.get_match_details(&match_id).await
        .map_err(|e| format!("Failed to fetch match details: {}", e))?;

    Ok(serde_json::to_value(match_details).unwrap())
}

// NEW: Smart fetch with caching
#[tauri::command]
async fn fetch_match_details_cached(
    state: State<'_, AppState>,
    match_id: String,
) -> Result<serde_json::Value, String> {
    let db_lock = state.db.lock().await;
    let db = db_lock.as_ref().ok_or("Database not initialized")?;

    // Check cache first
    if let Ok(Some(cached_match)) = DbMatch::get_by_match_id(db.pool(), &match_id).await {
        info!("Cache HIT for match {}", match_id);
        return Ok(serde_json::from_str(&cached_match.data).unwrap());
    }

    info!("Cache MISS for match {}", match_id);

    // Not in cache, fetch from API
    let key_lock = state.api_key.lock().await;
    let api_key = key_lock.as_ref().ok_or("Riot API client not initialized")?.clone();
    drop(key_lock);

    let region_lock = state.region.lock().await;
    let region = region_lock.clone();
    drop(region_lock);

    let client = RiotApiClient::new(api_key, region);
    let match_details = client.get_match_details(&match_id).await
        .map_err(|e| format!("Failed to fetch match details: {}", e))?;

    // Store in cache
    let db_match = DbMatch {
        match_id: match_details.metadata.match_id.clone(),
        game_creation: match_details.info.game_creation,
        game_duration: match_details.info.game_duration,
        game_mode: match_details.info.game_mode.clone(),
        game_type: match_details.info.game_type.clone(),
        queue_id: match_details.info.queue_id,
        map_id: match_details.info.map_id,
        platform_id: match_details.info.platform_id.clone(),
        game_version: match_details.info.game_version.clone(),
        data: serde_json::to_string(&match_details).unwrap(),
        created_at: Utc::now().timestamp(),
    };

    if let Err(e) = db_match.insert(db.pool()).await {
        warn!("Failed to cache match {}: {}", match_id, e);
    }

    Ok(serde_json::to_value(match_details).unwrap())
}

// NEW: Get cached matches for a player
#[tauri::command]
async fn get_cached_matches(
    state: State<'_, AppState>,
    puuid: String,
    limit: i32,
) -> Result<Vec<serde_json::Value>, String> {
    let db_lock = state.db.lock().await;
    let db = db_lock.as_ref().ok_or("Database not initialized")?;

    let matches = DbMatch::get_by_puuid(db.pool(), &puuid, limit).await
        .map_err(|e| format!("Failed to get cached matches: {}", e))?;

    let json_matches: Vec<serde_json::Value> = matches
        .into_iter()
        .filter_map(|m| serde_json::from_str(&m.data).ok())
        .collect();

    Ok(json_matches)
}

#[tauri::command]
async fn discord_login(client_id: String) -> Result<DiscordUser, String> {
    let oauth = DiscordOAuth::new(client_id, None);

    let (user, _access_token) = oauth.authenticate().await
        .map_err(|e| format!("Discord authentication failed: {}", e))?;

    // TODO: Store access_token securely for future API calls

    Ok(user)
}

// Get API key from database
#[tauri::command]
async fn get_api_key(state: State<'_, AppState>) -> Result<Option<String>, String> {
    // Ensure database is initialized
    {
        let mut db_lock = state.db.lock().await;
        if db_lock.is_none() {
            let database = Database::new(None).await
                .map_err(|e| format!("Failed to initialize database: {}", e))?;
            *db_lock = Some(database);
            info!("Database initialized for API key retrieval");
        }
    }

    let db_lock = state.db.lock().await;
    let db = db_lock.as_ref().ok_or("Database not initialized")?;

    let result = sqlx::query_as::<_, (String,)>(
        "SELECT value FROM settings WHERE key = 'riot_api_key'"
    )
    .fetch_optional(db.pool())
    .await
    .map_err(|e| format!("Failed to get API key: {}", e))?;

    Ok(result.map(|(value,)| value))
}

// Save API key to database
#[tauri::command]
async fn set_api_key(state: State<'_, AppState>, api_key: String) -> Result<(), String> {
    // Ensure database is initialized
    {
        let mut db_lock = state.db.lock().await;
        if db_lock.is_none() {
            let database = Database::new(None).await
                .map_err(|e| format!("Failed to initialize database: {}", e))?;
            *db_lock = Some(database);
            info!("Database initialized for API key storage");
        }
    }

    let db_lock = state.db.lock().await;
    let db = db_lock.as_ref().ok_or("Database not initialized")?;

    let now = Utc::now().timestamp();

    sqlx::query(
        "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('riot_api_key', ?, ?)"
    )
    .bind(&api_key)
    .bind(now)
    .execute(db.pool())
    .await
    .map_err(|e| format!("Failed to save API key: {}", e))?;

    // Update the in-memory API key
    let mut api_key_lock = state.api_key.lock().await;
    *api_key_lock = Some(api_key);

    Ok(())
}

// Recording commands
#[tauri::command]
async fn start_recording(
    state: State<'_, AppState>,
    output_dir: String,
    quality: String,
) -> Result<String, String> {
    let recorder = state.recorder.lock().await;

    let quality_enum = match quality.as_str() {
        "low" => RecordingQuality::Low,
        "medium" => RecordingQuality::Medium,
        "high" => RecordingQuality::High,
        "ultra" => RecordingQuality::Ultra,
        _ => RecordingQuality::High,
    };

    let output_path = std::path::PathBuf::from(output_dir);

    recorder.start_recording(output_path, quality_enum)
        .await
        .map_err(|e| format!("Failed to start recording: {}", e))
}

#[tauri::command]
async fn stop_recording(state: State<'_, AppState>) -> Result<String, String> {
    let recorder = state.recorder.lock().await;

    recorder.stop_recording()
        .await
        .map_err(|e| format!("Failed to stop recording: {}", e))
}

#[tauri::command]
async fn is_recording(state: State<'_, AppState>) -> Result<bool, String> {
    let recorder = state.recorder.lock().await;
    Ok(recorder.is_recording())
}

#[tauri::command]
async fn list_recordings(directory: String) -> Result<Vec<serde_json::Value>, String> {
    use std::fs;
    use std::path::Path;

    let dir_path = Path::new(&directory);

    if !dir_path.exists() {
        return Ok(Vec::new());
    }

    let mut recordings = Vec::new();

    match fs::read_dir(dir_path) {
        Ok(entries) => {
            for entry in entries.flatten() {
                let path = entry.path();

                // Only include .mp4 files that match our naming pattern
                if let Some(extension) = path.extension() {
                    if extension == "mp4" {
                        if let Some(file_name) = path.file_name() {
                            let file_name_str = file_name.to_string_lossy();

                            // Check if it's a galpha recording
                            if file_name_str.starts_with("galpha_recording_") {
                                if let Ok(metadata) = fs::metadata(&path) {
                                    let recording = serde_json::json!({
                                        "filePath": path.to_str().unwrap(),
                                        "fileName": file_name_str,
                                        "fileSize": metadata.len(),
                                        "createdAt": metadata.created()
                                            .ok()
                                            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                                            .map(|d| d.as_secs())
                                            .unwrap_or(0),
                                    });
                                    recordings.push(recording);
                                }
                            }
                        }
                    }
                }
            }
        }
        Err(e) => return Err(format!("Failed to read directory: {}", e)),
    }

    // Sort by creation date (newest first)
    recordings.sort_by(|a, b| {
        let time_a = a["createdAt"].as_u64().unwrap_or(0);
        let time_b = b["createdAt"].as_u64().unwrap_or(0);
        time_b.cmp(&time_a)
    });

    Ok(recordings)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_logging();

    let detector = Arc::new(Mutex::new(LolDetector::new()));
    let db = Arc::new(Mutex::new(None));
    let api_key = Arc::new(Mutex::new(None));
    let region = Arc::new(Mutex::new("euw1".to_string()));
    let recorder = Arc::new(Mutex::new(Recorder::new()));

    let app_state = AppState {
        detector,
        db,
        api_key,
        region,
        recorder,
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            check_lol_running,
            get_current_summoner,
            get_active_game,
            initialize_database,
            save_summoner,
            get_player_stats,
            initialize_riot_client,
            fetch_match_history,
            get_recent_matches,
            get_account_by_riot_id,
            get_summoner_by_puuid,
            get_ranked_stats,
            get_ranked_stats_by_puuid,
            get_match_details,
            fetch_match_details_cached,
            get_cached_matches,
            discord_login,
            get_api_key,
            set_api_key,
            start_recording,
            stop_recording,
            is_recording,
            list_recordings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
