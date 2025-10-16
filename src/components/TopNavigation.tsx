import { useState } from 'react';

interface TopNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function TopNavigation({ currentView, onViewChange }: TopNavigationProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '🏠' },
    { id: 'tierlist', label: 'Tierlist & Builds', icon: '📊' },
    { id: 'stats', label: 'Statistiques', icon: '📈' },
    { id: 'replays', label: 'Replays', icon: '🎬' },
    { id: 'overlays', label: 'Overlays', icon: '🖼️' },
    { id: 'collections', label: 'Collections', icon: '📚' },
  ];

  return (
    <nav className="fixed top-8 left-0 right-0 h-16 bg-gradient-to-r from-base-dark/95 via-base-dark/95 to-base-dark/95 backdrop-blur-xl border-b border-base-medium z-40 flex items-center px-6 shadow-2xl">
      {/* Gradient Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-transparent to-accent-secondary/5 pointer-events-none"></div>

      {/* Logo */}
      <div
        className="flex items-center gap-3 mr-8 group relative z-10"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-gold group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
          <span className="text-white font-bold text-xl">G</span>
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-none bg-gradient-to-r from-white via-accent-secondary to-accent-primary bg-clip-text text-transparent">
            Galpha
          </h1>
          <p className="text-xs text-gray-400 font-medium">APP V.1.2.0</p>
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
        <div
          className={`
            relative flex items-center bg-base-black/50 rounded-xl border transition-all duration-300
            ${isSearchFocused ? 'border-accent-primary shadow-lg shadow-accent-primary/20 scale-105' : 'border-base-medium hover:border-base-light'}
          `}
        >
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
          <input
            type="text"
            placeholder="Recherchez un Joueur, un Champion, une Équipe, un Pro..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none"
          />
        </div>
      </div>

      {/* Right Section - Settings */}
      <div
        className="flex items-center gap-3 relative z-10"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="p-2 rounded-xl text-gray-400 hover:text-accent-secondary hover:bg-base-light transition-all duration-300 transform hover:scale-110">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
        <button className="p-2 rounded-xl text-gray-400 hover:text-accent-secondary hover:bg-base-light transition-all duration-300 transform hover:scale-110 hover:rotate-90">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
