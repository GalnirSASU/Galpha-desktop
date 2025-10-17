import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

export default function WindowTitleBar() {
  const appWindow = getCurrentWebviewWindow();

  const handleMinimize = () => {
    appWindow.minimize();
  };

  const handleMaximize = () => {
    appWindow.toggleMaximize();
  };

  const handleClose = () => {
    appWindow.close();
  };

  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 left-0 right-0 h-8 bg-base-black border-b border-[#1a1a27] z-50 flex items-center justify-between px-4 select-none"
    >
      {/* Left - App Title */}
      <div className="flex items-center gap-2 pointer-events-none">
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary shadow-glow-sm"></div>
        <span className="text-xs font-semibold text-gray-400">Galpha Launcher</span>
      </div>

      {/* Center - Draggable area */}
      <div className="flex-1"></div>

      {/* Right - Window Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <button
          onClick={handleMinimize}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-base-light transition-colors group"
          title="Minimize"
        >
          <svg
            className="w-3 h-3 text-gray-400 group-hover:text-accent-secondary"
            viewBox="0 0 12 12"
            fill="currentColor"
          >
            <rect x="2" y="5.5" width="8" height="1" />
          </svg>
        </button>

        <button
          onClick={handleMaximize}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-base-light transition-colors group"
          title="Maximize"
        >
          <svg
            className="w-3 h-3 text-gray-400 group-hover:text-accent-secondary"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <rect x="2.5" y="2.5" width="7" height="7" />
          </svg>
        </button>

        <button
          onClick={handleClose}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-500 transition-colors group"
          title="Close"
        >
          <svg
            className="w-3 h-3 text-gray-400 group-hover:text-white"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
