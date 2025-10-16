import { useState } from 'react';
import { SavedAccount } from './AccountSwitcher';

interface OnboardingViewProps {
  onAccountSelect?: (account: SavedAccount) => void;
  savedAccounts?: SavedAccount[];
}

export default function OnboardingView({
  onAccountSelect,
  savedAccounts = [],
}: OnboardingViewProps) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('EUW');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameName && tagLine) {
      const newAccount: SavedAccount = {
        puuid: `manual-${Date.now()}`,
        gameName,
        tagLine,
        summonerLevel: 0,
        profileIconId: 29,
        rank: 'UNRANKED',
        tier: '',
        lp: 0,
        wins: 0,
        losses: 0,
        lastPlayed: new Date().toISOString(),
      };
      onAccountSelect?.(newAccount);
    }
  };

  return (
    <div className="min-h-screen bg-base-black flex items-center justify-center px-6 py-6">
      <div className="max-w-3xl w-full">
        {/* Hero Section - Compact */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-3xl">G</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-accent-secondary to-accent-primary bg-clip-text text-transparent">
            Bienvenue sur Galpha
          </h1>
          <p className="text-gray-400 text-sm">
            Suivez vos performances League of Legends en temps réel
          </p>
        </div>

        {/* Connection Status - Compact */}
        <div className="bg-gradient-to-br from-base-dark to-base-darker rounded-xl border border-base-medium p-4 mb-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/30">
              <svg
                className="w-5 h-5 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h2 className="text-sm font-bold text-white">Client LoL non détecté</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></div>
                <span>Recherche en cours...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Options Grid - Compact */}
        <div className="grid gap-3">
          {/* Saved Accounts - Compact */}
          {savedAccounts.length > 0 && (
            <div className="bg-gradient-to-br from-base-dark to-base-darker rounded-xl border border-base-medium p-4">
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <span className="text-lg">👤</span>
                Comptes sauvegardés
              </h3>
              <div className="grid gap-2 max-h-40 overflow-y-auto">
                {savedAccounts.map((account) => (
                  <button
                    key={account.puuid}
                    onClick={() => onAccountSelect?.(account)}
                    className="group flex items-center gap-3 p-3 bg-gradient-to-r from-base-medium to-base-darker rounded-lg border border-base-light hover:border-accent-primary/50 hover:shadow-lg hover:shadow-accent-primary/20 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                  >
                    <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary p-0.5 shadow-gold">
                      <div className="w-full h-full rounded-lg bg-base-dark flex items-center justify-center overflow-hidden">
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${account.profileIconId}.png`}
                          alt="Profile"
                          className="w-full h-full rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-semibold group-hover:text-accent-secondary transition-colors">
                          {account.gameName}
                        </span>
                        <span className="text-xs text-gray-400">#{account.tagLine}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {account.tier && account.rank
                          ? `${account.tier} ${account.rank}`
                          : 'Non classé'}{' '}
                        • Niv. {account.summonerLevel}
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400 group-hover:text-accent-primary transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Input - Compact */}
          {!showManualInput ? (
            <button
              onClick={() => setShowManualInput(true)}
              className="group bg-gradient-to-br from-base-dark to-base-darker rounded-xl border border-base-medium hover:border-accent-primary/50 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-accent-primary/20 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white group-hover:text-accent-secondary transition-colors">
                      Ajouter un compte manuellement
                    </h3>
                    <p className="text-xs text-gray-400">Entrez votre Riot ID (GameName#TAG)</p>
                  </div>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400 group-hover:text-accent-primary transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ) : (
            <div className="bg-gradient-to-br from-base-dark to-base-darker rounded-xl border border-accent-primary/30 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-lg">✏️</span>
                  Ajouter un compte
                </h3>
                <button
                  onClick={() => setShowManualInput(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Riot ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="GameName"
                      value={gameName}
                      onChange={(e) => setGameName(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm bg-base-black/50 border border-base-medium rounded-lg text-white placeholder-gray-500 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                      required
                    />
                    <span className="flex items-center text-gray-400 text-lg">#</span>
                    <input
                      type="text"
                      placeholder="TAG"
                      value={tagLine}
                      onChange={(e) => setTagLine(e.target.value)}
                      className="w-24 px-3 py-2 text-sm bg-base-black/50 border border-base-medium rounded-lg text-white placeholder-gray-500 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Région</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-base-black/50 border border-base-medium rounded-lg text-white focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                  >
                    <option value="EUW">Europe West (EUW)</option>
                    <option value="EUNE">Europe Nordic & East (EUNE)</option>
                    <option value="NA">North America (NA)</option>
                    <option value="KR">Korea (KR)</option>
                    <option value="BR">Brazil (BR)</option>
                    <option value="LAN">Latin America North (LAN)</option>
                    <option value="LAS">Latin America South (LAS)</option>
                    <option value="OCE">Oceania (OCE)</option>
                    <option value="TR">Turkey (TR)</option>
                    <option value="RU">Russia (RU)</option>
                    <option value="JP">Japan (JP)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowManualInput(false)}
                    className="flex-1 px-4 py-2 text-sm bg-base-medium text-gray-300 rounded-lg hover:bg-base-light transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-accent-primary to-accent-tertiary text-white font-semibold rounded-lg shadow-gold hover:shadow-glow transition-all duration-300 hover:scale-105"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Help Section - Compact */}
          <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-xl border border-blue-500/20 p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm text-white font-semibold mb-1.5">Comment ça marche ?</h4>
                <ul className="text-xs text-gray-400 space-y-0.5">
                  <li>
                    • <strong className="text-gray-300">Auto :</strong> Ouvrez votre client LoL
                  </li>
                  <li>
                    • <strong className="text-gray-300">Sauvegardé :</strong> Sélectionnez un compte
                  </li>
                  <li>
                    • <strong className="text-gray-300">Manuel :</strong> Entrez votre Riot ID
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
