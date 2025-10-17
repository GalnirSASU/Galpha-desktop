import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import WindowTitleBar from './components/WindowTitleBar';
import LoginScreen from './components/LoginScreen';
import MainDashboard from './components/MainDashboard';
import { UpdateChecker } from './components/UpdateChecker';
import { ApiKeySetup } from './components/ApiKeySetup';
import { useRiotApi, useLoLDetection } from './hooks';
import type { DiscordUser } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);

  console.log('[App] Rendering App component');

  // Initialize Riot API
  const { isLoading: isApiLoading, error: apiError, reinitialize } = useRiotApi();
  console.log('[App] Riot API state:', { isApiLoading, apiError });

  // Detect League of Legends and fetch summoner
  const { isLolRunning, summoner, isLoadingSummoner } = useLoLDetection(isAuthenticated);
  console.log('[App] LoL Detection state:', { isLolRunning, summoner, isLoadingSummoner });

  const handleLogin = (user: DiscordUser) => {
    setDiscordUser(user);
    setIsAuthenticated(true);
  };

  console.log('[App] isAuthenticated:', isAuthenticated);
  console.log('[App] Will render:', isApiLoading ? 'Loading' : apiError ? 'Error' : !isAuthenticated ? 'LoginScreen' : 'MainDashboard');

  // Show loading state while API initializes
  if (isApiLoading) {
    console.log('[App] Rendering loading screen');
    return (
      <div className="min-h-screen bg-base-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base-lighter text-lg">Initialisation de Galpha...</p>
        </div>
      </div>
    );
  }

  // Show API key setup if needed
  if (apiError && apiError.includes('not configured')) {
    return <ApiKeySetup onApiKeySet={reinitialize} />;
  }

  // Show error if API failed to initialize (other errors)
  if (apiError) {
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
          <h2 className="text-xl font-bold text-white mb-2">Erreur d'initialisation</h2>
          <p className="text-gray-300 mb-6">{apiError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-tertiary text-white font-semibold rounded-xl shadow-gold hover:shadow-glow transition-all duration-300"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <ErrorBoundary>
      <WindowTitleBar />
      <MainDashboard
        isLolRunning={isLolRunning}
        currentSummoner={summoner}
        isLoadingSummoner={isLoadingSummoner}
        discordUser={discordUser}
      />
      <UpdateChecker />
    </ErrorBoundary>
  );
}

export default App;
