import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import WindowTitleBar from './components/WindowTitleBar';
import LoginScreen from './components/LoginScreen';
import MainDashboard from './components/MainDashboard';
import LiveGameNotification from './components/LiveGameNotification';
import { UpdateChecker } from './components/UpdateChecker';
import { ApiKeySetup } from './components/ApiKeySetup';
import { useRiotApi, useLoLDetection, useLiveGameDetection } from './hooks';
import type { DiscordUser } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [, setCurrentView] = useState('dashboard');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

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

  // TOUJOURS afficher l'écran de configuration de la clé API en premier
  // si l'utilisateur n'a pas encore configuré la clé
  if (!apiKeyConfigured) {
    console.log('[App] AFFICHAGE FORCE de ApiKeySetup - apiKeyConfigured=false');
    return (
      <ApiKeySetup
        onApiKeySet={() => {
          console.log('[App] Clé API configurée, rechargement...');
          setApiKeyConfigured(true);
          window.location.reload(); // Reload to reinitialize API
        }}
        onSkip={() => {
          console.log('[App] Configuration de la clé API ignorée');
          setApiKeyConfigured(true);
        }}
      />
    );
  }

  console.log('[App] apiKeyConfigured=true, passage aux autres écrans');
  console.log('[App] isAuthenticated:', isAuthenticated);
  console.log('[App] isApiLoading:', isApiLoading);
  console.log('[App] apiError:', apiError);

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
