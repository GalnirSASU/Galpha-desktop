import { useState, useRef } from 'react';

interface ReplayEvent {
  timestamp: number; // En secondes
  type: 'kill' | 'death' | 'assist' | 'ult' | 'objective' | 'pentakill' | 'quadrakill' | 'triplekill';
  description: string;
  icon: string;
  color: string;
}

interface ReplayPlayerProps {
  matchId: string;
  gameDuration: number;
  events: ReplayEvent[];
  onClose: () => void;
}

export default function ReplayPlayer({ matchId, gameDuration, events, onClose }: ReplayPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(50);
  // const [showTimeline] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Format time in MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle timeline click to seek
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * gameDuration;

    setCurrentTime(Math.max(0, Math.min(gameDuration, newTime)));
  };

  // Get events at current time
  const getCurrentEvents = () => {
    return events.filter((event) => Math.abs(event.timestamp - currentTime) < 2);
  };

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top Bar */}
      <div className="h-16 bg-gradient-to-r from-base-darker to-base-dark border-b border-base-medium flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-base-light transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-white font-bold">Replay - Match {matchId.slice(-8)}</h2>
            <p className="text-sm text-gray-400">Durée totale: {formatTime(gameDuration)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Speed Control */}
          <div className="flex items-center gap-2 bg-base-medium rounded-lg px-3 py-2">
            <span className="text-sm text-gray-400">Vitesse:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="bg-transparent text-white text-sm font-semibold outline-none cursor-pointer"
            >
              {speedOptions.map((speed) => (
                <option key={speed} value={speed} className="bg-base-dark">
                  {speed}x
                </option>
              ))}
            </select>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 bg-base-medium rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-20 accent-accent-primary"
            />
            <span className="text-xs text-gray-400 w-8">{volume}%</span>
          </div>
        </div>
      </div>

      {/* Main Content - Video Player Area */}
      <div className="flex-1 bg-black relative flex items-center justify-center">
        {/* Video/Game Screen would go here */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-base-dark rounded-full flex items-center justify-center mb-4">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">Lecteur de replay - En développement</p>
            <p className="text-gray-600 text-sm mt-2">
              Cette zone affichera la vidéo du replay
            </p>
          </div>
        </div>

        {/* Current Events Overlay */}
        {getCurrentEvents().length > 0 && (
          <div className="absolute top-4 right-4 space-y-2">
            {getCurrentEvents().map((event, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 backdrop-blur-xl animate-fadeIn ${event.color}`}
              >
                <span className="text-2xl">{event.icon}</span>
                <span className="text-white font-bold">{event.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="h-32 bg-gradient-to-t from-base-black via-base-darker to-transparent">
        <div className="px-6 pt-4">
          {/* Timeline */}
          <div className="mb-4">
            <div
              ref={timelineRef}
              onClick={handleTimelineClick}
              className="relative h-12 bg-base-dark rounded-lg border border-base-medium cursor-pointer group hover:border-accent-primary transition-colors"
            >
              {/* Progress Bar */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-lg transition-all"
                style={{ width: `${(currentTime / gameDuration) * 100}%` }}
              />

              {/* Event Markers */}
              {events.map((event, idx) => {
                const position = (event.timestamp / gameDuration) * 100;
                return (
                  <div
                    key={idx}
                    className="absolute top-1/2 -translate-y-1/2 group/marker"
                    style={{ left: `${position}%` }}
                    title={`${formatTime(event.timestamp)} - ${event.description}`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full border-2 border-white transform transition-all group-hover/marker:scale-150 ${
                        event.type === 'kill'
                          ? 'bg-green-500'
                          : event.type === 'death'
                            ? 'bg-red-500'
                            : event.type === 'assist'
                              ? 'bg-blue-500'
                              : event.type === 'ult'
                                ? 'bg-purple-500'
                                : event.type === 'pentakill'
                                  ? 'bg-yellow-500 animate-pulse'
                                  : 'bg-orange-500'
                      }`}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-base-black border border-base-light rounded text-xs text-white whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none">
                      {event.icon} {event.description}
                      <br />
                      <span className="text-gray-400">{formatTime(event.timestamp)}</span>
                    </div>
                  </div>
                );
              })}

              {/* Time Labels */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                <span>0:00</span>
                <span>{formatTime(gameDuration / 2)}</span>
                <span>{formatTime(gameDuration)}</span>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button className="p-3 rounded-full text-white hover:bg-base-light transition-all">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>

            <button className="p-3 rounded-full text-white hover:bg-base-light transition-all">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-4 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-glow hover:scale-110 transition-all"
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button className="p-3 rounded-full text-white hover:bg-base-light transition-all">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
              </svg>
            </button>

            <button className="p-3 rounded-full text-white hover:bg-base-light transition-all">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
          </div>

          {/* Current Time Display */}
          <div className="text-center mt-4">
            <span className="text-white font-mono text-lg">
              {formatTime(currentTime)} / {formatTime(gameDuration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
