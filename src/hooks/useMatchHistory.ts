import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { MatchData } from '../types';
import { logger } from '../utils/logger';

export function useMatchHistory(puuid: string | null, enabled: boolean = false) {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchHistory = useCallback(async (count: number = 50) => {
    if (!puuid) {
      setError('PUUID not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Map to store all matches by ID (to avoid duplicates)
      const matchMap = new Map<string, MatchData>();

      // Step 1: Load ALL cached matches from database (no limit)
      logger.info('Loading ALL cached matches from database', { puuid });
      const cachedMatches = await invoke<any[]>('get_cached_matches', {
        puuid,
        limit: 1000, // Get a large number to include all historical data
      });

      if (cachedMatches && cachedMatches.length > 0) {
        logger.info(`Found ${cachedMatches.length} cached matches in database`);
        cachedMatches.forEach((details) => {
          const matchData: MatchData = {
            matchId: details.metadata?.matchId || '',
            gameCreation: details.info?.gameCreation || 0,
            gameDuration: details.info?.gameDuration || 0,
            gameMode: details.info?.gameMode || 'UNKNOWN',
            gameType: details.info?.gameType || 'UNKNOWN',
            queueId: details.info?.queueId || 0,
            participants: details.info?.participants || [],
          };
          matchMap.set(matchData.matchId, matchData);
        });
      }

      // Step 2: Fetch recent matches from API to get new games
      logger.info('Fetching recent match IDs from API', { puuid, count });
      try {
        const matchIds = await invoke<string[]>('fetch_match_history', {
          puuid,
          count: Math.min(count, 20), // Fetch recent 20 matches from API
        });

        logger.info(`Fetched ${matchIds.length} match IDs from API`);

        // Fetch details for each match from API (with caching)
        for (const matchId of matchIds) {
          // Skip if we already have this match from cache
          if (matchMap.has(matchId)) {
            logger.debug('Match already in cache, skipping', { matchId });
            continue;
          }

          try {
            // Use the cached version that auto-stores to DB
            const details = await invoke<any>('fetch_match_details_cached', { matchId });

            const matchData: MatchData = {
              matchId: details.metadata?.matchId || matchId,
              gameCreation: details.info?.gameCreation || 0,
              gameDuration: details.info?.gameDuration || 0,
              gameMode: details.info?.gameMode || 'UNKNOWN',
              gameType: details.info?.gameType || 'UNKNOWN',
              queueId: details.info?.queueId || 0,
              participants: details.info?.participants || [],
            };

            matchMap.set(matchData.matchId, matchData);
            logger.debug('Fetched new match from API', { matchId });
          } catch (err) {
            logger.error('Failed to fetch match details', { matchId, error: err });
          }
        }
      } catch (apiErr) {
        logger.warn('Failed to fetch from API, using cached data only', apiErr);
      }

      // Step 3: Convert map to array and sort by gameCreation (newest first)
      const allMatches = Array.from(matchMap.values())
        .sort((a, b) => b.gameCreation - a.gameCreation);

      setMatches(allMatches);
      logger.info(`Loaded ${allMatches.length} total matches (${cachedMatches?.length || 0} from cache)`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error('Failed to fetch match history', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [puuid]);

  useEffect(() => {
    if (enabled && puuid) {
      fetchMatchHistory();
    }
  }, [enabled, puuid, fetchMatchHistory]);

  return {
    matches,
    isLoading,
    error,
    refetch: fetchMatchHistory,
  };
}
