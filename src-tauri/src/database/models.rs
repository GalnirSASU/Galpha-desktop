use serde::{Deserialize, Serialize};
use sqlx::{FromRow, SqlitePool};
use anyhow::Result;
use chrono::Utc;

const CACHE_TTL_SECONDS: i64 = 300; // 5 minutes cache

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DbSummoner {
    pub puuid: String,
    pub game_name: String,
    pub tag_line: String,
    pub summoner_id: Option<i64>,
    pub account_id: Option<i64>,
    pub summoner_level: Option<i32>,
    pub profile_icon_id: Option<i32>,
    pub last_updated: i64,
}

impl DbSummoner {
    pub async fn insert_or_update(&self, pool: &SqlitePool) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO summoner (puuid, game_name, tag_line, summoner_id, account_id, summoner_level, profile_icon_id, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(puuid) DO UPDATE SET
                game_name = excluded.game_name,
                tag_line = excluded.tag_line,
                summoner_id = excluded.summoner_id,
                account_id = excluded.account_id,
                summoner_level = excluded.summoner_level,
                profile_icon_id = excluded.profile_icon_id,
                last_updated = excluded.last_updated
            "#,
        )
        .bind(&self.puuid)
        .bind(&self.game_name)
        .bind(&self.tag_line)
        .bind(self.summoner_id)
        .bind(self.account_id)
        .bind(self.summoner_level)
        .bind(self.profile_icon_id)
        .bind(self.last_updated)
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn get_by_puuid(pool: &SqlitePool, puuid: &str) -> Result<Option<Self>> {
        let summoner = sqlx::query_as::<_, Self>(
            "SELECT * FROM summoner WHERE puuid = ?"
        )
        .bind(puuid)
        .fetch_optional(pool)
        .await?;

        Ok(summoner)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DbMatch {
    pub match_id: String,
    pub game_creation: i64,
    pub game_duration: i64,
    pub game_mode: String,
    pub game_type: String,
    pub queue_id: i32,
    pub map_id: i32,
    pub platform_id: String,
    pub game_version: String,
    pub data: String, // JSON
    pub created_at: i64,
}

impl DbMatch {
    pub async fn insert(&self, pool: &SqlitePool) -> Result<()> {
        sqlx::query(
            r#"
            INSERT OR IGNORE INTO matches (match_id, game_creation, game_duration, game_mode, game_type, queue_id, map_id, platform_id, game_version, data, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&self.match_id)
        .bind(self.game_creation)
        .bind(self.game_duration)
        .bind(&self.game_mode)
        .bind(&self.game_type)
        .bind(self.queue_id)
        .bind(self.map_id)
        .bind(&self.platform_id)
        .bind(&self.game_version)
        .bind(&self.data)
        .bind(self.created_at)
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn exists(pool: &SqlitePool, match_id: &str) -> Result<bool> {
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM matches WHERE match_id = ?"
        )
        .bind(match_id)
        .fetch_one(pool)
        .await?;

        Ok(count.0 > 0)
    }

    pub async fn get_all(pool: &SqlitePool, limit: i32) -> Result<Vec<Self>> {
        let matches = sqlx::query_as::<_, Self>(
            "SELECT * FROM matches ORDER BY game_creation DESC LIMIT ?"
        )
        .bind(limit)
        .fetch_all(pool)
        .await?;

        Ok(matches)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DbParticipantStat {
    pub id: Option<i64>,
    pub match_id: String,
    pub puuid: String,
    pub champion_id: i32,
    pub champion_name: String,
    pub team_id: i32,
    pub role: String,
    pub win: i32,
    pub kills: i32,
    pub deaths: i32,
    pub assists: i32,
    pub damage_dealt: i32,
    pub damage_taken: i32,
    pub gold_earned: i32,
    pub cs: i32,
    pub vision_score: i32,
    pub created_at: i64,
}

impl DbParticipantStat {
    pub async fn insert(&self, pool: &SqlitePool) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO participant_stats (match_id, puuid, champion_id, champion_name, team_id, role, win, kills, deaths, assists, damage_dealt, damage_taken, gold_earned, cs, vision_score, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&self.match_id)
        .bind(&self.puuid)
        .bind(self.champion_id)
        .bind(&self.champion_name)
        .bind(self.team_id)
        .bind(&self.role)
        .bind(self.win)
        .bind(self.kills)
        .bind(self.deaths)
        .bind(self.assists)
        .bind(self.damage_dealt)
        .bind(self.damage_taken)
        .bind(self.gold_earned)
        .bind(self.cs)
        .bind(self.vision_score)
        .bind(self.created_at)
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn get_by_puuid(pool: &SqlitePool, puuid: &str, limit: i32) -> Result<Vec<Self>> {
        let stats = sqlx::query_as::<_, Self>(
            r#"
            SELECT ps.* FROM participant_stats ps
            JOIN matches m ON ps.match_id = m.match_id
            WHERE ps.puuid = ?
            ORDER BY m.game_creation DESC
            LIMIT ?
            "#,
        )
        .bind(puuid)
        .bind(limit)
        .fetch_all(pool)
        .await?;

        Ok(stats)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerStats {
    pub total_games: i32,
    pub wins: i32,
    pub losses: i32,
    pub winrate: f64,
    pub avg_kills: f64,
    pub avg_deaths: f64,
    pub avg_assists: f64,
    pub kda: f64,
    pub avg_cs: f64,
    pub avg_damage_dealt: f64,
    pub avg_vision_score: f64,
}

impl PlayerStats {
    pub async fn calculate(pool: &SqlitePool, puuid: &str) -> Result<Self> {
        let stats = DbParticipantStat::get_by_puuid(pool, puuid, 100).await?;

        if stats.is_empty() {
            return Ok(Self {
                total_games: 0,
                wins: 0,
                losses: 0,
                winrate: 0.0,
                avg_kills: 0.0,
                avg_deaths: 0.0,
                avg_assists: 0.0,
                kda: 0.0,
                avg_cs: 0.0,
                avg_damage_dealt: 0.0,
                avg_vision_score: 0.0,
            });
        }

        let total_games = stats.len() as i32;
        let wins = stats.iter().filter(|s| s.win == 1).count() as i32;
        let losses = total_games - wins;
        let winrate = (wins as f64 / total_games as f64) * 100.0;

        let total_kills: i32 = stats.iter().map(|s| s.kills).sum();
        let total_deaths: i32 = stats.iter().map(|s| s.deaths).sum();
        let total_assists: i32 = stats.iter().map(|s| s.assists).sum();
        let total_cs: i32 = stats.iter().map(|s| s.cs).sum();
        let total_damage: i32 = stats.iter().map(|s| s.damage_dealt).sum();
        let total_vision: i32 = stats.iter().map(|s| s.vision_score).sum();

        let avg_kills = total_kills as f64 / total_games as f64;
        let avg_deaths = total_deaths as f64 / total_games as f64;
        let avg_assists = total_assists as f64 / total_games as f64;
        let avg_cs = total_cs as f64 / total_games as f64;
        let avg_damage_dealt = total_damage as f64 / total_games as f64;
        let avg_vision_score = total_vision as f64 / total_games as f64;

        let kda = if avg_deaths == 0.0 {
            (avg_kills + avg_assists) * 10.0 // Perfect KDA
        } else {
            (avg_kills + avg_assists) / avg_deaths
        };

        Ok(Self {
            total_games,
            wins,
            losses,
            winrate,
            avg_kills,
            avg_deaths,
            avg_assists,
            kda,
            avg_cs,
            avg_damage_dealt,
            avg_vision_score,
        })
    }
}

// Ranked Stats Cache
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct RankedStatsCache {
    pub puuid: String,
    pub tier: Option<String>,
    pub rank_value: Option<String>,
    pub league_points: Option<i32>,
    pub wins: Option<i32>,
    pub losses: Option<i32>,
    pub queue_type: String,
    pub cached_at: i64,
}

impl RankedStatsCache {
    pub async fn upsert(pool: &SqlitePool, puuid: &str, stats: Option<&serde_json::Value>) -> Result<()> {
        let now = Utc::now().timestamp();

        if let Some(ranked_data) = stats {
            // Parse ranked data if available
            let tier = ranked_data.get("tier").and_then(|v| v.as_str()).map(String::from);
            let rank = ranked_data.get("rank").and_then(|v| v.as_str()).map(String::from);
            let lp = ranked_data.get("leaguePoints").and_then(|v| v.as_i64()).map(|v| v as i32);
            let wins = ranked_data.get("wins").and_then(|v| v.as_i64()).map(|v| v as i32);
            let losses = ranked_data.get("losses").and_then(|v| v.as_i64()).map(|v| v as i32);
            let queue = ranked_data.get("queueType")
                .and_then(|v| v.as_str())
                .unwrap_or("RANKED_SOLO_5x5")
                .to_string();

            sqlx::query(
                r#"
                INSERT INTO ranked_stats_cache (puuid, tier, rank_value, league_points, wins, losses, queue_type, cached_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(puuid) DO UPDATE SET
                    tier = excluded.tier,
                    rank_value = excluded.rank_value,
                    league_points = excluded.league_points,
                    wins = excluded.wins,
                    losses = excluded.losses,
                    queue_type = excluded.queue_type,
                    cached_at = excluded.cached_at
                "#,
            )
            .bind(puuid)
            .bind(tier)
            .bind(rank)
            .bind(lp)
            .bind(wins)
            .bind(losses)
            .bind(queue)
            .bind(now)
            .execute(pool)
            .await?;
        }

        Ok(())
    }

    pub async fn get(pool: &SqlitePool, puuid: &str) -> Result<Option<Self>> {
        let now = Utc::now().timestamp();
        let cache_cutoff = now - CACHE_TTL_SECONDS;

        let cached = sqlx::query_as::<_, Self>(
            "SELECT * FROM ranked_stats_cache WHERE puuid = ? AND cached_at > ?"
        )
        .bind(puuid)
        .bind(cache_cutoff)
        .fetch_optional(pool)
        .await?;

        Ok(cached)
    }
}

// Match Cache Metadata
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct MatchCacheMetadata {
    pub puuid: String,
    pub last_match_id: Option<String>,
    pub last_fetched: i64,
    pub total_cached: i32,
}

impl MatchCacheMetadata {
    pub async fn upsert(pool: &SqlitePool, puuid: &str, last_match_id: Option<&str>, total: i32) -> Result<()> {
        let now = Utc::now().timestamp();

        sqlx::query(
            r#"
            INSERT INTO match_cache_metadata (puuid, last_match_id, last_fetched, total_cached)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(puuid) DO UPDATE SET
                last_match_id = excluded.last_match_id,
                last_fetched = excluded.last_fetched,
                total_cached = excluded.total_cached
            "#,
        )
        .bind(puuid)
        .bind(last_match_id)
        .bind(now)
        .bind(total)
        .execute(pool)
        .await?;

        Ok(())
    }

    pub async fn get(pool: &SqlitePool, puuid: &str) -> Result<Option<Self>> {
        let metadata = sqlx::query_as::<_, Self>(
            "SELECT * FROM match_cache_metadata WHERE puuid = ?"
        )
        .bind(puuid)
        .fetch_optional(pool)
        .await?;

        Ok(metadata)
    }
}

impl DbMatch {
    pub async fn get_by_match_id(pool: &SqlitePool, match_id: &str) -> Result<Option<Self>> {
        let match_data = sqlx::query_as::<_, Self>(
            "SELECT * FROM matches WHERE match_id = ?"
        )
        .bind(match_id)
        .fetch_optional(pool)
        .await?;

        Ok(match_data)
    }

    pub async fn get_by_puuid(pool: &SqlitePool, puuid: &str, limit: i32) -> Result<Vec<Self>> {
        let matches = sqlx::query_as::<_, Self>(
            r#"
            SELECT DISTINCT m.* FROM matches m
            JOIN participant_stats ps ON m.match_id = ps.match_id
            WHERE ps.puuid = ?
            ORDER BY m.game_creation DESC
            LIMIT ?
            "#,
        )
        .bind(puuid)
        .bind(limit)
        .fetch_all(pool)
        .await?;

        Ok(matches)
    }
}
