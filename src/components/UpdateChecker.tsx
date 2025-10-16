import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
}

export function UpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkForUpdates();

    // Vérifier les mises à jour toutes les 30 minutes
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await check();

      if (update) {
        setUpdateInfo({
          available: true,
          currentVersion: update.currentVersion,
          latestVersion: update.version,
        });

        console.log('Mise à jour disponible:', {
          current: update.currentVersion,
          latest: update.version,
        });
      }
    } catch (err) {
      console.error('Erreur lors de la vérification des mises à jour:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const downloadAndInstall = async () => {
    try {
      setDownloading(true);
      setError(null);

      const update = await check();
      if (!update) {
        setError('Aucune mise à jour disponible');
        setDownloading(false);
        return;
      }

      console.log('Téléchargement de la mise à jour...');

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            console.log('Téléchargement démarré');
            setDownloadProgress(0);
            break;
          case 'Progress':
            const progress = Math.round((event.data.downloaded / event.data.contentLength) * 100);
            setDownloadProgress(progress);
            console.log(`Progression: ${progress}%`);
            break;
          case 'Finished':
            console.log('Téléchargement terminé');
            break;
        }
      });

      console.log('Installation terminée, redémarrage...');
      await relaunch();
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour');
      setDownloading(false);
    }
  };

  if (!updateInfo?.available) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Mise à jour disponible!</h3>
            <p className="text-sm text-blue-100 mb-3">
              Version {updateInfo.latestVersion} disponible
              <span className="text-xs block opacity-75">
                (actuellement: {updateInfo.currentVersion})
              </span>
            </p>

            {error && (
              <p className="text-sm text-red-200 bg-red-500/20 rounded px-3 py-2 mb-3">
                {error}
              </p>
            )}

            {downloading && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Téléchargement...</span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full bg-blue-900/50 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={downloadAndInstall}
                disabled={downloading}
                className="flex-1 bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? 'Téléchargement...' : 'Mettre à jour'}
              </button>

              <button
                onClick={() => setUpdateInfo(null)}
                disabled={downloading}
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
