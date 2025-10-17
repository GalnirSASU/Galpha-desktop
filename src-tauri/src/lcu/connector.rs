use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::fs;
use anyhow::{Result, Context};
use tracing::{info, debug};

#[derive(Debug, Clone)]
pub struct LcuConnector {
    client: Client,
    base_url: String,
    auth_token: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SummonerInfo {
    #[serde(rename = "displayName")]
    pub display_name: String,
    #[serde(rename = "gameName")]
    pub game_name: Option<String>,
    #[serde(rename = "tagLine")]
    pub tag_line: Option<String>,
    #[serde(rename = "summonerId")]
    pub summoner_id: u64,
    #[serde(rename = "accountId")]
    pub account_id: u64,
    #[serde(rename = "puuid")]
    pub puuid: String,
    #[serde(rename = "summonerLevel")]
    pub summoner_level: u32,
    #[serde(rename = "profileIconId")]
    pub profile_icon_id: u32,
}

impl LcuConnector {
    /// Create a new LCU connector by reading lockfile
    pub async fn new() -> Result<Self> {
        let (port, password) = Self::read_lockfile()?;

        // Create a client that accepts self-signed certificates (LCU uses self-signed)
        let client = Client::builder()
            .danger_accept_invalid_certs(true)
            .build()?;

        let base_url = format!("https://127.0.0.1:{}", port);
        let auth_token = format!("riot:{}", password);

        info!("Connected to LCU on port {}", port);

        Ok(Self {
            client,
            base_url,
            auth_token,
        })
    }

    /// Read the lockfile to get connection info
    fn read_lockfile() -> Result<(u16, String)> {
        #[cfg(target_os = "windows")]
        let lockfile_path = {
            let path = std::env::var("LOCALAPPDATA")
                .context("Could not find LOCALAPPDATA")?;
            format!("{}\\Riot Games\\League of Legends\\lockfile", path)
        };

        #[cfg(target_os = "macos")]
        let lockfile_path = "/Applications/League of Legends.app/Contents/LoL/lockfile".to_string();

        #[cfg(target_os = "linux")]
        let lockfile_path = {
            let home = std::env::var("HOME")
                .context("Could not find HOME directory")?;
            format!("{}/.wine/drive_c/Riot Games/League of Legends/lockfile", home)
        };

        let content = fs::read_to_string(&lockfile_path)
            .context("Failed to read lockfile. Is League of Legends running?")?;

        let parts: Vec<&str> = content.split(':').collect();
        if parts.len() < 5 {
            anyhow::bail!("Invalid lockfile format");
        }

        let port = parts[2].parse::<u16>()
            .context("Failed to parse port from lockfile")?;
        let password = parts[3].to_string();

        Ok((port, password))
    }

    /// Get current summoner information
    pub async fn get_current_summoner(&self) -> Result<SummonerInfo> {
        let url = format!("{}/lol-summoner/v1/current-summoner", self.base_url);

        debug!("Fetching current summoner info from: {}", url);

        // Extract password from auth_token (format is "riot:password")
        let password = self.auth_token.split(':').nth(1)
            .ok_or_else(|| anyhow::anyhow!("Invalid auth token format"))?;

        let response = self.client
            .get(&url)
            .basic_auth("riot", Some(password))
            .send()
            .await
            .context("Failed to send request to LCU")?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();

            // Check if it's a decryption error (user not fully logged in)
            if body.contains("Exception decrypting") {
                anyhow::bail!("Summoner not available yet. Please ensure you are fully logged into League of Legends.");
            }

            anyhow::bail!("LCU request failed with status {}: {}", status, body);
        }

        let summoner: SummonerInfo = response.json().await
            .context("Failed to parse summoner info")?;

        info!("Retrieved summoner: {} (Level {})", summoner.display_name, summoner.summoner_level);

        Ok(summoner)
    }

    /// Test if the connection is still valid
    pub async fn test_connection(&self) -> bool {
        match self.get_current_summoner().await {
            Ok(_) => true,
            Err(e) => {
                debug!("Connection test failed: {}", e);
                false
            }
        }
    }

    /// Get the summoner's PUUID (needed for Riot API calls)
    pub async fn get_puuid(&self) -> Result<String> {
        let summoner = self.get_current_summoner().await?;
        Ok(summoner.puuid)
    }

    /// Get the summoner's display name with tag
    pub async fn get_riot_id(&self) -> Result<(String, String)> {
        let summoner = self.get_current_summoner().await?;

        let game_name = summoner.game_name
            .unwrap_or_else(|| summoner.display_name.clone());
        let tag_line = summoner.tag_line
            .unwrap_or_else(|| "EUW".to_string());

        Ok((game_name, tag_line))
    }
}
