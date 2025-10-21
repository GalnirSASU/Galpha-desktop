import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

export function ApiKeySetup({ onApiKeySet }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    if (!apiKey.startsWith('RGAPI-')) {
      setError('Invalid API key format. Riot API keys start with "RGAPI-"');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await invoke('set_api_key', { apiKey: apiKey.trim() });
      onApiKeySet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen tiled-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-base-darker/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-base-light/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Riot API Key Required</h1>
          <p className="text-gray-400">Enter your Riot Games Developer API key to continue</p>
        </div>

        {/* Instructions */}
        <div className="bg-base-dark/50 rounded-xl p-4 mb-6 border border-base-light/10">
          <h3 className="text-sm font-semibold text-white mb-2">How to get your API key:</h3>
          <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
            <li>Visit <a href="https://developer.riotgames.com/" target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:text-accent-secondary transition-colors">developer.riotgames.com</a></li>
            <li>Sign in with your Riot account</li>
            <li>Copy your Development API Key</li>
            <li>Paste it below</li>
          </ol>
          <p className="text-xs text-gray-500 mt-2">
            Note: Development keys expire after 24 hours
          </p>
        </div>

        {/* Input */}
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
              Riot API Key
            </label>
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="RGAPI-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
              className="w-full px-4 py-3 bg-base-dark border border-base-light/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
              disabled={saving}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !apiKey.trim()}
            className="w-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save API Key'}
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Your API key is stored locally and never shared
        </p>
      </div>
    </div>
  );
}
