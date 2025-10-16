interface SummonerProfileProps {
  summoner: {
    displayName: string;
    gameName: string | null;
    tagLine: string | null;
    puuid: string;
    summonerLevel: number;
    profileIconId: number;
  };
}

function SummonerProfile({ summoner }: SummonerProfileProps) {
  const iconUrl = `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${summoner.profileIconId}.png`;
  const gameName = summoner.gameName || summoner.displayName;
  const tagLine = summoner.tagLine || 'EUW';

  return (
    <div className="card animate-fade-in">
      <div className="text-center">
        {/* Profile Icon */}
        <div className="relative inline-block mb-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary-500 shadow-lg animate-glow">
            <img
              src={iconUrl}
              alt="Profile Icon"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=LoL';
              }}
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-dark-900 px-3 py-1 rounded-full border-2 border-gold-500">
            <span className="text-gold-500 font-bold text-sm">{summoner.summonerLevel}</span>
          </div>
        </div>

        {/* Summoner Name */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-1">
            {gameName}
            <span className="text-gray-500 text-lg">#{tagLine}</span>
          </h2>
          <p className="text-sm text-gray-500 font-mono">Level {summoner.summonerLevel}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="glassmorphism rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Region</div>
            <div className="font-bold text-primary-400">EUW</div>
          </div>
          <div className="glassmorphism rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Rank</div>
            <div className="font-bold text-gray-300">Unranked</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2">
          <button className="w-full btn-primary">Sync Matches</button>
          <button className="w-full btn-secondary">View Profile</button>
        </div>
      </div>
    </div>
  );
}

export default SummonerProfile;
