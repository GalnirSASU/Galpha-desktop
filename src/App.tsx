import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import WindowTitleBar from './components/WindowTitleBar';
import LoginScreen from './components/LoginScreen';
import MainDashboard from './components/MainDashboard';
import LiveGameNotification from './components/LiveGameNotification';
import { UpdateChecker } from './components/UpdateChecker';
import { useRiotApi, useLoLDetection, useLiveGameDetection } from './hooks';
import type { DiscordUser } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [, setCurrentView] = useState('dashboard');

  console.log('[App] Rendering App component');

  // Initialize Riot API
  const { isLoading: isApiLoading, error: apiError } = useRiotApi();
  console.log('[App] Riot API state:', { isApiLoading, apiError });

  // Detect League of Legends and fetch summoner
  const { isLolRunning, summoner, isLoadingSummoner } = useLoLDetection(isAuthenticated);
  console.log('[App] LoL Detection state:', { isLolRunning, summoner, isLoadingSummoner });

  // Detect live game and show notification
  const { isInGame, hasNotified, markAsNotified } = useLiveGameDetection(isLolRunning);

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
      <div className="min-h-screen tiled-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-primary/30 border-t-accent-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-base-lighter text-lg">Initialisation de Galpha...</p>
        </div>
      </div>
    );
  }

  // Allow users to continue even without API key - they can set it in Settings
  // Only show loading/errors during the initial auth check

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const handleViewLiveGame = () => {
    setCurrentView('livegame');
  };

  const handleDismissNotification = () => {
    markAsNotified();
  };

  return (
    <ErrorBoundary>
      <WindowTitleBar />
      <MainDashboard
        isLolRunning={isLolRunning}
        currentSummoner={summoner}
        isLoadingSummoner={isLoadingSummoner}
        discordUser={discordUser}
        apiError={apiError}
      />
      <LiveGameNotification
        isVisible={isInGame && !hasNotified && isAuthenticated}
        onViewLiveGame={handleViewLiveGame}
        onDismiss={handleDismissNotification}
      />
      <UpdateChecker />
    </ErrorBoundary>
  );
}

export default App;
