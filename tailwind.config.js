/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Galpha.app inspired color palette
        accent: {
          primary: '#D4AF37', // Gold
          secondary: '#F0C674', // Light gold
          tertiary: '#C9A461', // Dark gold
          glow: '#FFD700', // Gold glow
        },
        base: {
          black: '#0A0E1A', // Dark blue-black
          darker: '#0D1117',
          dark: '#151922', // Dark blue
          medium: '#1A1F2E',
          light: '#252A3A',
          lighter: '#303546',
        },
        discord: {
          blurple: '#5865F2',
          green: '#57F287',
          yellow: '#FEE75C',
          fuchsia: '#EB459E',
          red: '#ED4245',
        },
        rank: {
          iron: '#5A5A5A',
          bronze: '#CD7F32',
          silver: '#C0C0C0',
          gold: '#FFD700',
          platinum: '#00CED1',
          emerald: '#50C878',
          diamond: '#B9F2FF',
          master: '#9B30FF',
          grandmaster: '#FF4444',
          challenger: '#F4C430',
        },
        victory: '#22C55E',
        defeat: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 27% 37%, hsla(270, 91%, 65%, 0.12) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(180, 91%, 65%, 0.09) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(330, 91%, 65%, 0.09) 0px, transparent 50%)',
        'gradient-launcher': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(212, 175, 55, 0.3)',
        'glow': '0 0 20px rgba(212, 175, 55, 0.4)',
        'glow-lg': '0 0 30px rgba(212, 175, 55, 0.5)',
        'gold': '0 4px 16px rgba(212, 175, 55, 0.25)',
        'inner-glow': 'inset 0 0 20px rgba(212, 175, 55, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
