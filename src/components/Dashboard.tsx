import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import SummonerProfile from './SummonerProfile';
import StatsOverview from './StatsOverview';

interface DashboardProps {
  summoner: {
    displayName: string;
    gameName: string | null;
    tagLine: string | null;
    puuid: string;
    summonerLevel: number;
    profileIconId: number;
  };
}

interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winrate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  kda: number;
  avgCs: number;
  avgDamageDealt: number;
  avgVisionScore: number;
}

function Dashboard({ summoner }: DashboardProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [summoner.puuid]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await invoke<PlayerStats>('get_player_stats', {
        puuid: summoner.puuid,
      });
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Header */}
      <header className="glassmorphism border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🎮</div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Galpha Desktop</h1>
                <p className="text-xs text-gray-500">League Stats Tracker</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Connected
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Profile */}
          <div className="lg:col-span-1">
            <SummonerProfile summoner={summoner} />
          </div>

          {/* Right Column - Stats */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="card h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading statistics...</p>
                </div>
              </div>
            ) : stats && stats.totalGames > 0 ? (
              <StatsOverview stats={stats} />
            ) : (
              <div className="card h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-bold mb-2">No Match History</h3>
                  <p className="text-gray-400 mb-4">
                    Play some games and your stats will appear here!
                  </p>
                  <p className="text-sm text-gray-500">
                    Galpha automatically tracks your matches when you play.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Match History Section */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Match History</h2>
            <button className="btn-secondary text-sm">Refresh</button>
          </div>

          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
            <p className="text-gray-400">Match history will be displayed here once implemented</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
