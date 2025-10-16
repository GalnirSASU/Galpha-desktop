function Welcome() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="text-center max-w-2xl px-8">
        <div className="mb-8 animate-pulse-slow">
          <div className="text-8xl mb-6">🎮</div>
          <h1 className="text-6xl font-bold mb-4 gradient-text">Galpha Desktop</h1>
          <p className="text-2xl text-gray-400 mb-2">League of Legends Stats Tracker</p>
          <p className="text-sm text-gray-500 font-mono">
            Powered by AI • Real-time Analysis • Pro Insights
          </p>
        </div>

        <div className="glassmorphism rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mr-4"></div>
            <p className="text-xl text-gray-300">Waiting for League of Legends...</p>
          </div>
          <p className="text-sm text-gray-500">
            Start your League Client and Galpha will connect automatically
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="glassmorphism rounded-xl p-4">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-sm font-semibold text-gray-300">Live Stats</p>
          </div>
          <div className="glassmorphism rounded-xl p-4">
            <div className="text-3xl mb-2">🤖</div>
            <p className="text-sm font-semibold text-gray-300">AI Coach</p>
          </div>
          <div className="glassmorphism rounded-xl p-4">
            <div className="text-3xl mb-2">🏆</div>
            <p className="text-sm font-semibold text-gray-300">Achievements</p>
          </div>
        </div>

        <div className="mt-12 text-xs text-gray-600">
          <p>Galpha Desktop v0.1.0 • Not affiliated with Riot Games</p>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
