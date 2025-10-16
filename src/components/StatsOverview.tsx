interface StatsOverviewProps {
  stats: {
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
  };
}

function StatsOverview({ stats }: StatsOverviewProps) {
  const getKdaColor = (kda: number) => {
    if (kda >= 4) return 'text-gold-500';
    if (kda >= 3) return 'text-victory';
    if (kda >= 2) return 'text-primary-400';
    return 'text-gray-300';
  };

  const getWinrateColor = (winrate: number) => {
    if (winrate >= 60) return 'text-victory';
    if (winrate >= 50) return 'text-primary-400';
    if (winrate >= 45) return 'text-gray-300';
    return 'text-defeat';
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Games */}
        <div className="stat-card">
          <div className="text-sm text-gray-500 mb-2">Total Games</div>
          <div className="text-3xl font-bold">{stats.totalGames}</div>
          <div className="text-xs text-gray-400 mt-2">
            {stats.wins}W / {stats.losses}L
          </div>
        </div>

        {/* Winrate */}
        <div className="stat-card">
          <div className="text-sm text-gray-500 mb-2">Winrate</div>
          <div className={`text-3xl font-bold ${getWinrateColor(stats.winrate)}`}>
            {stats.winrate.toFixed(1)}%
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2 mt-3">
            <div
              className={`h-2 rounded-full ${stats.winrate >= 50 ? 'bg-victory' : 'bg-defeat'}`}
              style={{ width: `${Math.min(stats.winrate, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* KDA */}
        <div className="stat-card">
          <div className="text-sm text-gray-500 mb-2">KDA</div>
          <div className={`text-3xl font-bold ${getKdaColor(stats.kda)}`}>
            {stats.kda.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {stats.avgKills.toFixed(1)} / {stats.avgDeaths.toFixed(1)} /{' '}
            {stats.avgAssists.toFixed(1)}
          </div>
        </div>

        {/* CS/min */}
        <div className="stat-card">
          <div className="text-sm text-gray-500 mb-2">Avg CS</div>
          <div className="text-3xl font-bold">{stats.avgCs.toFixed(1)}</div>
          <div className="text-xs text-gray-400 mt-2">per game</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Detailed Statistics</h3>

        <div className="space-y-4">
          {/* Damage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Avg Damage to Champions</span>
              <span className="font-bold text-primary-400">{stats.avgDamageDealt.toFixed(0)}</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-600 to-primary-400 h-2 rounded-full"
                style={{ width: `${Math.min((stats.avgDamageDealt / 30000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Vision Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Avg Vision Score</span>
              <span className="font-bold text-primary-400">{stats.avgVisionScore.toFixed(1)}</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-600 to-primary-400 h-2 rounded-full"
                style={{ width: `${Math.min((stats.avgVisionScore / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Kill Participation */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Avg Kill Participation</span>
              <span className="font-bold text-primary-400">
                {((stats.avgKills + stats.avgAssists) / 1).toFixed(1)}
              </span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-victory to-primary-400 h-2 rounded-full"
                style={{
                  width: `${Math.min(((stats.avgKills + stats.avgAssists) / 30) * 100, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Badges */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Performance Analysis</h3>

        <div className="flex flex-wrap gap-2">
          {stats.kda >= 4 && <span className="badge badge-gold">Elite KDA ⭐</span>}
          {stats.winrate >= 60 && <span className="badge badge-victory">High Winrate 🏆</span>}
          {stats.avgCs >= 150 && <span className="badge badge-gold">CS Master 💰</span>}
          {stats.avgVisionScore >= 50 && (
            <span className="badge text-purple-400 bg-purple-500/20 border border-purple-500/30">
              Vision Expert 👁️
            </span>
          )}
          {stats.avgDamageDealt >= 20000 && (
            <span className="badge text-red-400 bg-red-500/20 border border-red-500/30">
              High Damage 💥
            </span>
          )}
          {stats.totalGames < 10 && (
            <span className="badge text-gray-400 bg-gray-500/20 border border-gray-500/30">
              New Player 🌱
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsOverview;
