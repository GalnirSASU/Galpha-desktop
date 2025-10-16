use anyhow::{Context, Result};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine};
use rand::Rng;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::sync::{Arc, Mutex};
use tiny_http::{Response, Server};

const DISCORD_CLIENT_ID: &str = "YOUR_DISCORD_CLIENT_ID"; // To be configured
const REDIRECT_URI: &str = "http://localhost:3737/callback";
const DISCORD_AUTH_URL: &str = "https://discord.com/api/oauth2/authorize";
const DISCORD_TOKEN_URL: &str = "https://discord.com/api/oauth2/token";
const DISCORD_USER_URL: &str = "https://discord.com/api/users/@me";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscordUser {
    pub id: String,
    pub username: String,
    pub discriminator: String,
    pub avatar: Option<String>,
    pub email: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct TokenResponse {
    access_token: String,
    token_type: String,
    expires_in: u64,
    refresh_token: String,
    scope: String,
}

pub struct DiscordOAuth {
    client_id: String,
    client_secret: Option<String>,
    redirect_uri: String,
}

impl DiscordOAuth {
    pub fn new(client_id: String, client_secret: Option<String>) -> Self {
        Self {
            client_id,
            client_secret,
            redirect_uri: REDIRECT_URI.to_string(),
        }
    }

    /// Generate PKCE challenge
    fn generate_pkce() -> (String, String) {
        let mut rng = rand::thread_rng();
        let verifier: String = (0..128)
            .map(|_| {
                let idx = rng.gen_range(0..62);
                b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[idx]
                    as char
            })
            .collect();

        let mut hasher = Sha256::new();
        hasher.update(verifier.as_bytes());
        let challenge = URL_SAFE_NO_PAD.encode(hasher.finalize());

        (verifier, challenge)
    }

    /// Build authorization URL
    pub fn get_authorization_url(&self, state: &str, code_challenge: &str) -> String {
        format!(
            "{}?client_id={}&redirect_uri={}&response_type=code&scope=identify%20email&state={}&code_challenge={}&code_challenge_method=S256",
            DISCORD_AUTH_URL,
            self.client_id,
            urlencoding::encode(&self.redirect_uri),
            state,
            code_challenge
        )
    }

    /// Exchange authorization code for access token
    async fn exchange_code(
        &self,
        code: &str,
        code_verifier: &str,
    ) -> Result<TokenResponse> {
        let client = reqwest::Client::new();

        let params = [
            ("client_id", self.client_id.as_str()),
            ("grant_type", "authorization_code"),
            ("code", code),
            ("redirect_uri", &self.redirect_uri),
            ("code_verifier", code_verifier),
        ];

        let response = client
            .post(DISCORD_TOKEN_URL)
            .form(&params)
            .send()
            .await
            .map_err(|e| anyhow::anyhow!("Failed to exchange code for token: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Discord token exchange failed: {}", error_text);
        }

        let token_response: TokenResponse = response
            .json()
            .await
            .map_err(|e| anyhow::anyhow!("Failed to parse token response: {}", e))?;

        Ok(token_response)
    }

    /// Get user info from Discord
    async fn get_user_info(&self, access_token: &str) -> Result<DiscordUser> {
        let client = reqwest::Client::new();

        let response = client
            .get(DISCORD_USER_URL)
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
            .await
            .map_err(|e| anyhow::anyhow!("Failed to get user info: {}", e))?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            anyhow::bail!("Discord user info request failed: {}", error_text);
        }

        let user: DiscordUser = response
            .json()
            .await
            .map_err(|e| anyhow::anyhow!("Failed to parse user info: {}", e))?;

        Ok(user)
    }

    /// Start OAuth flow
    pub async fn authenticate(&self) -> Result<(DiscordUser, String)> {
        // Generate PKCE
        let (code_verifier, code_challenge) = Self::generate_pkce();
        let state = uuid::Uuid::new_v4().to_string();

        // Build auth URL
        let auth_url = self.get_authorization_url(&state, &code_challenge);

        // Start local server
        let server = Server::http("127.0.0.1:3737")
            .map_err(|e| anyhow::anyhow!("Failed to start callback server: {}", e))?;

        let code_result = Arc::new(Mutex::new(None));
        let state_result = Arc::new(Mutex::new(None));

        // Open browser
        open::that(&auth_url)
            .map_err(|e| anyhow::anyhow!("Failed to open browser: {}", e))?;

        // Wait for callback
        for request in server.incoming_requests() {
            let url = request.url().to_string();

            if url.starts_with("/callback") {
                // Parse query params
                let parsed_url = url::Url::parse(&format!("http://localhost:3737{}", url))?;
                let params: std::collections::HashMap<_, _> = parsed_url
                    .query_pairs()
                    .into_owned()
                    .collect();

                if let (Some(code), Some(returned_state)) = (params.get("code"), params.get("state")) {
                    // Verify state
                    if returned_state == &state {
                        *code_result.lock().unwrap() = Some(code.clone());
                        *state_result.lock().unwrap() = Some(returned_state.clone());

                        // Send success response
                        let response = Response::from_string(
                            r#"
                            <!DOCTYPE html>
                            <html>
                            <head><title>Galpha - Login Success</title></head>
                            <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; background: #0A0A0F; color: white;">
                                <div style="text-align: center;">
                                    <h1>✅ Login Successful!</h1>
                                    <p>You can close this window and return to Galpha.</p>
                                </div>
                            </body>
                            </html>
                            "#
                        );
                        let _ = request.respond(response);
                        break;
                    }
                }

                // Send error response if state doesn't match
                let response = Response::from_string("Authentication failed. Please try again.");
                let _ = request.respond(response);
                break;
            }
        }

        let code = code_result
            .lock()
            .unwrap()
            .clone()
            .ok_or_else(|| anyhow::anyhow!("No authorization code received"))?;

        // Exchange code for token
        let token_response = self.exchange_code(&code, &code_verifier).await?;

        // Get user info
        let user = self.get_user_info(&token_response.access_token).await?;

        Ok((user, token_response.access_token))
    }
}
