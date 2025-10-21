import { useMemo } from 'react';
import type { MatchData } from '../types';

interface ProgressionChartProps {
  matches: MatchData[];
  puuid: string;
  statType: 'kda' | 'winrate' | 'cs' | 'damage';
}

export default function ProgressionChart({ matches, puuid, statType }: ProgressionChartProps) {
  // Calculate progression data (last 20 matches)
  const progressionData = useMemo(() => {
    const recentMatches = matches.slice(0, 20).reverse(); // Get last 20, oldest first
    const data: { value: number; label: string; isWin: boolean }[] = [];

    recentMatches.forEach((match, index) => {
      const playerData = match.participants.find((p) => p.puuid === puuid);
      if (!playerData) return;

      let value = 0;
      switch (statType) {
        case 'kda':
          value = playerData.deaths > 0
            ? (playerData.kills + playerData.assists) / playerData.deaths
            : playerData.kills + playerData.assists;
          break;
        case 'winrate':
          // Calculate rolling winrate for last N games
          const lastNGames = recentMatches.slice(0, index + 1);
          const wins = lastNGames.filter((m) => {
            const p = m.participants.find((participant) => participant.puuid === puuid);
            return p?.win;
          }).length;
          value = (wins / (index + 1)) * 100;
          break;
        case 'cs':
          value = (playerData.totalMinionsKilled + playerData.neutralMinionsKilled) /
            (match.gameDuration / 60);
          break;
        case 'damage':
          value = playerData.totalDamageDealtToChampions / 1000;
          break;
      }

      data.push({
        value,
        label: `#${index + 1}`,
        isWin: playerData.win,
      });
    });

    return data;
  }, [matches, puuid, statType]);

  // Calculate trend (positive if improving)
  const trend = useMemo(() => {
    if (progressionData.length < 5) return 0;

    const firstHalf = progressionData.slice(0, Math.floor(progressionData.length / 2));
    const secondHalf = progressionData.slice(Math.floor(progressionData.length / 2));

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;

    return ((secondAvg - firstAvg) / firstAvg) * 100;
  }, [progressionData]);

  const statLabels = {
    kda: 'KDA',
    winrate: 'Winrate',
    cs: 'CS/min',
    damage: 'Dégâts (k)',
  };

  const statColors = {
    kda: { positive: 'from-purple-500 to-pink-500', line: '#a855f7' },
    winrate: { positive: 'from-blue-500 to-cyan-500', line: '#3b82f6' },
    cs: { positive: 'from-yellow-500 to-orange-500', line: '#eab308' },
    damage: { positive: 'from-red-500 to-orange-500', line: '#ef4444' },
  };

  if (progressionData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Pas assez de données pour afficher la progression
      </div>
    );
  }

  const maxValue = Math.max(...progressionData.map((d) => d.value));
  const minValue = Math.min(...progressionData.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;

  return (
    <div className="space-y-3">
      {/* Header with trend */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">{statLabels[statType]}</h3>
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${
          trend > 5 ? 'text-green-400' : trend < -5 ? 'text-red-400' : 'text-gray-400'
        }`}>
          {trend > 5 ? '↗' : trend < -5 ? '↘' : '→'}
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-32 bg-base-black/30 rounded-xl p-4 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-px bg-base-medium/30"></div>
          ))}
        </div>

        {/* Line chart */}
        <svg className="absolute inset-0 w-full h-full p-4" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${statType}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={statColors[statType].line} stopOpacity="0.3" />
              <stop offset="100%" stopColor={statColors[statType].line} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          <path
            d={
              progressionData.map((d, i) => {
                const x = (i / (progressionData.length - 1)) * 100;
                const y = 100 - ((d.value - minValue) / valueRange) * 100;
                return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
              }).join(' ') + ` L 100 100 L 0 100 Z`
            }
            fill={`url(#gradient-${statType})`}
          />

          {/* Line */}
          <path
            d={progressionData.map((d, i) => {
              const x = (i / (progressionData.length - 1)) * 100;
              const y = 100 - ((d.value - minValue) / valueRange) * 100;
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            }).join(' ')}
            stroke={statColors[statType].line}
            strokeWidth="2"
            fill="none"
          />

          {/* Points */}
          {progressionData.map((d, i) => {
            const x = (i / (progressionData.length - 1)) * 100;
            const y = 100 - ((d.value - minValue) / valueRange) * 100;
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                r="3"
                fill={d.isWin ? '#3b82f6' : '#ef4444'}
                className="transition-all duration-200 hover:r-5"
              />
            );
          })}
        </svg>
      </div>

      {/* Stats summary */}
      <div className="flex items-center justify-between text-xs">
        <div className="text-gray-400">
          Moy: <span className="text-white font-semibold">
            {(progressionData.reduce((sum, d) => sum + d.value, 0) / progressionData.length).toFixed(1)}
          </span>
        </div>
        <div className="text-gray-400">
          Max: <span className="text-green-400 font-semibold">{maxValue.toFixed(1)}</span>
        </div>
        <div className="text-gray-400">
          Min: <span className="text-red-400 font-semibold">{minValue.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
