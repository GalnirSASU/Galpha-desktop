import { useState, useEffect } from 'react';
import AccountSwitcher, { SavedAccount } from './AccountSwitcher';

interface LauncherDashboardProps {
  isLolRunning: boolean;
  currentSummoner: any | null;
}

export default function LauncherDashboard({
  isLolRunning,
  currentSummoner,
}: LauncherDashboardProps) {
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);

  // Load saved accounts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('galpha_accounts');
    if (stored) {
      const accounts: SavedAccount[] = JSON.parse(stored);
      setSavedAccounts(accounts);

      // Select highest rank account by default
      if (accounts.length > 0) {
        const highestRank = getHighestRankAccount(accounts);
        setSelectedAccount(highestRank);
      }
    }
  }, []);

  const getHighestRankAccount = (accounts: SavedAccount[]): SavedAccount => {
    const tierOrder = [
      'IRON',
      'BRONZE',
      'SILVER',
      'GOLD',
      'PLATINUM',
      'EMERALD',
      'DIAMOND',
      'MASTER',
      'GRANDMASTER',
      'CHALLENGER',
    ];

    return accounts.reduce((highest, current) => {
      const currentTierIndex = tierOrder.indexOf(current.tier || 'UNRANKED');
      const highestTierIndex = tierOrder.indexOf(highest.tier || 'UNRANKED');

      if (currentTierIndex > highestTierIndex) {
        return current;
      } else if (currentTierIndex === highestTierIndex && (current.lp || 0) > (highest.lp || 0)) {
        return current;
      }
      return highest;
    });
  };

  const handleSelectAccount = (account: SavedAccount) => {
    setSelectedAccount(account);
  };

  const handleAddAccount = () => {
    // TODO: Implement add account flow
    console.log('Add account clicked');
  };

  const displayAccount = isLolRunning && currentSummoner ? currentSummoner : selectedAccount;

  return (
    <div className="min-h-screen bg-base-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl animate-pulse-slow" />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl animate-pulse-slow"
        style={{ animationDelay: '1s' }}
      />

      {/* Content */}
      <div className="relative z-10 pt-16 px-8 pb-8">
        {/* Header section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 font-display">
              {isLolRunning ? 'Game Detected' : 'Welcome Back'}
            </h1>
            <p className="text-base-lighter">
              {isLolRunning ? 'Connected to League of Legends' : 'Launch League to sync your stats'}
            </p>
          </div>

          {/* Account switcher */}
          <AccountSwitcher
            accounts={savedAccounts}
            currentAccount={selectedAccount}
            onSelectAccount={handleSelectAccount}
            onAddAccount={handleAddAccount}
          />
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-base-darker/60 backdrop-blur-xl rounded-xl border border-base-light/20">
            <div
              className={`w-2 h-2 rounded-full ${isLolRunning ? 'bg-victory' : 'bg-base-lighter'} ${isLolRunning ? 'animate-pulse' : ''}`}
            />
            <span className="text-sm text-white">
              {isLolRunning ? 'League of Legends Running' : 'League of Legends Offline'}
            </span>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Profile card */}
          <div className="col-span-4">
            <div className="bg-base-darker/60 backdrop-blur-xl rounded-2xl border border-base-light/20 p-6 shadow-glow">
              {displayAccount ? (
                <div className="flex flex-col items-center">
                  {/* Profile icon with rank border */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl blur-xl opacity-50" />
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${displayAccount.profileIconId}.png`}
                      alt="Profile"
                      className="relative w-32 h-32 rounded-2xl border-4 border-accent-primary shadow-glow"
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-base-black border border-accent-primary rounded-full">
                      <span className="text-accent-primary font-bold text-sm">
                        {displayAccount.summonerLevel}
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <h2 className="text-2xl font-bold text-white mb-1">{displayAccount.gameName}</h2>
                  <p className="text-base-lighter text-sm mb-4">#{displayAccount.tagLine}</p>

                  {/* Rank badge */}
                  <div className="w-full bg-base-dark/50 rounded-xl p-4 border border-base-light/10">
                    <div className="text-center mb-2">
                      <span className="text-2xl font-bold text-rank-gold">
                        {displayAccount.tier} {displayAccount.rank}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-3xl font-bold text-white">{displayAccount.lp}</span>
                      <span className="text-base-lighter text-sm">LP</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="text-victory">{displayAccount.wins}W</span>
                      <span className="text-base-lighter">-</span>
                      <span className="text-defeat">{displayAccount.losses}L</span>
                      <span className="text-base-lighter">•</span>
                      <span className="text-white font-semibold">
                        {Math.round(
                          (displayAccount.wins / (displayAccount.wins + displayAccount.losses)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-base-dark rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-base-lighter"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-base-lighter">No account selected</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="col-span-8">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Quick stats */}
              <div className="bg-base-darker/60 backdrop-blur-xl rounded-2xl border border-base-light/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-accent-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold">Recent Performance</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base-lighter text-sm">Last 20 Games</span>
                    <span className="text-white font-bold">12W - 8L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base-lighter text-sm">Win Streak</span>
                    <span className="text-victory font-bold">+3</span>
                  </div>
                  <div className="w-full bg-base-dark rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-victory to-accent-primary h-2 rounded-full"
                      style={{ width: '60%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-base-darker/60 backdrop-blur-xl rounded-2xl border border-base-light/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent-secondary/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-accent-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold">Average KDA</h3>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">3.2</span>
                  <span className="text-base-lighter text-sm">:1</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-victory">8.5</span>
                  <span className="text-base-lighter">/</span>
                  <span className="text-defeat">6.2</span>
                  <span className="text-base-lighter">/</span>
                  <span className="text-accent-tertiary">11.4</span>
                </div>
              </div>
            </div>

            {/* Recent matches */}
            <div className="bg-base-darker/60 backdrop-blur-xl rounded-2xl border border-base-light/20 p-6">
              <h3 className="text-white font-semibold mb-4">Recent Matches</h3>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-base-dark/30 rounded-lg hover:bg-base-dark/50 transition-colors cursor-pointer group"
                  >
                    <div
                      className={`w-1 h-12 rounded-full ${i % 2 === 0 ? 'bg-victory' : 'bg-defeat'}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">Ranked Solo/Duo</span>
                        <span className={`text-xs ${i % 2 === 0 ? 'text-victory' : 'text-defeat'}`}>
                          {i % 2 === 0 ? 'Victory' : 'Defeat'}
                        </span>
                      </div>
                      <span className="text-base-lighter text-xs">2 hours ago</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-sm mb-1">12/4/8</div>
                      <div className="text-base-lighter text-xs">3.5 KDA</div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg ${i % 2 === 0 ? 'bg-victory/10 text-victory' : 'bg-defeat/10 text-defeat'} font-semibold text-sm`}
                    >
                      {i % 2 === 0 ? '+18' : '-16'} LP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
