import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface LiveGameNotification {
  isInGame: boolean;
  gameStartTime?: number;
  hasNotified: boolean;
}

/**
 * Hook personnalisé pour détecter automatiquement les parties en cours
 * et notifier l'utilisateur
 */
export function useLiveGameDetection(isLoLRunning: boolean) {
  const [liveGameState, setLiveGameState] = useState<LiveGameNotification>({
    isInGame: false,
    hasNotified: false,
  });

  const checkActiveGame = useCallback(async () => {
    if (!isLoLRunning) {
      // Reset state if LoL is not running
      if (liveGameState.isInGame) {
        setLiveGameState({
          isInGame: false,
          hasNotified: false,
        });
      }
      return;
    }

    try {
      const activeGame = await invoke<any>('get_active_game');

      const wasInGame = liveGameState.isInGame;
      const isNowInGame = activeGame !== null;

      // Détection d'une nouvelle partie
      if (isNowInGame && !wasInGame) {
        console.log('🎮 Nouvelle partie détectée !');
        setLiveGameState({
          isInGame: true,
          gameStartTime: Date.now(),
          hasNotified: false, // Reset notification flag for new game
        });
      }
      // Fin de partie
      else if (!isNowInGame && wasInGame) {
        console.log('✅ Partie terminée');
        setLiveGameState({
          isInGame: false,
          hasNotified: false,
        });
      }
      // Toujours en partie
      else if (isNowInGame && wasInGame) {
        setLiveGameState(prev => ({
          ...prev,
          isInGame: true,
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la partie active:', error);
    }
  }, [isLoLRunning, liveGameState.isInGame]);

  // Polling toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(checkActiveGame, 5000);
    // Check immediately on mount
    checkActiveGame();

    return () => clearInterval(interval);
  }, [checkActiveGame]);

  const markAsNotified = useCallback(() => {
    setLiveGameState(prev => ({
      ...prev,
      hasNotified: true,
    }));
  }, []);

  return {
    ...liveGameState,
    markAsNotified,
  };
}
