use reqwest::Client;
use anyhow::{Result, Context};
use tracing::{info, debug, warn};
use super::{Account, MatchDetails, Summoner};
use tokio::time::{sleep, Duration};

pub struct RiotApiClient {
    client: Client,
    api_key: String,
    region: String, // e.g., "euw1"
    regional_endpoint: String, // e.g., "europe"
}

/// Retry configuration for handling rate limits
const MAX_RETRIES: u32 = 3;
const INITIAL_BACKOFF_MS: u64 = 2000; // 2 seconds initial backoff
const RATE_LIMIT_DELAY_MS: u64 = 1500; // 1.5 seconds between requests

impl RiotApiClient {
    /// Create a new Riot API client
    pub fn new(api_key: String, region: String) -> Self {
        let regional_endpoint = Self::get_regional_endpoint(&region);

        Self {
            client: Client::new(),
            api_key,
            region,
            regional_endpoint,
        }
    }

    /// Get regional endpoint from platform region
    fn get_regional_endpoint(region: &str) -> String {
        match region.to_lowercase().as_str() {
            "euw1" | "eun1" | "tr1" | "ru" => "europe",
            "na1" | "br1" | "la1" | "la2" => "americas",
            "kr" | "jp1" => "asia",
            "oc1" => "sea",
            _ => "europe",
        }
        .to_string()
    }

    /// Make an API request with retry logic for rate limiting
    async fn make_request_with_retry(
        &self,
        url: &str,
        request_name: &str,
    ) -> Result<reqwest::Response> {
        // Rate limiting: wait before making request
        sleep(Duration::from_millis(RATE_LIMIT_DELAY_MS)).await;

        for attempt in 0..MAX_RETRIES {
            debug!("Making request to {} (attempt {}/{})", request_name, attempt + 1, MAX_RETRIES);

            let response = self
                .client
                .get(url)
                .header("X-Riot-Token", &self.api_key)
                .send()
                .await
                .context("Failed to send request to Riot API")?;

            let status = response.status();

            // Success case
            if status.is_success() {
                return Ok(response);
            }

            // Rate limit case - retry with exponential backoff
            if status.as_u16() == 429 {
                if attempt < MAX_RETRIES - 1 {
                    // Calculate exponential backoff: 2s, 4s, 8s
                    let backoff_ms = INITIAL_BACKOFF_MS * 2_u64.pow(attempt);
                    warn!(
                        "Rate limit hit for {}. Retrying in {}ms (attempt {}/{})",
                        request_name,
                        backoff_ms,
                        attempt + 1,
                        MAX_RETRIES
                    );
                    sleep(Duration::from_millis(backoff_ms)).await;
                    continue;
                } else {
                    let body = response.text().await.unwrap_or_default();
                    anyhow::bail!("Riot API request failed with status {}: {}", status, body);
                }
            }

            // Other errors - fail immediately
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("Riot API request failed with status {}: {}", status, body);
        }

        anyhow::bail!("Max retries exceeded for {}", request_name)
    }

    /// Get account by Riot ID (game name + tag)
    pub async fn get_account_by_riot_id(
        &self,
        game_name: &str,
        tag_line: &str,
    ) -> Result<Account> {
        let url = format!(
            "https://{}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{}/{}",
            self.regional_endpoint,
            urlencoding::encode(game_name),
            urlencoding::encode(tag_line)
        );

        debug!("Fetching account for {}#{}", game_name, tag_line);

        let response = self.make_request_with_retry(&url, "get_account_by_riot_id").await?;

        let account: Account = response
            .json()
            .await
            .context("Failed to parse account data")?;

        info!("Retrieved account for {}#{} (PUUID: {})", game_name, tag_line, account.puuid);

        Ok(account)
    }

    /// Get match IDs for a player
    pub async fn get_match_ids(
        &self,
        puuid: &str,
        start: usize,
        count: usize,
    ) -> Result<Vec<String>> {
        let url = format!(
            "https://{}.api.riotgames.com/lol/match/v5/matches/by-puuid/{}/ids?start={}&count={}",
            self.regional_endpoint, puuid, start, count
        );

        debug!("Fetching match IDs for PUUID: {} (start: {}, count: {})", puuid, start, count);

        let response = self.make_request_with_retry(&url, "get_match_ids").await?;

        let match_ids: Vec<String> = response
            .json()
            .await
            .context("Failed to parse match IDs")?;

        info!("Retrieved {} match IDs", match_ids.len());

        Ok(match_ids)
    }

    /// Get detailed match information
    pub async fn get_match_details(&self, match_id: &str) -> Result<MatchDetails> {
        let url = format!(
            "https://{}.api.riotgames.com/lol/match/v5/matches/{}",
            self.regional_endpoint, match_id
        );

        debug!("Fetching match details for: {}", match_id);

        let response = self.make_request_with_retry(&url, "get_match_details").await?;

        let match_details: MatchDetails = response
            .json()
            .await
            .context("Failed to parse match details")?;

        debug!("Retrieved match details for: {}", match_id);

        Ok(match_details)
    }

    /// Get multiple match details in batch
    pub async fn get_matches_batch(
        &self,
        match_ids: Vec<String>,
    ) -> Vec<Result<MatchDetails>> {
        let mut results = Vec::new();

        for match_id in match_ids {
            let result = self.get_match_details(&match_id).await;
            results.push(result);
            // Rate limiting is handled in make_request_with_retry
        }

        results
    }

    /// Get summoner by PUUID
    pub async fn get_summoner_by_puuid(&self, puuid: &str) -> Result<Summoner> {
        let url = format!(
            "https://{}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{}",
            self.region, puuid
        );

        debug!("Fetching summoner by PUUID: {}", puuid);

        let response = self.make_request_with_retry(&url, "get_summoner_by_puuid").await?;

        // Get the raw response text first to see what we're getting
        let response_text = response.text().await.context("Failed to get response text")?;
        info!("Raw Summoner API response: {}", response_text);

        // Try to parse it
        let summoner: Summoner = serde_json::from_str(&response_text)
            .context(format!("Failed to parse summoner data. Response was: {}", response_text))?;

        info!("Summoner data fetched - ID: {:?}, Level: {}, PUUID: {}", summoner.id.as_deref().unwrap_or("None"), summoner.summoner_level, summoner.puuid);

        Ok(summoner)
    }

    /// Get ranked stats for a summoner
    pub async fn get_ranked_stats(&self, summoner_id: &str) -> Result<Vec<serde_json::Value>> {
        let url = format!(
            "https://{}.api.riotgames.com/lol/league/v4/entries/by-summoner/{}",
            self.region, summoner_id
        );

        debug!("Fetching ranked stats for summoner ID: {}", summoner_id);

        let response = self.make_request_with_retry(&url, "get_ranked_stats").await?;

        let stats = response
            .json()
            .await
            .context("Failed to parse ranked stats")?;

        Ok(stats)
    }
}
