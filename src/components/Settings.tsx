import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

interface SettingsState {
  autoRecording: boolean;
  recordingPath: string;
  recordingQuality: 'low' | 'medium' | 'high' | 'ultra';
  autoDelete: boolean;
  autoDeleteDays: number;
  recordAllGames: boolean;
  recordRankedOnly: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>({
    autoRecording: false,
    recordingPath: '',
    recordingQuality: 'high',
    autoDelete: false,
    autoDeleteDays: 30,
    recordAllGames: true,
    recordRankedOnly: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Riot API Key state
  const [apiKey, setApiKey] = useState('');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    loadApiKey();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = localStorage.getItem('galpha_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadApiKey = async () => {
    try {
      const key = await invoke<string | null>('get_api_key');
      if (key) {
        setApiKey(key);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyError('Veuillez entrer une clé API valide');
      return;
    }

    if (!apiKey.startsWith('RGAPI-')) {
      setApiKeyError('La clé API doit commencer par "RGAPI-"');
      return;
    }

    try {
      setApiKeyLoading(true);
      setApiKeyError('');

      await invoke('set_api_key', { apiKey: apiKey.trim() });

      setApiKeySaved(true);
      setTimeout(() => setApiKeySaved(false), 3000);

      // Reload the page to reinitialize the API client
      window.location.reload();
    } catch (error) {
      setApiKeyError(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
      console.error('Failed to save API key:', error);
    } finally {
      setApiKeyLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      localStorage.setItem('galpha_settings', JSON.stringify(settings));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectRecordingPath = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Sélectionner le dossier de sauvegarde des replays',
      });

      if (selected && typeof selected === 'string') {
        setSettings({ ...settings, recordingPath: selected });
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-base-dark to-base-darker rounded-2xl border border-base-medium p-6 shadow-lg">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-accent-secondary bg-clip-text text-transparent mb-2">
          Paramètres
        </h1>
        <p className="text-gray-400 text-sm">
          Configurez Galpha selon vos préférences
        </p>
      </div>

      {/* Riot API Key Section */}
      <div className="bg-gradient-to-br from-base-dark to-base-darker rounded-2xl border border-base-medium p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-2xl">🔑</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Clé API Riot Games
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Votre clé API Riot Games est nécessaire pour récupérer vos statistiques de jeu.
            {' '}
            <a
              href="https://developer.riotgames.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary hover:text-accent-secondary transition-colors underline"
            >
              Obtenez votre clé ici
            </a>
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="flex-1 bg-base-darker border border-base-light rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-accent-primary transition-colors font-mono text-sm"
              />
              <button
                onClick={saveApiKey}
                disabled={apiKeyLoading || !apiKey.trim()}
                className="px-6 py-3 bg-gradient-to-r from-accent-primary to-accent-tertiary text-white font-semibold rounded-lg hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {apiKeyLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>

            {apiKeyError && (
              <div className="flex items-start gap-2 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-300">{apiKeyError}</p>
              </div>
            )}

            {apiKeySaved && (
              <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-300 font-semibold">Clé API sauvegardée avec succès!</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-200/80">
                <p className="font-semibold text-blue-300 mb-1">Comment obtenir votre clé API?</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Visitez le portail développeur Riot Games</li>
                  <li>Connectez-vous avec votre compte League of Legends</li>
                  <li>Copiez votre "Development API Key"</li>
                  <li>Collez-la dans le champ ci-dessus</li>
                </ol>
                <p className="mt-2 text-xs">
                  ⚠️ Les clés de développement expirent toutes les 24h. Vous devrez la renouveler quotidiennement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recording Settings */}
      <div className="bg-gradient-to-br from-base-dark to-base-darker rounded-2xl border border-base-medium p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/30">
            <span className="text-2xl">🎬</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Enregistrement des parties
          </h2>
        </div>

        <div className="space-y-6">
          {/* macOS Warning */}
          {navigator.userAgent.includes('Mac') && (
            <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="text-yellow-300 font-semibold mb-1">Disponible sur Windows uniquement</h4>
                  <p className="text-sm text-yellow-200/80">
                    L'enregistrement automatique des parties n'est actuellement disponible que sur Windows.
                    Support macOS à venir dans une future version.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Auto Recording Toggle */}
          <div className="flex items-center justify-between p-4 bg-base-medium/50 rounded-xl border border-base-light hover:border-accent-primary/50 transition-colors">
            <div>
              <h3 className="text-white font-semibold mb-1">Enregistrement automatique</h3>
              <p className="text-sm text-gray-400">
                Enregistrer automatiquement vos parties {navigator.userAgent.includes('Mac') ? '(Windows uniquement)' : ''}
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoRecording: !settings.autoRecording })}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.autoRecording ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                  settings.autoRecording ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Recording Path */}
          <div className="p-4 bg-base-medium/50 rounded-xl border border-base-light">
            <h3 className="text-white font-semibold mb-3">Dossier de sauvegarde</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={settings.recordingPath}
                readOnly
                placeholder="Sélectionner un dossier..."
                className="flex-1 bg-base-darker border border-base-light rounded-lg px-4 py-2 text-white placeholder-gray-500 outline-none"
              />
              <button
                onClick={selectRecordingPath}
                className="px-6 py-2 bg-gradient-to-r from-accent-primary to-accent-tertiary text-white font-semibold rounded-lg hover:shadow-glow transition-all duration-300"
              >
                Parcourir
              </button>
            </div>
          </div>

          {/* Recording Quality */}
          <div className="p-4 bg-base-medium/50 rounded-xl border border-base-light">
            <h3 className="text-white font-semibold mb-3">Qualité d'enregistrement</h3>
            <div className="grid grid-cols-4 gap-3">
              {(['low', 'medium', 'high', 'ultra'] as const).map((quality) => (
                <button
                  key={quality}
                  onClick={() => setSettings({ ...settings, recordingQuality: quality })}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                    settings.recordingQuality === quality
                      ? 'bg-gradient-to-r from-accent-primary to-accent-tertiary text-white shadow-gold'
                      : 'bg-base-darker text-gray-400 hover:text-white hover:bg-base-light'
                  }`}
                >
                  {quality === 'low' && 'Basse'}
                  {quality === 'medium' && 'Moyenne'}
                  {quality === 'high' && 'Haute'}
                  {quality === 'ultra' && 'Ultra'}
                </button>
              ))}
            </div>
          </div>

          {/* Game Type Filter */}
          <div className="p-4 bg-base-medium/50 rounded-xl border border-base-light">
            <h3 className="text-white font-semibold mb-3">Type de parties à enregistrer</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  checked={settings.recordAllGames}
                  onChange={() => setSettings({ ...settings, recordAllGames: true, recordRankedOnly: false })}
                  className="w-5 h-5 accent-accent-primary"
                />
                <span className="text-white group-hover:text-accent-secondary transition-colors">
                  Toutes les parties
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  checked={settings.recordRankedOnly}
                  onChange={() => setSettings({ ...settings, recordAllGames: false, recordRankedOnly: true })}
                  className="w-5 h-5 accent-accent-primary"
                />
                <span className="text-white group-hover:text-accent-secondary transition-colors">
                  Parties classées uniquement
                </span>
              </label>
            </div>
          </div>

          {/* Auto Delete */}
          <div className="p-4 bg-base-medium/50 rounded-xl border border-base-light">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold mb-1">Suppression automatique</h3>
                <p className="text-sm text-gray-400">
                  Supprimer automatiquement les anciens replays
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoDelete: !settings.autoDelete })}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  settings.autoDelete ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                    settings.autoDelete ? 'transform translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
            {settings.autoDelete && (
              <div className="mt-4">
                <label className="text-sm text-gray-400 mb-2 block">
                  Supprimer les replays après (jours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.autoDeleteDays}
                  onChange={(e) => setSettings({ ...settings, autoDeleteDays: parseInt(e.target.value) })}
                  className="w-full bg-base-darker border border-base-light rounded-lg px-4 py-2 text-white outline-none focus:border-accent-primary"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        {saveSuccess && (
          <div className="flex items-center gap-2 text-green-400 font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Paramètres sauvegardés
          </div>
        )}
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="px-8 py-3 bg-gradient-to-r from-accent-primary to-accent-tertiary text-white font-bold rounded-xl shadow-gold hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  );
}
