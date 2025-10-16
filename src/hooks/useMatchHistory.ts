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
      // First, try to load cached matches
      logger.info('Checking cache for matches', { puuid, count });
      const cachedMatches = await invoke<any[]>('get_cached_matches', {
        puuid,
        limit: count,
      });

      if (cachedMatches && cachedMatches.length > 0) {
        logger.info(`Found ${cachedMatches.length} cached matches`);
        const matchData: MatchData[] = cachedMatches.map((details) => ({
          matchId: details.metadata?.matchId || '',
          gameCreation: details.info?.gameCreation || 0,
          gameDuration: details.info?.gameDuration || 0,
          gameMode: details.info?.gameMode || 'UNKNOWN',
          gameType: details.info?.gameType || 'UNKNOWN',
          queueId: details.info?.queueId || 0,
          participants: details.info?.participants || [],
        }));
        setMatches(matchData);

        // If we have enough cached matches, return early
        if (cachedMatches.length >= count) {
          logger.info('Using cached matches only');
          setIsLoading(false);
          return;
        }
      }

      // Fetch match IDs from API
      logger.info('Fetching match IDs from API', { puuid, count });
      const matchIds = await invoke<string[]>('fetch_match_history', {
        puuid,
        count,
      });

      logger.info(`Fetched ${matchIds.length} match IDs`);

      // Fetch details for each match (with caching)
      const matchDetails: MatchData[] = [];

      for (const matchId of matchIds) {
        try {
          // Use the cached version that auto-stores to DB
          const details = await invoke<any>('fetch_match_details_cached', { matchId });

          // Transform the response to match our MatchData interface
          const matchData: MatchData = {
            matchId: details.metadata?.matchId || matchId,
            gameCreation: details.info?.gameCreation || 0,
            gameDuration: details.info?.gameDuration || 0,
            gameMode: details.info?.gameMode || 'UNKNOWN',
            gameType: details.info?.gameType || 'UNKNOWN',
            queueId: details.info?.queueId || 0,
            participants: details.info?.participants || [],
          };

          matchDetails.push(matchData);
          logger.debug('Fetched match details', { matchId });
        } catch (err) {
          logger.error('Failed to fetch match details', { matchId, error: err });
        }
      }

      setMatches(matchDetails);
      logger.info(`Loaded ${matchDetails.length} matches successfully (${cachedMatches?.length || 0} from cache)`);
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
