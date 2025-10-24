import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

export interface LiveGameNotification {
  isInGame: boolean;
  gameStartTime?: number;
  hasNotified: boolean;
  recordingSessionId?: string;
}

/**
 * Hook personnalisé pour détecter automatiquement les parties en cours,
 * notifier l'utilisateur et gérer l'enregistrement automatique
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
        // Stop recording if game ended
        if (liveGameState.recordingSessionId) {
          try {
            await invoke('stop_recording');
            console.log('🔴 Enregistrement arrêté - LoL fermé');
          } catch (error) {
            console.error('Erreur arrêt enregistrement:', error);
          }
        }

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

        // Get recording settings from localStorage
        const settingsStr = localStorage.getItem('galpha_settings');
        const settings = settingsStr ? JSON.parse(settingsStr) : {};

        let recordingSessionId: string | undefined;

        // Start recording if auto-recording is enabled
        if (settings.autoRecording && settings.recordingPath) {
          try {
            const sessionId = await invoke<string>('start_recording', {
              outputDir: settings.recordingPath,
              quality: settings.recordingQuality || 'high',
            });
            recordingSessionId = sessionId;
            console.log('🔴 Enregistrement démarré:', sessionId);
          } catch (error) {
            console.error('Erreur démarrage enregistrement:', error);
          }
        }

        setLiveGameState({
          isInGame: true,
          gameStartTime: Date.now(),
          hasNotified: false,
          recordingSessionId,
        });
      }
      // Fin de partie
      else if (!isNowInGame && wasInGame) {
        console.log('✅ Partie terminée');

        // Stop recording if it was running
        if (liveGameState.recordingSessionId) {
          try {
            const outputPath = await invoke<string>('stop_recording');
            console.log('🔴 Enregistrement sauvegardé:', outputPath);
          } catch (error) {
            console.error('Erreur arrêt enregistrement:', error);
          }
        }

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
  }, [isLoLRunning, liveGameState.isInGame, liveGameState.recordingSessionId]);

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
