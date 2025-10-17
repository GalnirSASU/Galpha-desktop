import { useState, useEffect, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import TopNavigation from './TopNavigation';
import OnboardingView from './OnboardingView';
import { useMatchHistory } from '../hooks/useMatchHistory';
import { getChampionIconUrl, handleChampionIconError } from '../utils/championIcon';
import type { Summoner, SavedAccount, DiscordUser, SummonerDetails, RankedStats } from '../types';

interface MainDashboardProps {
  isLolRunning: boolean;
  currentSummoner: Summoner | null;
  isLoadingSummoner?: boolean;
  discordUser?: DiscordUser | null;
}

export default function MainDashboard({ isLolRunning, currentSummoner }: MainDashboardProps) {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);
  const [isLoadingAccount, setIsLoadingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [lolClientAccount, setLolClientAccount] = useState<SavedAccount | null>(null);

  // Determine current account first
  const currentAccount = selectedAccount || lolClientAccount;

  // Load match history for the current account
  const {
    matches,
    isLoading: isLoadingMatches,
    error: matchesError,
  } = useMatchHistory(currentAccount?.puuid || null, !!currentAccount);

  // Load saved accounts from localStorage
  const [savedAccounts] = useState<SavedAccount[]>(() => {
    const stored = localStorage.getItem('galpha_accounts');
    return stored ? JSON.parse(stored) : [];
  });

  // Fetch ranked stats when LoL client account is detected
  useEffect(() => {
    const fetchLolClientStats = async () => {
      if (!currentSummoner) {
        // Don't reset lolClientAccount to null - keep the last known account
        // This prevents showing onboarding when LoL client closes
        return;
      }

      setIsLoadingAccount(true);
      setAccountError(null);

      try {
        // D'abord, récupérer le vrai PUUID via l'API Riot Account
        // Le PUUID du LCU est chiffré et ne peut pas être utilisé directement avec l'API Riot
        const accountData = await invoke<any>('get_account_by_riot_id', {
          gameName: currentSummoner.gameName || currentSummoner.displayName,
          tagLine: currentSummoner.tagLine || 'EUW',
        });

        console.log('Account data from Riot API:', accountData);

        // Utiliser le vrai PUUID pour récupérer les informations du summoner
        const summonerData = await invoke<SummonerDetails>('get_summoner_by_puuid', {
          puuid: accountData.puuid,
        });

        console.log('Summoner data from Riot API:', summonerData);

        // Récupérer les stats ranked (uniquement si on a un ID)
        let rankedData: RankedStats[] = [];
        if (summonerData.id) {
          rankedData = await invoke<RankedStats[]>('get_ranked_stats', {
            summonerId: summonerData.id,
          });
          console.log('Ranked data from Riot API:', rankedData);
        } else {
          console.warn('Summoner ID not available, skipping ranked stats');
        }

        // Trouver les stats de la queue Solo/Duo
        const soloQueue = Array.isArray(rankedData)
          ? rankedData.find((queue) => queue.queueType === 'RANKED_SOLO_5x5')
          : null;

        // Créer l'objet SavedAccount pour le compte du client LoL
        // Utiliser le vrai PUUID de l'API Riot, pas celui du LCU
        setLolClientAccount({
          puuid: accountData.puuid,
          gameName: accountData.gameName || currentSummoner.gameName || currentSummoner.displayName,
          tagLine: accountData.tagLine || currentSummoner.tagLine || 'EUW',
          summonerLevel: summonerData.summonerLevel,
          profileIconId: summonerData.profileIconId,
          tier: soloQueue?.tier || '',
          rank: soloQueue?.rank || '',
          lp: soloQueue?.leaguePoints || 0,
          wins: soloQueue?.wins || 0,
          losses: soloQueue?.losses || 0,
          lastPlayed: new Date().toISOString(),
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Failed to fetch LoL client account data:', error);
        setAccountError(errorMsg);
      } finally {
        setIsLoadingAccount(false);
      }
    };

    if (isLolRunning && currentSummoner) {
      fetchLolClientStats();
    }
  }, [currentSummoner, isLolRunning]);

  // Function to fetch real account data
  const fetchAccountData = async (account: SavedAccount) => {
    setIsLoadingAccount(true);
    setAccountError(null);

    try {
      // Si le compte a été ajouté manuellement, récupérer les données depuis l'API Riot
      if (account.puuid.startsWith('manual-')) {
        // Récupérer le compte par Riot ID
        const accountData = await invoke<{ puuid: string; gameName: string; tagLine: string }>(
          'get_account_by_riot_id',
          {
            gameName: account.gameName,
            tagLine: account.tagLine,
          }
        );

        console.log('Account data:', accountData);

        // Récupérer les informations du summoner
        const summonerData = await invoke<SummonerDetails>('get_summoner_by_puuid', {
          puuid: accountData.puuid,
        });

        console.log('Summoner data:', summonerData);
        console.log('Summoner data keys:', Object.keys(summonerData));
        console.log('Summoner ID field:', summonerData.id);

        // Récupérer les stats ranked (uniquement si on a un ID)
        let rankedData: RankedStats[] = [];
        if (summonerData.id) {
          rankedData = await invoke<RankedStats[]>('get_ranked_stats', {
            summonerId: summonerData.id,
          });
        } else {
          console.warn('Summoner ID not available, skipping ranked stats');
        }

        console.log('Ranked data:', rankedData);

        // Trouver les stats de la queue Solo/Duo
        const soloQueue = Array.isArray(rankedData)
          ? rankedData.find((queue) => queue.queueType === 'RANKED_SOLO_5x5')
          : null;

        // Mettre à jour le compte sélectionné avec les vraies données
        setSelectedAccount({
          ...account,
          puuid: accountData.puuid,
          summonerLevel: summonerData.summonerLevel,
          profileIconId: summonerData.profileIconId,
          tier: soloQueue?.tier || '',
          rank: soloQueue?.rank || '',
          lp: soloQueue?.leaguePoints || 0,
          wins: soloQueue?.wins || 0,
          losses: soloQueue?.losses || 0,
        });
      } else {
        // Pour les comptes déjà sauvegardés, utiliser directement les données
        setSelectedAccount(account);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Failed to fetch account data:', error);
      setAccountError(errorMsg);
    } finally {
      setIsLoadingAccount(false);
    }
  };

  // Handler pour la sélection d'un compte
  const handleAccountSelect = (account: SavedAccount) => {
    fetchAccountData(account);
  };

  // Debug logging
  console.log('MainDashboard state:', {
    isLolRunning,
    currentSummoner,
    selectedAccount,
    lolClientAccount,
    currentAccount,
    isLoadingAccount,
    accountError,
  });

  // Debug ranked data
  console.log('Ranked data debug:', {
    tier: currentAccount?.tier,
    rank: currentAccount?.rank,
    lp: currentAccount?.lp,
    wins: currentAccount?.wins,
    losses: currentAccount?.losses,
  });

  // Calculate winrate for current account
  const winrate =
    currentAccount &&
    currentAccount.wins !== undefined &&
    currentAccount.losses !== undefined &&
    currentAccount.wins + currentAccount.losses > 0
      ? ((currentAccount.wins / (currentAccount.wins + currentAccount.losses)) * 100).toFixed(0)
      : '0';

  // Calculate champion statistics from matches
  const championStats = useMemo(() => {
    if (!matches.length || !currentAccount?.puuid) return [];

    const statsMap = new Map<string, {
      championName: string;
      championId: number;
      games: number;
      wins: number;
      losses: number;
      totalKills: number;
      totalDeaths: number;
      totalAssists: number;
      totalCs: number;
      totalDamage: number;
    }>();

    matches.forEach((match) => {
      const playerData = match.participants.find((p) => p.puuid === currentAccount.puuid);
      if (!playerData) return;

      const existing = statsMap.get(playerData.championName) || {
        championName: playerData.championName,
        championId: playerData.championId,
        games: 0,
        wins: 0,
        losses: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalAssists: 0,
        totalCs: 0,
        totalDamage: 0,
      };

      existing.games += 1;
      if (playerData.win) existing.wins += 1;
      else existing.losses += 1;
      existing.totalKills += playerData.kills;
      existing.totalDeaths += playerData.deaths;
      existing.totalAssists += playerData.assists;
      existing.totalCs += playerData.totalMinionsKilled + playerData.neutralMinionsKilled;
      existing.totalDamage += playerData.totalDamageDealtToChampions;

      statsMap.set(playerData.championName, existing);
    });

    return Array.from(statsMap.values())
      .map((stat) => ({
        name: stat.championName,
        championId: stat.championId,
        games: stat.games,
        wins: stat.wins,
        losses: stat.losses,
        kda: stat.totalDeaths > 0
          ? ((stat.totalKills + stat.totalAssists) / stat.totalDeaths).toFixed(1)
          : '∞',
        avgKills: (stat.totalKills / stat.games).toFixed(1),
        avgDeaths: (stat.totalDeaths / stat.games).toFixed(1),
        avgAssists: (stat.totalAssists / stat.games).toFixed(1),
        avgCs: Math.round(stat.totalCs / stat.games),
        avgDamage: Math.round(stat.totalDamage / stat.games),
        winrate: Math.round((stat.wins / stat.games) * 100),
      }))
      .sort((a, b) => b.games - a.games); // Sort by most played
  }, [matches, currentAccount?.puuid]);

  // Calculate overall performance statistics from matches
  const performanceStats = useMemo(() => {
    if (!matches.length || !currentAccount?.puuid) {
      return {
        avgKda: '0',
        avgGpm: '0',
        avgKp: '0',
        avgCsm: '0',
        survivalRate: '0',
        avgTeamfightDeaths: '0',
        objectiveRate: '0',
        totalGames: 0,
      };
    }

    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalGold = 0;
    let totalCs = 0;
    let totalDuration = 0;
    let totalKillParticipation = 0;
    let gamesWithoutDeath = 0;
    // let totalObjectives = 0; // TODO: implement objectives tracking

    matches.forEach((match) => {
      const playerData = match.participants.find((p) => p.puuid === currentAccount.puuid);
      if (!playerData) return;

      totalKills += playerData.kills;
      totalDeaths += playerData.deaths;
      totalAssists += playerData.assists;
      totalGold += playerData.goldEarned;
      totalCs += playerData.totalMinionsKilled + playerData.neutralMinionsKilled;
      totalDuration += match.gameDuration;

      if (playerData.deaths === 0) gamesWithoutDeath++;

      // Calculate kill participation for this match
      const teamParticipants = match.participants.filter((p) => p.teamId === playerData.teamId);
      const teamKills = teamParticipants.reduce((sum, p) => sum + p.kills, 0);
      if (teamKills > 0) {
        const kp = ((playerData.kills + playerData.assists) / teamKills) * 100;
        totalKillParticipation += kp;
      }
    });

    const totalGames = matches.length;
    const avgKda = totalDeaths > 0
      ? (totalKills + totalAssists) / totalDeaths
      : totalKills + totalAssists;
    const avgGpm = (totalGold / (totalDuration / 60)).toFixed(0);
    const avgKp = (totalKillParticipation / totalGames).toFixed(0);
    const avgCsm = ((totalCs / (totalDuration / 60)) || 0).toFixed(1);
    const survivalRate = ((gamesWithoutDeath / totalGames) * 100).toFixed(0);
    const avgTeamfightDeaths = (totalDeaths / totalGames).toFixed(1);

    return {
      avgKda: avgKda.toFixed(1),
      avgGpm,
      avgKp,
      avgCsm,
      survivalRate,
      avgTeamfightDeaths,
      objectiveRate: '67', // This would need specific objective data from the match API
      totalGames,
    };
  }, [matches, currentAccount?.puuid]);

  // Show onboarding if no account is available
  if (!currentAccount && !isLoadingAccount) {
    console.log('Showing OnboardingView - no account available');
    return <OnboardingView savedAccounts={savedAccounts} onAccountSelect={handleAccountSelect} />;
  }

  // Show loading state
  if (isLoadingAccount) {
    return (
      <div className="min-h-screen bg-base-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-semibold mb-2">
            Chargement des données du compte...
          </p>
          <p className="text-gray-400 text-sm">Récupération depuis l'API Riot</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (accountError) {
    return (
      <div className="min-h-screen bg-base-black flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Erreur de chargement</h2>
          <p className="text-gray-300 mb-6">{accountError}</p>
          <button
            onClick={() => {
              setAccountError(null);
              setSelectedAccount(null);
            }}
            className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-tertiary text-white font-semibold rounded-xl shadow-gold hover:shadow-glow transition-all duration-300"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-base-black flex flex-col">
      {/* Top Navigation */}
      <TopNavigation currentView={currentView} onViewChange={setCurrentView} />

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-16">
        <div className="pb-8">
        {/* Hero Section - Summoner Info */}
        <div className="relative bg-gradient-to-br from-base-dark via-base-darker to-base-black border-b border-base-medium shadow-2xl overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Arcadia_0.jpg"
              alt="Champion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-base-black via-transparent to-transparent"></div>
          </div>

          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-transparent to-accent-secondary/5 animate-pulse-slow"></div>

          <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-8">
            <div className="flex items-center justify-between gap-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary p-1 shadow-gold">
                    <div className="w-full h-full rounded-lg bg-base-dark flex items-center justify-center overflow-hidden">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${currentAccount?.profileIconId || 29}.png`}
                        alt="Profile"
                        className="w-full h-full rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-accent-primary to-accent-secondary text-white px-2 py-0.5 rounded-md text-xs font-bold shadow-lg">
                    {currentAccount?.summonerLevel || 0}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-black text-white">
                      {currentAccount?.gameName || 'Unknown'}
                    </h1>
                    <span className="text-xl text-gray-400 font-semibold">
                      #{currentAccount?.tagLine || '---'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {currentAccount?.tier && currentAccount?.rank && currentAccount.tier !== '' ? (
                      <>
                        <div className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-lg">
                          <span className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 font-bold uppercase tracking-wide">
                            {currentAccount.tier} {currentAccount.rank}
                          </span>
                        </div>
                        <div className="h-4 w-px bg-gray-600"></div>
                        <span className="text-sm text-yellow-400 font-bold">{currentAccount.lp} LP</span>
                        <div className="h-4 w-px bg-gray-600"></div>
                        <span className="text-sm text-white font-bold">{winrate}% WR</span>
                        <span className="text-xs text-gray-400 font-medium">
                          ({currentAccount.wins}W - {currentAccount.losses}L)
                        </span>
                      </>
                    ) : (
                      <div className="px-3 py-1 bg-gray-700/30 border border-gray-600/50 rounded-lg">
                        <span className="text-sm text-gray-400 font-semibold">Non classé cette saison</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                {['Tout', 'Solo/Duo', 'Flex', 'ARAM'].map((filter, idx) => (
                  <button
                    key={filter}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                      idx === 0
                        ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white border-accent-primary shadow-lg shadow-accent-primary/30 scale-105'
                        : 'bg-base-medium/50 text-gray-400 border-base-light hover:bg-base-light hover:text-white hover:border-accent-primary/50 hover:scale-105'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          {/* Performance Cards - Full Width */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'KDA', value: performanceStats.avgKda, trend: '', color: parseFloat(performanceStats.avgKda) >= 3 ? 'green' : parseFloat(performanceStats.avgKda) >= 2 ? 'gray' : 'red', icon: '⚔️', bgGradient: 'from-red-500/20 to-orange-500/20' },
              { label: 'GPM', value: performanceStats.avgGpm, trend: '', color: parseInt(performanceStats.avgGpm) >= 350 ? 'green' : parseInt(performanceStats.avgGpm) >= 300 ? 'gray' : 'red', icon: '💰', bgGradient: 'from-yellow-500/20 to-amber-500/20' },
              { label: 'KP', value: `${performanceStats.avgKp}%`, trend: '', color: parseInt(performanceStats.avgKp) >= 60 ? 'green' : 'gray', icon: '🎯', bgGradient: 'from-blue-500/20 to-cyan-500/20' },
              { label: 'CS/M', value: performanceStats.avgCsm, trend: '', color: parseFloat(performanceStats.avgCsm) >= 5 ? 'green' : 'gray', icon: '🗡️', bgGradient: 'from-purple-500/20 to-pink-500/20' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden bg-gradient-to-br from-base-dark to-base-darker rounded-2xl p-5 border border-base-medium hover:border-accent-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent-primary/10 hover:scale-105 cursor-pointer"
              >
                {/* Background gradient specific to stat type */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>

                {/* Hexagon pattern overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      {stat.label}
                    </div>
                    <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-4xl font-black text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-accent-primary transition-all duration-300">
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${
                      stat.color === 'green'
                        ? 'bg-green-400 shadow-lg shadow-green-400/50'
                        : stat.color === 'red'
                          ? 'bg-red-400 shadow-lg shadow-red-400/50'
                          : 'bg-gray-400 shadow-lg shadow-gray-400/50'
                    } group-hover:animate-pulse`}></div>
                    <span
                      className={`text-xs font-semibold ${
                        stat.color === 'green'
                          ? 'text-green-400'
                          : stat.color === 'red'
                            ? 'text-red-400'
                            : 'text-gray-400'
                      }`}
                    >
                      {performanceStats.totalGames} parties
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-3 gap-6">
            {/* Match History - Takes 2 columns */}
            <div className="col-span-2 bg-gradient-to-br from-base-dark to-base-darker rounded-2xl border border-base-medium p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-xl">⚔️</span>
                </div>
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Historique des matchs</span>
                {isLoadingMatches && (
                  <span className="text-sm font-normal text-gray-400 ml-2">Chargement...</span>
                )}
              </h2>

              {matchesError && (
                <div className="text-red-400 text-sm mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  {matchesError}
                </div>
              )}

              <div className="space-y-3">
                {matches.length === 0 && !isLoadingMatches ? (
                  <div className="text-center py-8 text-gray-400">
                    Aucun match trouvé. Jouez quelques parties pour voir votre historique!
                  </div>
                ) : (
                  matches.map((match) => {
                    // Find the player's participant data
                    const playerData = match.participants.find((p) => p.puuid === currentAccount?.puuid);
                    const isWin = playerData?.win || false;
                    const kda =
                      playerData && playerData.deaths > 0
                        ? ((playerData.kills + playerData.assists) / playerData.deaths).toFixed(1)
                        : '∞';
                    const totalCs =
                      (playerData?.totalMinionsKilled || 0) + (playerData?.neutralMinionsKilled || 0);
                    const gameDurationMin = Math.floor(match.gameDuration / 60);
                    const gameDurationSec = match.gameDuration % 60;
                    const timeAgo = new Date(match.gameCreation).toLocaleDateString();

                    // Queue name mapping
                    const queueNames: { [key: number]: string } = {
                      420: 'Ranked Solo/Duo',
                      440: 'Ranked Flex',
                      450: 'ARAM',
                      400: 'Normal Draft',
                      430: 'Normal Blind',
                    };

                    return (
                      <div
                        key={match.matchId}
                        className={`group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer ${
                          isWin
                            ? 'bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/30 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20'
                            : 'bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border border-red-500/30 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/20'
                        } hover:scale-[1.01] hover:-translate-y-1`}
                      >
                        {/* Victory/Defeat Indicator */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${isWin ? 'bg-gradient-to-b from-blue-400 to-blue-600' : 'bg-gradient-to-b from-red-400 to-red-600'}`}></div>

                        <div className="p-4 pl-5">
                          <div className="flex items-center gap-4">
                            {/* Champion Icon with Level */}
                            <div className="relative">
                              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-base-medium to-base-dark border-2 border-base-light group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 overflow-hidden">
                                {playerData && (
                                  <img
                                    src={getChampionIconUrl(playerData.championName)}
                                    alt={playerData.championName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => handleChampionIconError(e, playerData.championName, playerData.championId)}
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>
                              <div className="absolute -bottom-1 -right-1 bg-base-dark border border-base-light rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white">
                                {(playerData as any)?.champLevel || 1}
                              </div>
                            </div>

                            {/* Match Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${isWin ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'}`}>
                                  {isWin ? 'VICTOIRE' : 'DÉFAITE'}
                                </span>
                                <span className="text-sm font-semibold text-white">
                                  {queueNames[match.queueId] || match.gameMode}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <span>{playerData?.championName}</span>
                                <span>•</span>
                                <span>{gameDurationMin}:{gameDurationSec.toString().padStart(2, '0')}</span>
                                <span>•</span>
                                <span>{timeAgo}</span>
                              </div>
                            </div>

                            {/* KDA Stats */}
                            <div className="text-center px-4 border-l border-base-medium">
                              <div className={`text-2xl font-bold transition-all duration-300 ${
                                isWin ? 'text-blue-400 group-hover:text-blue-300' : 'text-red-400 group-hover:text-red-300'
                              }`}>
                                {playerData?.kills || 0} / {playerData?.deaths || 0} / {playerData?.assists || 0}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                <span className="text-accent-primary font-bold">{kda}</span> KDA
                              </div>
                            </div>

                            {/* CS & Gold */}
                            <div className="text-center px-4 border-l border-base-medium">
                              <div className="text-lg font-bold text-white">{totalCs}</div>
                              <div className="text-xs text-gray-400">CS</div>
                              <div className="text-xs text-yellow-400 mt-1">
                                {((playerData?.goldEarned || 0) / 1000).toFixed(1)}k 💰
                              </div>
                            </div>

                            {/* Damage */}
                            <div className="text-center px-4 border-l border-base-medium">
                              <div className="text-lg font-bold text-orange-400">
                                {((playerData?.totalDamageDealtToChampions || 0) / 1000).toFixed(1)}k
                              </div>
                              <div className="text-xs text-gray-400">Dégâts</div>
                              <div className="text-xs text-green-400 mt-1">
                                {playerData?.visionScore || 0} 👁️
                              </div>
                            </div>

                            {/* Win/Loss Badge */}
                            <div className="text-center">
                              <div className={`text-4xl font-black ${isWin ? 'text-blue-400' : 'text-red-400'}`}>
                                {isWin ? 'V' : 'D'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column - Stats (1 column) */}
            <div className="col-span-1 space-y-6">
              {/* Champion Performance */}
              <div className="bg-gradient-to-br from-base-dark to-base-darker rounded-2xl border border-base-medium p-6 shadow-lg hover:border-accent-primary/30 transition-all duration-300">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/30">
                    <span className="text-xl">🏆</span>
                  </div>
                  <span className="bg-gradient-to-r from-white to-accent-secondary bg-clip-text text-transparent">
                    Performance par champion
                  </span>
                </h2>
                <div className="space-y-3">
                  {championStats.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Jouez des parties pour voir vos statistiques par champion
                    </div>
                  ) : (
                    championStats.slice(0, 5).map((champ) => (
                      <div
                        key={champ.name}
                        className="group relative overflow-hidden p-4 bg-gradient-to-r from-base-medium to-base-darker rounded-xl border border-base-light hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/20 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                      >
                        {/* Winrate progress bar background */}
                        <div className="absolute inset-0 opacity-20">
                          <div
                            className={`h-full transition-all duration-500 ${
                              champ.winrate >= 50 ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30' : 'bg-gradient-to-r from-red-500/30 to-orange-500/30'
                            }`}
                            style={{ width: `${champ.winrate}%` }}
                          ></div>
                        </div>

                        <div className="relative flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-base-light to-base-medium border-2 border-base-lighter group-hover:border-accent-primary/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 flex-shrink-0">
                            <img
                              src={getChampionIconUrl(champ.name)}
                              alt={champ.name}
                              className="w-full h-full object-cover"
                              onError={(e) => handleChampionIconError(e, champ.name, champ.championId)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-accent-secondary transition-all duration-300 mb-1">
                              {champ.name}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                                {champ.wins}W - {champ.losses}L
                              </div>
                              <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                              <div
                                className={`text-xs font-bold ${
                                  champ.winrate >= 50 ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {champ.winrate}% WR
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold text-accent-primary mb-1">
                              {champ.kda}
                            </div>
                            <div className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                              {champ.avgKills}/{champ.avgDeaths}/{champ.avgAssists}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-base-dark to-base-darker rounded-2xl border border-base-medium p-6 shadow-lg hover:border-accent-primary/30 transition-all duration-300">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <span className="text-xl">⚡</span>
                  </div>
                  <span className="bg-gradient-to-r from-white to-accent-secondary bg-clip-text text-transparent">
                    Statistiques rapides
                  </span>
                </h2>
                <div className="space-y-3">
                  {[
                    {
                      icon: '⚔️',
                      label: 'Survie sans morts',
                      value: `${performanceStats.survivalRate}%`,
                      progress: parseInt(performanceStats.survivalRate),
                      games: `${performanceStats.totalGames} parties`,
                      color: parseInt(performanceStats.survivalRate) >= 30 ? 'from-green-500 to-emerald-500' : parseInt(performanceStats.survivalRate) >= 15 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-orange-500',
                    },
                    {
                      icon: '💀',
                      label: 'Morts moyennes',
                      value: performanceStats.avgTeamfightDeaths,
                      progress: Math.max(0, 100 - (parseFloat(performanceStats.avgTeamfightDeaths) * 10)),
                      games: 'par partie',
                      color: parseFloat(performanceStats.avgTeamfightDeaths) <= 4 ? 'from-green-500 to-emerald-500' : parseFloat(performanceStats.avgTeamfightDeaths) <= 6 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-orange-500',
                    },
                    {
                      icon: '🎯',
                      label: 'Kill Participation',
                      value: `${performanceStats.avgKp}%`,
                      progress: parseInt(performanceStats.avgKp),
                      games: 'moyenne',
                      color: parseInt(performanceStats.avgKp) >= 60 ? 'from-green-500 to-emerald-500' : parseInt(performanceStats.avgKp) >= 50 ? 'from-blue-500 to-cyan-500' : 'from-yellow-500 to-orange-500',
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="group relative overflow-hidden p-4 bg-gradient-to-r from-base-medium to-base-darker rounded-xl border border-base-light hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/10 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                    >
                      {/* Progress bar background */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-base-black/50">
                        <div
                          className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                          style={{ width: `${Math.min(100, stat.progress)}%` }}
                        ></div>
                      </div>

                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`text-xl w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                          >
                            {stat.icon}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-accent-secondary transition-all duration-300">
                              {stat.label}
                            </div>
                            {stat.games && (
                              <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300 mt-0.5">
                                {stat.games}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-white">
                            {stat.value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
