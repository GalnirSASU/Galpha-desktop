import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getChampionIconUrl, handleChampionIconError } from '../utils/championIcon';
import type { RankedStats } from '../types';

interface ActiveGameInfo {
  phase: string;
  gameData: {
    teamOne: GameParticipant[];
    teamTwo: GameParticipant[];
  };
}

interface GameParticipant {
  summonerId: number;
  summonerName?: string;
  puuid: string;
  championId: number;
  teamId: number;
}

interface PlayerData {
  puuid: string;
  summonerName: string;
  championId: number;
  championName: string;
  summonerLevel: number;
  profileIconId: number;
  rankedStats?: {
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
  };
  isLoading: boolean;
}

// Champion ID to name mapping (partial - can be extended)
const CHAMPION_ID_MAP: Record<number, string> = {
  1: 'Annie', 2: 'Olaf', 3: 'Galio', 4: 'TwistedFate', 5: 'XinZhao',
  6: 'Urgot', 7: 'LeBlanc', 8: 'Vladimir', 9: 'Fiddlesticks', 10: 'Kayle',
  11: 'MasterYi', 12: 'Alistar', 13: 'Ryze', 14: 'Sion', 15: 'Sivir',
  16: 'Soraka', 17: 'Teemo', 18: 'Tristana', 19: 'Warwick', 20: 'Nunu',
  21: 'MissFortune', 22: 'Ashe', 23: 'Tryndamere', 24: 'Jax', 25: 'Morgana',
  26: 'Zilean', 27: 'Singed', 28: 'Evelynn', 29: 'Twitch', 30: 'Karthus',
  31: 'Chogath', 32: 'Amumu', 33: 'Rammus', 34: 'Anivia', 35: 'Shaco',
  36: 'DrMundo', 37: 'Sona', 38: 'Kassadin', 39: 'Irelia', 40: 'Janna',
  41: 'Gangplank', 42: 'Corki', 43: 'Karma', 44: 'Taric', 45: 'Veigar',
  48: 'Trundle', 50: 'Swain', 51: 'Caitlyn', 53: 'Blitzcrank', 54: 'Malphite',
  55: 'Katarina', 56: 'Nocturne', 57: 'Maokai', 58: 'Renekton', 59: 'JarvanIV',
  60: 'Elise', 61: 'Orianna', 62: 'Wukong', 63: 'Brand', 64: 'LeeSin',
  67: 'Vayne', 68: 'Rumble', 69: 'Cassiopeia', 72: 'Skarner', 74: 'Heimerdinger',
  75: 'Nasus', 76: 'Nidalee', 77: 'Udyr', 78: 'Poppy', 79: 'Gragas',
  80: 'Pantheon', 81: 'Ezreal', 82: 'Mordekaiser', 83: 'Yorick', 84: 'Akali',
  85: 'Kennen', 86: 'Garen', 89: 'Leona', 90: 'Malzahar', 91: 'Talon',
  92: 'Riven', 96: 'KogMaw', 98: 'Shen', 99: 'Lux', 101: 'Xerath',
  102: 'Shyvana', 103: 'Ahri', 104: 'Graves', 105: 'Fizz', 106: 'Volibear',
  107: 'Rengar', 110: 'Varus', 111: 'Nautilus', 112: 'Viktor', 113: 'Sejuani',
  114: 'Fiora', 115: 'Ziggs', 117: 'Lulu', 119: 'Draven', 120: 'Hecarim',
  121: 'Khazix', 122: 'Darius', 126: 'Jayce', 127: 'Lissandra', 131: 'Diana',
  133: 'Quinn', 134: 'Syndra', 136: 'AurelionSol', 141: 'Kayn', 142: 'Zoe',
  143: 'Zyra', 145: 'Kaisa', 147: 'Seraphine', 150: 'Gnar', 154: 'Zac',
  157: 'Yasuo', 161: 'Velkoz', 163: 'Taliyah', 164: 'Camille', 166: 'Akshan',
  200: 'Belveth', 201: 'Braum', 202: 'Jhin', 203: 'Kindred', 221: 'Zeri',
  222: 'Jinx', 223: 'TahmKench', 234: 'Viego', 235: 'Senna', 236: 'Lucian',
  238: 'Zed', 240: 'Kled', 245: 'Ekko', 246: 'Qiyana', 254: 'Vi',
  266: 'Aatrox', 267: 'Nami', 268: 'Azir', 350: 'Yuumi', 360: 'Samira',
  412: 'Thresh', 420: 'Illaoi', 421: 'RekSai', 427: 'Ivern', 429: 'Kalista',
  432: 'Bard', 497: 'Rakan', 498: 'Xayah', 516: 'Ornn', 517: 'Sylas',
  518: 'Neeko', 523: 'Aphelios', 526: 'Rell', 555: 'Pyke', 777: 'Yone',
  875: 'Sett', 876: 'Lillia', 887: 'Gwen', 888: 'Renata', 893: 'Aurora',
  895: 'Nilah', 897: 'KSante', 902: 'Milio', 910: 'Hwei', 950: 'Naafiri',
  901: 'Smolder', 900: 'Mel',
};

function getChampionName(championId: number): string {
  return CHAMPION_ID_MAP[championId] || `Champion${championId}`;
}

export default function LiveGame() {
  const [activeGame, setActiveGame] = useState<ActiveGameInfo | null>(null);
  const [playersData, setPlayersData] = useState<Map<string, PlayerData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active game data
  useEffect(() => {
    const fetchActiveGame = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const game = await invoke<ActiveGameInfo | null>('get_active_game');

        if (!game) {
          setError('Aucune partie en cours détectée');
          setActiveGame(null);
          setPlayersData(new Map());
          return;
        }

        setActiveGame(game);

        // Fetch data for all players
        const allPlayers = [...game.gameData.teamOne, ...game.gameData.teamTwo];
        const newPlayersData = new Map<string, PlayerData>();

        for (const participant of allPlayers) {
          const championName = getChampionName(participant.championId);

          // Initialize with basic data
          newPlayersData.set(participant.puuid, {
            puuid: participant.puuid,
            summonerName: participant.summonerName || 'Unknown',
            championId: participant.championId,
            championName,
            summonerLevel: 0,
            profileIconId: 0,
            isLoading: true,
          });

          // Fetch detailed data in background
          fetchPlayerData(participant.puuid, championName).then((data) => {
            if (data) {
              setPlayersData((prev) => new Map(prev).set(participant.puuid, data));
            }
          });
        }

        setPlayersData(newPlayersData);
      } catch (err) {
        console.error('Failed to fetch active game:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveGame();

    // Poll every 10 seconds for updates
    const interval = setInterval(fetchActiveGame, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch player detailed data
  const fetchPlayerData = async (puuid: string, championName: string): Promise<PlayerData | null> => {
    try {
      // Get summoner data
      const summonerData = await invoke<any>('get_summoner_by_puuid', { puuid });

      // Get ranked stats using the new PUUID-based endpoint
      let rankedStats = null;
      try {
        const rankedData = await invoke<RankedStats[]>('get_ranked_stats_by_puuid', { puuid });

        const soloQueue = rankedData?.find((queue) => queue.queueType === 'RANKED_SOLO_5x5');
        if (soloQueue) {
          rankedStats = {
            tier: soloQueue.tier,
            rank: soloQueue.rank,
            leaguePoints: soloQueue.leaguePoints,
            wins: soloQueue.wins,
            losses: soloQueue.losses,
          };
        }
      } catch (rankedErr) {
        console.warn(`Could not fetch ranked stats for ${puuid}:`, rankedErr);
        // Continue without ranked stats - player might be unranked
      }

      return {
        puuid,
        summonerName: summonerData.name || 'Unknown',
        championId: 0, // Will be updated
        championName,
        summonerLevel: summonerData.summonerLevel || 0,
        profileIconId: summonerData.profileIconId || 0,
        rankedStats: rankedStats || undefined,
        isLoading: false,
      };
    } catch (err) {
      console.error(`Failed to fetch player data for ${puuid}:`, err);
      return null;
    }
  };

  const renderPlayerCard = (participant: GameParticipant, isAlly: boolean) => {
    const playerData = playersData.get(participant.puuid);
    const championName = getChampionName(participant.championId);

    if (!playerData) return null;

    const winrate = playerData.rankedStats
      ? Math.round((playerData.rankedStats.wins / (playerData.rankedStats.wins + playerData.rankedStats.losses)) * 100)
      : 0;

    return (
      <div
        key={participant.puuid}
        className={`group relative overflow-hidden p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
          isAlly
            ? 'bg-gradient-to-r from-blue-900/30 to-blue-800/30 border-blue-500/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20'
            : 'bg-gradient-to-r from-red-900/30 to-red-800/30 border-red-500/30 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/20'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Champion Icon */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-base-light to-base-medium border-2 border-base-lighter group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
            <img
              src={getChampionIconUrl(championName)}
              alt={championName}
              className="w-full h-full object-cover"
              onError={(e) => handleChampionIconError(e, championName, participant.championId)}
            />
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-white mb-1 truncate">
              {playerData.summonerName}
            </div>
            <div className="text-sm text-gray-400 mb-2">
              {championName} • Niveau {playerData.summonerLevel}
            </div>

            {playerData.isLoading ? (
              <div className="text-xs text-gray-500">Chargement des stats...</div>
            ) : playerData.rankedStats ? (
              <div className="flex items-center gap-3">
                <div className="text-xs font-semibold text-accent-primary">
                  {playerData.rankedStats.tier} {playerData.rankedStats.rank}
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                <div className="text-xs text-gray-400">
                  {playerData.rankedStats.wins}W - {playerData.rankedStats.losses}L
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                <div className={`text-xs font-bold ${winrate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {winrate}% WR
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">Non classé</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base-lighter text-lg">Recherche de partie en cours...</p>
        </div>
      </div>
    );
  }

  if (error || !activeGame) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="max-w-md w-full bg-gradient-to-br from-base-dark to-base-darker rounded-2xl border border-base-medium p-8 text-center">
          <div className="w-16 h-16 bg-base-medium rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Aucune partie en cours</h2>
          <p className="text-gray-400 mb-4">
            Rejoignez une partie pour voir les statistiques des joueurs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-base-dark to-base-darker rounded-2xl border border-base-medium p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-glow-sm"></div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-accent-secondary bg-clip-text text-transparent">
            Partie en cours
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
          Phase: <span className="text-accent-primary font-semibold">{activeGame.phase}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Blue Team (Allies) */}
        <div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl px-4 py-3 mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <span>🛡️</span>
              <span>Équipe Bleue</span>
            </h2>
          </div>
          <div className="space-y-3">
            {activeGame.gameData.teamOne.map((participant) =>
              renderPlayerCard(participant, true)
            )}
          </div>
        </div>

        {/* Red Team (Enemies) */}
        <div>
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-t-xl px-4 py-3 mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <span>⚔️</span>
              <span>Équipe Rouge</span>
            </h2>
          </div>
          <div className="space-y-3">
            {activeGame.gameData.teamTwo.map((participant) =>
              renderPlayerCard(participant, false)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
