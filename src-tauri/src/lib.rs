mod lcu;
mod riot_api;
mod database;
mod discord;

use lcu::{LolDetector, LcuConnector};
use riot_api::{RiotApiClient, MatchDetails};
use database::{Database, DbSummoner, DbMatch, PlayerStats, RankedStatsCache, MatchCacheMetadata};
use discord::{DiscordOAuth, DiscordUser};
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    init_logging();

    let detector = Arc::new(Mutex::new(LolDetector::new()));
    let db = Arc::new(Mutex::new(None));
    let api_key = Arc::new(Mutex::new(None));
    let region = Arc::new(Mutex::new("euw1".to_string()));

    let app_state = AppState {
        detector,
        db,
        api_key,
        region,
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            check_lol_running,
            get_current_summoner,
            initialize_database,
            save_summoner,
            get_player_stats,
            initialize_riot_client,
            fetch_match_history,
            get_recent_matches,
            get_account_by_riot_id,
            get_summoner_by_puuid,
            get_ranked_stats,
            get_match_details,
            fetch_match_details_cached,
            get_cached_matches,
            discord_login,
            get_api_key,
            set_api_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
