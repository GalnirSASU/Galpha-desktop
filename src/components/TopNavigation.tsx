import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Logo from './Logo';

interface TopNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onPlayerSearch?: (gameName: string, tagLine: string) => void;
  currentAccount?: { gameName: string; tagLine: string; profileIconId: number } | null;
  onAccountSwitch?: () => void;
  onReturnToMainAccount?: () => void;
  showReturnButton?: boolean;
}

export default function TopNavigation({
  currentView,
  onViewChange,
  onPlayerSearch,
  currentAccount,
  onAccountSwitch,
  onReturnToMainAccount,
  showReturnButton = false
}: TopNavigationProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '🏠' },
    { id: 'livegame', label: 'Partie en cours', icon: '⚔️' },
    { id: 'replays', label: 'Replays', icon: '🎬' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Parse the search query (format: GameName#TagLine)
      const parts = searchQuery.trim().split('#');
      const gameName = parts[0] || searchQuery.trim();
      const tagLine = parts[1] || 'EUW';

      if (onPlayerSearch) {
        onPlayerSearch(gameName, tagLine);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <nav
      data-tauri-drag-region
      className="fixed top-8 left-0 right-0 h-16 tiled-background-dense border-b border-base-medium z-40 flex items-center px-6 shadow-2xl"
    >
      {/* Gradient Glow Effect */}
      <div data-tauri-drag-region className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-transparent to-accent-secondary/5 pointer-events-none"></div>

      {/* Backdrop blur overlay */}
      <div data-tauri-drag-region className="absolute inset-0 backdrop-blur-xl bg-base-dark/80 pointer-events-none"></div>

      {/* Logo */}
      <div
        className="flex items-center gap-3 mr-8 group relative z-10"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="transform group-hover:scale-105 transition-all duration-300">
          <Logo size="md" />
        </div>
      </div>

      {/* Navigation Items */}
      <div
        className="flex items-center gap-2 flex-1 relative z-10"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105
              ${
                currentView === item.id
                  ? 'bg-gradient-to-r from-accent-primary to-accent-tertiary text-white shadow-gold'
                  : 'text-gray-400 hover:text-white hover:bg-base-light/80 hover:shadow-lg'
              }
            `}
          >
            {currentView === item.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 rounded-xl blur-xl"></div>
            )}
            <span className="relative flex items-center gap-2">
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mx-6 flex-1 max-w-md relative z-10" onMouseDown={(e) => e.stopPropagation()}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className={`
            relative flex items-center bg-base-black/50 rounded-xl border transition-all duration-300
            ${isSearchFocused ? 'border-accent-primary shadow-lg shadow-accent-primary/20 scale-105' : 'border-base-medium hover:border-base-light'}
          `}
        >
          {isSearching ? (
            <div className="ml-3 w-4 h-4 border-2 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin" />
          ) : (
            <svg
              className={`w-4 h-4 ml-3 transition-colors duration-300 ${isSearchFocused ? 'text-accent-secondary' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un joueur (ex: Hide on bush#KR1)"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none"
            disabled={isSearching}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mr-2 p-1 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>
      </div>

      {/* Account Actions */}
      <div className="flex items-center gap-3 relative z-10" onMouseDown={(e) => e.stopPropagation()}>
        {/* Return to Main Account Button */}
        {showReturnButton && onReturnToMainAccount && (
          <button
            onClick={onReturnToMainAccount}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-xl text-sm font-medium text-blue-300 transition-all duration-300 transform hover:scale-105"
            title="Retour au compte connecté"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Retour</span>
          </button>
        )}

        {/* Current Account Display & Switcher */}
        {currentAccount && onAccountSwitch && (
          <button
            onClick={onAccountSwitch}
            className="flex items-center gap-3 px-3 py-2 bg-base-black/50 hover:bg-base-light/80 border border-base-medium hover:border-accent-primary/50 rounded-xl transition-all duration-300 transform hover:scale-105 group"
          >
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/${currentAccount.profileIconId}.png`}
              alt="Profile"
              className="w-8 h-8 rounded-lg border-2 border-accent-primary/50 group-hover:border-accent-primary transition-colors"
            />
            <div className="text-left">
              <div className="text-sm font-bold text-white group-hover:text-accent-primary transition-colors">
                {currentAccount.gameName}
              </div>
              <div className="text-xs text-gray-400">#{currentAccount.tagLine}</div>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-accent-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

    </nav>
  );
}
