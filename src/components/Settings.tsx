import { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';

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

  // Load settings on mount
  useEffect(() => {
    loadSettings();
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
          {/* Auto Recording Toggle */}
          <div className="flex items-center justify-between p-4 bg-base-medium/50 rounded-xl border border-base-light hover:border-accent-primary/50 transition-colors">
            <div>
              <h3 className="text-white font-semibold mb-1">Enregistrement automatique</h3>
              <p className="text-sm text-gray-400">
                Enregistrer automatiquement vos parties
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
