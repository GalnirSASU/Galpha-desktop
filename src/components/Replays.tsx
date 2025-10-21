import { useState, useEffect } from 'react';
import ReplayPlayer from './ReplayPlayer';

interface ReplayEvent {
  timestamp: number;
  type: 'kill' | 'death' | 'assist' | 'ult' | 'objective' | 'pentakill' | 'quadrakill' | 'triplekill';
  description: string;
  icon: string;
  color: string;
}

interface ReplayData {
  id: string;
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  gameMode: string;
  queueId: number;
  championName: string;
  championId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  filePath: string;
  fileSize: number;
  events?: ReplayEvent[];
}

export default function Replays() {
  const [replays, setReplays] = useState<ReplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'kda'>('date');
  const [selectedReplay, setSelectedReplay] = useState<ReplayData | null>(null);

  useEffect(() => {
    loadReplays();
  }, []);

  const loadReplays = async () => {
    try {
      setIsLoading(true);
      // Pour l'instant, on simule des données
      // TODO: Implémenter la récupération réelle depuis la base de données
      const mockReplays: ReplayData[] = [];
      setReplays(mockReplays);
    } catch (error) {
      console.error('Failed to load replays:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReplay = async (replayId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce replay ?')) {
      return;
    }

    try {
      // TODO: Implémenter la suppression
      setReplays(replays.filter((r) => r.id !== replayId));
    } catch (error) {
      console.error('Failed to delete replay:', error);
    }
  };

  const playReplay = async (replay: ReplayData) => {
    try {
      // Generate mock events for demo
      const mockEvents: ReplayEvent[] = [
        {
          timestamp: 120,
          type: 'kill',
          description: 'First Blood!',
          icon: '⚔️',
          color: 'bg-green-500/20 border-green-400',
        },
        {
          timestamp: 245,
          type: 'death',
          description: 'Vous êtes mort',
          icon: '💀',
          color: 'bg-red-500/20 border-red-400',
        },
        {
          timestamp: 380,
          type: 'assist',
          description: 'Double Kill Assistance',
          icon: '🤝',
          color: 'bg-blue-500/20 border-blue-400',
        },
        {
          timestamp: 520,
          type: 'ult',
          description: 'Ultimate utilisé',
          icon: '💥',
          color: 'bg-purple-500/20 border-purple-400',
        },
        {
          timestamp: 890,
          type: 'triplekill',
          description: 'Triple Kill!',
          icon: '🔥',
          color: 'bg-orange-500/20 border-orange-400',
        },
        {
          timestamp: 1240,
          type: 'objective',
          description: 'Dragon tué',
          icon: '🐉',
          color: 'bg-cyan-500/20 border-cyan-400',
        },
      ];

      setSelectedReplay({ ...replay, events: mockEvents });
    } catch (error) {
      console.error('Failed to play replay:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredReplays = replays.filter((replay) => {
    if (filter === 'wins') return replay.win;
    if (filter === 'losses') return !replay.win;
    return true;
  });

  const sortedReplays = [...filteredReplays].sort((a, b) => {
    if (sortBy === 'date') return b.gameCreation - a.gameCreation;
    if (sortBy === 'duration') return b.gameDuration - a.gameDuration;
    if (sortBy === 'kda') {
      const kdaA = a.deaths > 0 ? (a.kills + a.assists) / a.deaths : a.kills + a.assists;
      const kdaB = b.deaths > 0 ? (b.kills + b.assists) / b.deaths : b.kills + b.assists;
      return kdaB - kdaA;
    }
    return 0;
  });

  const queueNames: { [key: number]: string } = {
    420: 'Ranked Solo/Duo',
    440: 'Ranked Flex',
    450: 'ARAM',
    400: 'Normal Draft',
    430: 'Normal Blind',
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

  // Show replay player if a replay is selected
  if (selectedReplay) {
    return (
      <ReplayPlayer
        matchId={selectedReplay.matchId}
        gameDuration={selectedReplay.gameDuration}
        events={selectedReplay.events || []}
        onClose={() => setSelectedReplay(null)}
      />
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
              {replays.length} replay{replays.length > 1 ? 's' : ''} enregistré{replays.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            {(['all', 'wins', 'losses'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === filterType
                    ? 'bg-gradient-to-r from-accent-primary to-accent-tertiary text-white shadow-gold'
                    : 'bg-base-medium text-gray-400 hover:text-white hover:bg-base-light'
                }`}
              >
                {filterType === 'all' && 'Tous'}
                {filterType === 'wins' && 'Victoires'}
                {filterType === 'losses' && 'Défaites'}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm text-gray-400">Trier par:</span>
          {(['date', 'duration', 'kda'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => setSortBy(sort)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                sortBy === sort
                  ? 'bg-accent-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-base-light'
              }`}
            >
              {sort === 'date' && 'Date'}
              {sort === 'duration' && 'Durée'}
              {sort === 'kda' && 'KDA'}
            </button>
          ))}
        </div>
      </div>

      {/* Replays List */}
      {sortedReplays.length === 0 ? (
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
          <h3 className="text-xl font-bold text-white mb-2">Aucun replay disponible</h3>
          <p className="text-gray-400 mb-6">
            Activez l'enregistrement automatique dans les paramètres pour commencer à enregistrer vos parties
          </p>
          <button
            onClick={() => {
              // TODO: Navigate to settings
              console.log('Navigate to settings');
            }}
            className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-tertiary text-white font-semibold rounded-xl shadow-gold hover:shadow-glow transition-all duration-300"
          >
            Configurer l'enregistrement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReplays.map((replay) => (
            <div
              key={replay.id}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.01] ${
                replay.win
                  ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-blue-500/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20'
                  : 'bg-gradient-to-r from-red-900/30 to-red-800/30 border-red-500/30 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/20'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* Game Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          replay.win ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {replay.win ? 'VICTOIRE' : 'DÉFAITE'}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {queueNames[replay.queueId] || replay.gameMode}
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-400">
                        {new Date(replay.gameCreation).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span className="font-semibold">{replay.championName}</span>
                      <span className="text-gray-500">•</span>
                      <span>
                        {replay.kills}/{replay.deaths}/{replay.assists}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span>{formatDuration(replay.gameDuration)}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-xs text-gray-500">{formatFileSize(replay.fileSize)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playReplay(replay)}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-glow transition-all duration-300 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Lire
                    </button>
                    <button
                      onClick={() => deleteReplay(replay.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
