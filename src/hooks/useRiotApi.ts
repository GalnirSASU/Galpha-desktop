import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { logger } from '../utils/logger';
import type { Region } from '../types';

interface UseRiotApiReturn {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  region: Region;
  setRegion: (region: Region) => void;
  reinitialize: () => Promise<void>;
}

export function useRiotApi(initialRegion: Region = 'euw1'): UseRiotApiReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>(initialRegion);

  const initializeApi = async (apiRegion: Region) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_RIOT_API_KEY;

      if (!apiKey || apiKey === 'your_riot_api_key_here') {
        const errorMsg =
          'Riot API key not configured. Please set VITE_RIOT_API_KEY in your .env file';
        logger.error(errorMsg);
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      await invoke('initialize_riot_client', {
        apiKey,
        region: apiRegion,
      });

      setIsInitialized(true);
      logger.info('Riot API client initialized', { region: apiRegion });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error('Failed to initialize Riot API', err);
      setError(errorMsg);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeApi(region);
  }, [region]);

  const reinitialize = async () => {
    await initializeApi(region);
  };

  return {
    isInitialized,
    isLoading,
    error,
    region,
    setRegion,
    reinitialize,
  };
}
