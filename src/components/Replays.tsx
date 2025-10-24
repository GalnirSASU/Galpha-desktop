import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface RecordingFile {
  filePath: string;
  fileName: string;
  fileSize: number;
  createdAt: number;
}

export default function Replays() {
  const [recordings, setRecordings] = useState<RecordingFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recordingPath, setRecordingPath] = useState<string>('');

  useEffect(() => {
    // Load recording path from settings
    const settingsStr = localStorage.getItem('galpha_settings');
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      if (settings.recordingPath) {
        setRecordingPath(settings.recordingPath);
        loadRecordings(settings.recordingPath);
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadRecordings = async (path: string) => {
    try {
      setIsLoading(true);
      const files = await invoke<RecordingFile[]>('list_recordings', {
        directory: path,
      });
      setRecordings(files);
    } catch (error) {
      console.error('Failed to load recordings:', error);
      setRecordings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const playRecording = async (filePath: string) => {
    try {
      // Use Tauri's shell plugin to open the file with the default application
      await invoke('plugin:opener|open', { path: filePath });
    } catch (error) {
      console.error('Failed to open recording:', error);
      alert('Impossible d\'ouvrir la vidéo. Assurez-vous d\'avoir un lecteur vidéo installé.');
    }
  };

  const openFolder = async () => {
    if (recordingPath) {
      try {
        // Use Tauri's shell plugin to open the folder
        await invoke('plugin:opener|open', { path: recordingPath });
      } catch (error) {
        console.error('Failed to open folder:', error);
      }
    }
  };

  const refreshRecordings = () => {
    if (recordingPath) {
      loadRecordings(recordingPath);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    }

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base-lighter text-lg">Chargement des replays...</p>
        </div>
      </div>
    );
  }

  if (!recordingPath) {
    return (
      <div className="space-y-6 pb-20">
        <div className="bg-gradient-to-br from-base-dark to-base-darker rounded-2xl border border-base-medium p-12 text-center">
          <div className="w-20 h-20 bg-base-medium rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Configuration requise</h3>
          <p className="text-gray-400 mb-6">
            Veuillez configurer un dossier d'enregistrement dans les paramètres
          </p>
          <button
            onClick={() => {
              // Navigate to settings tab
              const settingsTab = document.querySelector('[data-tab="settings"]') as HTMLButtonElement;
              if (settingsTab) settingsTab.click();
            }}
            className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-tertiary text-white font-semibold rounded-xl shadow-gold hover:shadow-glow transition-all duration-300"
          >
            Aller aux paramètres
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-base-dark to-base-darker rounded-2xl border border-base-medium p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-accent-secondary bg-clip-text text-transparent mb-2">
              Mes Replays
            </h1>
            <p className="text-gray-400 text-sm">
              {recordings.length} enregistrement{recordings.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={refreshRecordings}
              className="px-4 py-2 bg-base-medium text-gray-300 hover:text-white hover:bg-base-light rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Actualiser
            </button>
            <button
              onClick={openFolder}
              className="px-4 py-2 bg-gradient-to-r from-accent-primary to-accent-tertiary text-white font-semibold rounded-lg hover:shadow-glow transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Ouvrir le dossier
            </button>
          </div>
        </div>
      </div>

      {/* Recordings List */}
      {recordings.length === 0 ? (
        <div className="bg-gradient-to-br from-base-dark to-base-darker rounded-2xl border border-base-medium p-12 text-center">
          <div className="w-20 h-20 bg-base-medium rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucun enregistrement</h3>
          <p className="text-gray-400 mb-2">Vos parties enregistrées apparaîtront ici</p>
          <p className="text-sm text-gray-500">
            Lancez une partie pour commencer l'enregistrement automatique
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recordings.map((recording, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl border border-base-medium bg-gradient-to-br from-base-dark to-base-darker hover:border-accent-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-primary/20"
            >
              <div className="p-4">
                {/* Video Thumbnail Placeholder */}
                <div className="relative mb-3 aspect-video bg-base-medium rounded-lg flex items-center justify-center overflow-hidden">
                  <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded">
                    {formatFileSize(recording.fileSize)}
                  </div>
                </div>

                {/* File Info */}
                <div className="mb-3">
                  <h3 className="text-white font-semibold text-sm mb-1 truncate" title={recording.fileName}>
                    {recording.fileName.replace('galpha_recording_', '').replace('.mp4', '')}
                  </h3>
                  <p className="text-xs text-gray-400">{formatDate(recording.createdAt)}</p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => playRecording(recording.filePath)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Lire la vidéo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
