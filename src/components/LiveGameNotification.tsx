import { useEffect, useState } from 'react';

interface LiveGameNotificationProps {
  isVisible: boolean;
  onViewLiveGame: () => void;
  onDismiss: () => void;
}

export default function LiveGameNotification({
  isVisible,
  onViewLiveGame,
  onDismiss,
}: LiveGameNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Trigger animation
      setIsAnimating(true);

      // Auto-dismiss after 10 seconds
      const timeout = setTimeout(() => {
        handleDismiss();
      }, 10000);

      return () => clearTimeout(timeout);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onDismiss();
    }, 300); // Wait for animation to complete
  };

  const handleViewGame = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onViewLiveGame();
      onDismiss();
    }, 150);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-6 z-50 pointer-events-none">
      <div
        className={`pointer-events-auto bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border-2 border-green-500/50 rounded-2xl shadow-2xl shadow-green-500/30 overflow-hidden transition-all duration-300 ${
          isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{
          minWidth: '380px',
        }}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-green-500/20">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 animate-progress"
            style={{
              animation: 'progress 10s linear forwards',
            }}
          ></div>
        </div>

        <div className="p-5 pt-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50">
                  <span className="text-2xl">🎮</span>
                </div>
                {/* Pulsing indicator */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Partie en cours !</h3>
                <p className="text-green-300 text-sm">Cliquez pour voir les détails</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-300 text-sm mb-4">
            Votre partie vient de commencer. Consultez les statistiques en temps réel de vos
            coéquipiers et adversaires !
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleViewGame}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 transition-all duration-200"
            >
              Voir la partie
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 bg-gray-700/50 text-gray-300 font-semibold rounded-xl hover:bg-gray-600/50 hover:text-white transition-all duration-200"
            >
              Plus tard
            </button>
          </div>
        </div>

        {/* Animated border effect */}
        <div className="absolute inset-0 border-2 border-green-400/30 rounded-2xl animate-pulse-slow pointer-events-none"></div>
      </div>

      <style>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
