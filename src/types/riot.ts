/**
 * Types pour l'API Riot Games et League of Legends
 */

export interface Summoner {
  displayName: string;
  gameName: string | null;
  tagLine: string | null;
  puuid: string;
  summonerLevel: number;
  profileIconId: number;
}

export interface SummonerDetails {
  id?: string;
  accountId?: string;
  puuid: string;
  name?: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface RankedStats {
  queueType: 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR' | 'RANKED_FLEX_TT';
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran?: boolean;
  inactive?: boolean;
  freshBlood?: boolean;
  hotStreak?: boolean;
}

export interface AccountData {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface MatchData {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  gameMode: string;
  gameType: string;
  queueId: number;
  participants: MatchParticipant[];
}

export interface MatchParticipant {
  puuid: string;
  championId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  visionScore: number;
  goldEarned: number;
  win: boolean;
  teamId: number;
  summonerName: string;
  items: number[];
  summoner1Id: number;
  summoner2Id: number;
  perks?: {
    statPerks: {
      defense: number;
      flex: number;
      offense: number;
    };
  };
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winrate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kda: number;
  avgCs: number;
  avgVisionScore: number;
  avgDamage: number;
  avgGold: number;
}

export interface ChampionStats {
  championId: number;
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winrate: number;
  kda: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
}

export type QueueType = 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR' | 'NORMAL' | 'ARAM' | 'ALL';
export type Region = 'euw1' | 'na1' | 'kr' | 'br1' | 'eun1' | 'jp1' | 'la1' | 'la2' | 'oc1' | 'ru' | 'tr1';
