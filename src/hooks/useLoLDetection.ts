import { useEffect, useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { logger } from '../utils/logger';
import type { Summoner } from '../types';

interface UseLoLDetectionReturn {
  isLolRunning: boolean;
  summoner: Summoner | null;
  isLoadingSummoner: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useLoLDetection(enabled = true, pollInterval = 3000): UseLoLDetectionReturn {
  const [isLolRunning, setIsLolRunning] = useState(false);
  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [isLoadingSummoner, setIsLoadingSummoner] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkLolStatus = useCallback(async () => {
    try {
      const running = await invoke<boolean>('check_lol_running');
      setIsLolRunning(running);

      if (!running) {
        setSummoner(null);
        logger.debug('League of Legends is not running');
      } else if (!summoner) {
        // LoL is running but we don't have summoner data yet
        logger.info('League of Legends detected');
      }

      return running;
    } catch (err) {
      logger.error('Failed to check LoL status', err);
      setError(err instanceof Error ? err.message : String(err));
      return false;
    }
  }, [summoner]);

  const fetchSummoner = useCallback(async () => {
    if (!isLolRunning) return;

    setIsLoadingSummoner(true);
    setError(null);

    // Retry logic with exponential backoff
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const data = await invoke<Summoner>('get_current_summoner');
        setSummoner(data);
        setError(null); // Clear any previous errors
        logger.info('Summoner data fetched', {
          gameName: data.gameName,
          level: data.summonerLevel,
        });

        // Initialize database
        await invoke('initialize_database');

        // Save summoner to database
        await invoke('save_summoner', {
          puuid: data.puuid,
          gameName: data.gameName || data.displayName,
          tagLine: data.tagLine || 'EUW',
          summonerLevel: data.summonerLevel,
          profileIconId: data.profileIconId,
        });

        logger.debug('Summoner saved to database');
        break; // Success - exit retry loop
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const isDecryptionError = errorMsg.includes('not available yet') || errorMsg.includes('Exception decrypting');

        if (isDecryptionError && attempt < maxRetries) {
          // Wait before retrying
          logger.debug(`Summoner not ready yet, retrying in ${retryDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }

        // Final attempt failed or different error
        if (isDecryptionError) {
          logger.debug('Summoner not available after retries. User may not be logged in.');
          setError('Please log in to League of Legends to view your profile');
        } else {
          logger.error('Failed to fetch summoner', err);
          setError(errorMsg);
        }
        break;
      }
    }

    setIsLoadingSummoner(false);
  }, [isLolRunning]);

  // Poll for LoL process
  useEffect(() => {
    if (!enabled) return;

    checkLolStatus();
    const interval = setInterval(checkLolStatus, pollInterval);
    return () => clearInterval(interval);
  }, [enabled, pollInterval, checkLolStatus]);

  // Fetch summoner when LoL starts running
  useEffect(() => {
    if (isLolRunning && !summoner && !isLoadingSummoner) {
      fetchSummoner();
    }
  }, [isLolRunning, summoner, isLoadingSummoner, fetchSummoner]);

  const refetch = async () => {
    await checkLolStatus();
    if (isLolRunning) {
      await fetchSummoner();
    }
  };

  return {
    isLolRunning,
    summoner,
    isLoadingSummoner,
    error,
    refetch,
  };
}
