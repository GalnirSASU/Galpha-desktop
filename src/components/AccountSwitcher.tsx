import { useState } from 'react';

export interface SavedAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
  summonerLevel: number;
  profileIconId: number;
  rank?: string;
  tier?: string;
  lp?: number;
  wins?: number;
  losses?: number;
  lastPlayed?: string;
}

interface AccountSwitcherProps {
  accounts: SavedAccount[];
  currentAccount: SavedAccount | null;
  onSelectAccount: (account: SavedAccount) => void;
  onAddAccount: () => void;
}

const getRankColor = (tier: string): string => {
  const colors: { [key: string]: string } = {
    IRON: 'rank-iron',
    BRONZE: 'rank-bronze',
    SILVER: 'rank-silver',
    GOLD: 'rank-gold',
    PLATINUM: 'rank-platinum',
    EMERALD: 'rank-emerald',
    DIAMOND: 'rank-diamond',
    MASTER: 'rank-master',
    GRANDMASTER: 'rank-grandmaster',
    CHALLENGER: 'rank-challenger',
  };
  return colors[tier] || 'base-lighter';
};

export default function AccountSwitcher({
  accounts,
  currentAccount,
  onSelectAccount,
  onAddAccount,
}: AccountSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getWinrate = (wins: number, losses: number): number => {
    const total = wins + losses;
    return total > 0 ? Math.round((wins / total) * 100) : 0;
  };

  return (
    <div className="relative">
      {/* Current account button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-base-dark/80 backdrop-blur-sm hover:bg-base-medium/80 rounded-xl border border-base-light/20 transition-all group"
      >
        {currentAccount ? (
          <>
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${currentAccount.profileIconId}.png`}
              alt="Profile"
              className="w-10 h-10 rounded-lg border-2 border-accent-primary"
            />
            <div className="flex flex-col items-start">
              <span className="text-white font-semibold text-sm">
                {currentAccount.gameName}#{currentAccount.tagLine}
              </span>
              <span className={`text-xs text-${getRankColor(currentAccount.tier || 'UNRANKED')}`}>
                {currentAccount.tier || 'UNRANKED'} {currentAccount.rank || ''} •{' '}
                {currentAccount.lp || 0} LP
              </span>
            </div>
          </>
        ) : (
          <span className="text-base-lighter text-sm">Select Account</span>
        )}

        <svg
          className={`w-4 h-4 text-base-lighter ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-base-darker/95 backdrop-blur-xl rounded-xl border border-base-light/20 shadow-glow-lg overflow-hidden animate-slide-down z-50">
          <div className="p-2 max-h-96 overflow-y-auto">
            {/* Account list */}
            {accounts.map((account) => (
              <button
                key={account.puuid}
                onClick={() => {
                  onSelectAccount(account);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-base-medium/50 transition-all group ${
                  currentAccount?.puuid === account.puuid
                    ? 'bg-base-medium/30 border border-accent-primary/20'
                    : ''
                }`}
              >
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${account.profileIconId}.png`}
                  alt="Profile"
                  className="w-12 h-12 rounded-lg border-2 border-base-light group-hover:border-accent-primary transition-colors"
                />
                <div className="flex-1 flex flex-col items-start">
                  <span className="text-white font-semibold text-sm">
                    {account.gameName}#{account.tagLine}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs text-${getRankColor(account.tier || 'UNRANKED')} font-medium`}
                    >
                      {account.tier || 'UNRANKED'} {account.rank || ''}
                    </span>
                    <span className="text-xs text-base-lighter">•</span>
                    <span className="text-xs text-base-lighter">
                      {getWinrate(account.wins || 0, account.losses || 0)}% WR
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-bold text-${getRankColor(account.tier || 'UNRANKED')}`}
                  >
                    {account.lp || 0} LP
                  </div>
                  <div className="text-xs text-base-lighter">
                    {account.wins || 0}W {account.losses || 0}L
                  </div>
                </div>
              </button>
            ))}

            {/* Add account button */}
            <button
              onClick={() => {
                onAddAccount();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-lg border-2 border-dashed border-base-light/30 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all group"
            >
              <svg
                className="w-5 h-5 text-base-lighter group-hover:text-accent-primary transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm text-base-lighter group-hover:text-accent-primary transition-colors font-medium">
                Add Account
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
