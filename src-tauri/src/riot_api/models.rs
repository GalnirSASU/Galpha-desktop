use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Account {
    pub puuid: String,
    pub game_name: String,
    pub tag_line: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Summoner {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub account_id: Option<String>,
    pub puuid: String,
    pub profile_icon_id: i32,
    pub revision_date: i64,
    pub summoner_level: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchId(pub String);

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchDetails {
    pub metadata: MatchMetadata,
    pub info: MatchInfo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchMetadata {
    pub data_version: String,
    pub match_id: String,
    pub participants: Vec<String>, // PUUIDs
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchInfo {
    pub game_creation: i64,
    pub game_duration: i64,
    pub game_end_timestamp: Option<i64>,
    pub game_id: i64,
    pub game_mode: String,
    pub game_name: String,
    pub game_start_timestamp: i64,
    pub game_type: String,
    pub game_version: String,
    pub map_id: i32,
    pub participants: Vec<Participant>,
    pub platform_id: String,
    pub queue_id: i32,
    pub teams: Vec<Team>,
    pub tournament_code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Participant {
    pub puuid: String,
    pub summoner_name: String,
    pub riot_id_game_name: Option<String>,
    pub riot_id_tagline: Option<String>,

    // Champion info
    pub champion_id: i32,
    pub champion_name: String,
    pub champ_level: i32,

    // Team info
    pub team_id: i32,
    pub team_position: String,
    pub individual_position: String,

    // Game outcome
    pub win: bool,
    pub game_ended_in_early_surrender: bool,
    pub game_ended_in_surrender: bool,

    // KDA
    pub kills: i32,
    pub deaths: i32,
    pub assists: i32,

    // Combat stats
    pub total_damage_dealt_to_champions: i32,
    pub total_damage_taken: i32,
    pub total_heal: i32,
    pub total_minions_killed: i32,
    pub neutral_minions_killed: i32,
    pub vision_score: i32,
    pub gold_earned: i32,

    // Items
    pub item0: i32,
    pub item1: i32,
    pub item2: i32,
    pub item3: i32,
    pub item4: i32,
    pub item5: i32,
    pub item6: i32,

    // Spells
    pub summoner1_id: i32,
    pub summoner2_id: i32,

    // Perks
    pub perks: Perks,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Perks {
    pub stat_perks: StatPerks,
    pub styles: Vec<PerkStyle>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatPerks {
    pub defense: i32,
    pub flex: i32,
    pub offense: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PerkStyle {
    pub description: String,
    pub selections: Vec<PerkSelection>,
    pub style: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PerkSelection {
    pub perk: i32,
    pub var1: i32,
    pub var2: i32,
    pub var3: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Team {
    pub team_id: i32,
    pub win: bool,
    pub bans: Vec<Ban>,
    pub objectives: Objectives,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Ban {
    pub champion_id: i32,
    pub pick_turn: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Objectives {
    pub baron: Objective,
    pub champion: Objective,
    pub dragon: Objective,
    pub horde: Option<Objective>,
    pub inhibitor: Objective,
    pub rift_herald: Objective,
    pub tower: Objective,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Objective {
    pub first: bool,
    pub kills: i32,
}

// Queue types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum QueueType {
    RankedSolo = 420,
    RankedFlex = 440,
    NormalDraft = 400,
    NormalBlind = 430,
    ARAM = 450,
    URF = 900,
    Unknown = 0,
}

impl From<i32> for QueueType {
    fn from(id: i32) -> Self {
        match id {
            420 => QueueType::RankedSolo,
            440 => QueueType::RankedFlex,
            400 => QueueType::NormalDraft,
            430 => QueueType::NormalBlind,
            450 => QueueType::ARAM,
            900 => QueueType::URF,
            _ => QueueType::Unknown,
        }
    }
}

impl QueueType {
    pub fn name(&self) -> &str {
        match self {
            QueueType::RankedSolo => "Ranked Solo/Duo",
            QueueType::RankedFlex => "Ranked Flex",
            QueueType::NormalDraft => "Normal Draft",
            QueueType::NormalBlind => "Normal Blind",
            QueueType::ARAM => "ARAM",
            QueueType::URF => "URF",
            QueueType::Unknown => "Unknown",
        }
    }
}
