/**
 * Export all types from a central location
 */

export * from './riot';

export interface SavedAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
  summonerLevel: number;
  profileIconId: number;
  tier?: string;
  rank?: string;
  lp?: number;
  wins?: number;
  losses?: number;
  lastPlayed?: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
