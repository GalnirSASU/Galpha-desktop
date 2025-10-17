use sqlx::{SqlitePool, sqlite::SqlitePoolOptions};
use anyhow::Result;
use tracing::{info, debug};
use std::path::PathBuf;

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    /// Create a new database connection
    pub async fn new(db_path: Option<PathBuf>) -> Result<Self> {
        let path = db_path.unwrap_or_else(|| {
            let mut path = dirs::data_local_dir()
                .unwrap_or_else(|| PathBuf::from("."));
            path.push("galpha");

            // Ensure the directory exists
            if let Err(e) = std::fs::create_dir_all(&path) {
                tracing::error!("Failed to create database directory: {}", e);
            }

            path.push("galpha.db");
            path
        });

        info!("Opening database at: {:?}", path);

        // Ensure parent directory exists
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        // Use sqlite:// protocol with create mode to ensure the database file is created
        let database_url = format!("sqlite://{}?mode=rwc", path.display());

        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await?;

        let db = Self { pool };

        db.run_migrations().await?;

        info!("Database initialized successfully");

        Ok(db)
    }

    /// Run database migrations
    async fn run_migrations(&self) -> Result<()> {
        debug!("Running database migrations");

        // Create summoner table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS summoner (
                puuid TEXT PRIMARY KEY,
                game_name TEXT NOT NULL,
                tag_line TEXT NOT NULL,
                summoner_id INTEGER,
                account_id INTEGER,
                summoner_level INTEGER,
                profile_icon_id INTEGER,
                last_updated INTEGER NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create matches table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS matches (
                match_id TEXT PRIMARY KEY,
                game_creation INTEGER NOT NULL,
                game_duration INTEGER NOT NULL,
                game_mode TEXT NOT NULL,
                game_type TEXT NOT NULL,
                queue_id INTEGER NOT NULL,
                map_id INTEGER NOT NULL,
                platform_id TEXT NOT NULL,
                game_version TEXT NOT NULL,
                data JSON NOT NULL,
                created_at INTEGER NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create participant stats table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS participant_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                match_id TEXT NOT NULL,
                puuid TEXT NOT NULL,
                champion_id INTEGER NOT NULL,
                champion_name TEXT NOT NULL,
                team_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                win INTEGER NOT NULL,
                kills INTEGER NOT NULL,
                deaths INTEGER NOT NULL,
                assists INTEGER NOT NULL,
                damage_dealt INTEGER NOT NULL,
                damage_taken INTEGER NOT NULL,
                gold_earned INTEGER NOT NULL,
                cs INTEGER NOT NULL,
                vision_score INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (match_id) REFERENCES matches(match_id),
                FOREIGN KEY (puuid) REFERENCES summoner(puuid)
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create indexes
        sqlx::query(
            "CREATE INDEX IF NOT EXISTS idx_participant_stats_puuid ON participant_stats(puuid)"
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            "CREATE INDEX IF NOT EXISTS idx_participant_stats_match_id ON participant_stats(match_id)"
        )
        .execute(&self.pool)
        .await?;

        sqlx::query(
            "CREATE INDEX IF NOT EXISTS idx_matches_game_creation ON matches(game_creation)"
        )
        .execute(&self.pool)
        .await?;

        // Create ranked stats cache table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS ranked_stats_cache (
                puuid TEXT PRIMARY KEY,
                tier TEXT,
                rank_value TEXT,
                league_points INTEGER,
                wins INTEGER,
                losses INTEGER,
                queue_type TEXT NOT NULL,
                cached_at INTEGER NOT NULL,
                FOREIGN KEY (puuid) REFERENCES summoner(puuid)
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create match cache metadata table for tracking what's cached
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS match_cache_metadata (
                puuid TEXT PRIMARY KEY,
                last_match_id TEXT,
                last_fetched INTEGER NOT NULL,
                total_cached INTEGER NOT NULL,
                FOREIGN KEY (puuid) REFERENCES summoner(puuid)
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        // Create settings table for API keys and configuration
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at INTEGER NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await?;

        debug!("Database migrations completed");

        Ok(())
    }

    /// Get the database pool
    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }
}
