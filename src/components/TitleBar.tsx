import { useState } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWebviewWindow();

  const handleMinimize = async () => {
    await appWindow.minimize();
  };

  const handleMaximize = async () => {
    await appWindow.toggleMaximize();
    setIsMaximized(!isMaximized);
  };

  const handleClose = async () => {
    await appWindow.close();
  };

  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 left-0 right-0 h-10 bg-base-darker/80 backdrop-blur-xl border-b border-base-light/20 flex items-center justify-between px-4 z-50"
    >
      {/* Logo & Title */}
      <div className="flex items-center gap-3" data-tauri-drag-region>
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
          <span className="text-white font-bold text-sm">G</span>
        </div>
        <span className="text-sm font-semibold text-white">Galpha</span>
        <span className="text-xs text-base-lighter">v0.1.0</span>
      </div>

      {/* Window Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleMinimize}
          className="w-8 h-8 rounded-lg hover:bg-base-light/50 flex items-center justify-center transition-colors group"
        >
          <svg
            className="w-4 h-4 text-base-lighter group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleMaximize}
          className="w-8 h-8 rounded-lg hover:bg-base-light/50 flex items-center justify-center transition-colors group"
        >
          <svg
            className="w-4 h-4 text-base-lighter group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMaximized ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            )}
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="w-8 h-8 rounded-lg hover:bg-red-500/80 flex items-center justify-center transition-colors group"
        >
          <svg
            className="w-4 h-4 text-base-lighter group-hover:text-white transition-colors"
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
    </div>
  );
}
