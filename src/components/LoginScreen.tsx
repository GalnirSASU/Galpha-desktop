import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Logo from './Logo';

interface LoginScreenProps {
  onLogin: (discordUser: DiscordUser) => void;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDiscordLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID || '1234567890';

      const user = await invoke<DiscordUser>('discord_login', {
        clientId,
      });

      // Fix avatar URL if needed
      if (user.avatar) {
        user.avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
      } else {
        user.avatar = `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator) % 5}.png`;
      }

      onLogin(user);
    } catch (error: any) {
      console.error('Discord login failed:', error);
      setError(error.toString());
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen tiled-background relative overflow-hidden flex items-center justify-center">
      {/* Animated orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-accent-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-secondary/20 rounded-full blur-3xl animate-pulse-slow delay-1000" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-base-darker/60 backdrop-blur-2xl rounded-2xl border border-base-light/20 p-8 shadow-glow-lg">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6 animate-scale-in">
              <Logo size="xl" />
            </div>
            <p className="text-base-lighter text-sm">League of Legends Premium Launcher</p>
          </div>

          {/* Features list */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-accent-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-white">Multi-account management</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-accent-secondary/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-accent-secondary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-white">Advanced statistics & insights</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-accent-tertiary/10 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-accent-tertiary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-white">Real-time match tracking</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
              <p className="text-red-400/60 text-xs mt-1">
                Make sure you have configured your Discord Client ID in the .env file
              </p>
            </div>
          )}

          {/* Development: Skip login button */}
          <button
            onClick={() => onLogin({ id: 'dev', username: 'DevUser', discriminator: '0000', avatar: null })}
            className="w-full h-12 mb-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-medium text-white"
          >
            <span>⚠️ Skip Login (Dev Mode)</span>
          </button>

          {/* Discord login button */}
          <button
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className="w-full h-14 bg-discord-blurple hover:bg-discord-blurple/90 disabled:bg-discord-blurple/50 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white font-semibold">Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
                </svg>
                <span className="text-white font-semibold">Login with Discord</span>
              </>
            )}
          </button>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-base-lighter">
              By logging in, you agree to our{' '}
              <a href="#" className="text-accent-primary hover:text-accent-glow transition-colors">
                Terms of Service
              </a>
            </p>
          </div>
        </div>

        {/* Beta badge */}
        <div className="mt-4 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 border border-accent-primary/20 rounded-full">
            <div className="w-2 h-2 bg-accent-primary rounded-full animate-pulse" />
            <span className="text-xs text-accent-glow font-medium">Early Access Beta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
