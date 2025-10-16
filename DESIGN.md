# Galpha Desktop - Design System

## Overview

Galpha uses a modern, dark-themed design inspired by popular League apps like DPM, OP.GG, and Porofessor, but with a unique twist - AI-powered insights and a more premium feel.

## Color Palette

### Primary Colors (Blue Theme)
```
Primary 500: #0ea5e9  (Bright Blue)
Primary 600: #0284c7  (Medium Blue)
Primary 700: #0369a1  (Dark Blue)
Primary 400: #38bdf8  (Light Blue)
```

### Dark Theme (Background)
```
Dark 900: #0a0e27  (Darkest - Main BG)
Dark 800: #0f1629  (Dark - Cards)
Dark 700: #161d35  (Medium - Borders)
Dark 600: #1e2640  (Light - Hover)
Dark 500: #2a3353  (Lightest)
```

### Semantic Colors
```
Victory:  #4ade80  (Green)
Defeat:   #f87171  (Red)
Gold:     #f59e0b  (Orange/Yellow)
Warning:  #fbbf24  (Yellow)
Info:     #60a5fa  (Blue)
```

### Grayscale
```
Gray 100: #f3f4f6
Gray 300: #d1d5db
Gray 400: #9ca3af
Gray 500: #6b7280
Gray 600: #4b5563
Gray 700: #374151
```

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: system-ui, -apple-system, sans-serif
- **Mono**: 'Fira Code', 'Courier New', monospace

### Font Sizes
```
xs:   0.75rem  (12px)
sm:   0.875rem (14px)
base: 1rem     (16px)
lg:   1.125rem (18px)
xl:   1.25rem  (20px)
2xl:  1.5rem   (24px)
3xl:  1.875rem (30px)
4xl:  2.25rem  (36px)
6xl:  3.75rem  (60px)
8xl:  6rem     (96px)
```

### Font Weights
```
Normal:    400
Medium:    500
Semibold:  600
Bold:      700
Extrabold: 800
```

## Components

### Cards
```css
.card {
  background: dark-800
  border-radius: 12px
  padding: 24px
  border: 1px solid dark-700
  shadow: xl
}

.stat-card {
  extends: card
  hover:border-color: primary-500
  transition: all 300ms
  cursor: pointer
}

.glassmorphism {
  background: dark-800/50 (50% opacity)
  backdrop-filter: blur(20px)
  border: 1px solid dark-700/50
}
```

### Buttons
```css
.btn-primary {
  background: gradient (primary-600 → primary-500)
  padding: 12px 24px
  border-radius: 8px
  font-weight: 600
  hover:gradient: (primary-700 → primary-600)
  shadow: lg
  hover:shadow: xl
  transform: hover:scale-105
}

.btn-secondary {
  background: dark-700
  hover:background: dark-600
  padding: 8px 16px
  border-radius: 8px
  font-weight: 500
}
```

### Badges
```css
.badge {
  padding: 4px 12px
  border-radius: 9999px (full)
  font-size: sm
  font-weight: 600
}

.badge-victory {
  background: victory/20
  color: victory
  border: 1px solid victory/30
}

.badge-defeat {
  background: defeat/20
  color: defeat
  border: 1px solid defeat/30
}

.badge-gold {
  background: gold-500/20
  color: gold-500
  border: 1px solid gold-500/30
}
```

### Progress Bars
```css
.progress-bar {
  width: 100%
  height: 8px
  background: dark-700
  border-radius: 9999px
  overflow: hidden
}

.progress-fill {
  height: 100%
  background: gradient (primary-600 → primary-400)
  border-radius: 9999px
  transition: width 300ms ease
}
```

## Animations

### Keyframes
```css
@keyframes fadeIn {
  from { opacity: 0 }
  to { opacity: 1 }
}

@keyframes slideUp {
  from {
    transform: translateY(10px)
    opacity: 0
  }
  to {
    transform: translateY(0)
    opacity: 1
  }
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 20px primary-500/30
  }
  50% {
    box-shadow: 0 0 40px primary-500/60
  }
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1 }
  50% { opacity: 0.7 }
}
```

### Usage
```
animate-fade-in:   fadeIn 300ms ease-in
animate-slide-up:  slideUp 300ms ease-out
animate-glow:      glow 3s ease-in-out infinite
animate-pulse-slow: pulse-slow 3s infinite
```

## Effects

### Shadows
```
sm:   0 1px 2px rgba(0,0,0,0.05)
md:   0 4px 6px rgba(0,0,0,0.1)
lg:   0 10px 15px rgba(0,0,0,0.15)
xl:   0 20px 25px rgba(0,0,0,0.2)
2xl:  0 25px 50px rgba(0,0,0,0.25)
```

### Gradients
```
gradient-to-r: left → right
gradient-to-br: top-left → bottom-right

Common combinations:
- primary-600 → primary-500
- primary-400 → primary-600
- dark-900 → dark-800
- victory → primary-400
```

### Backdrop Blur
```
backdrop-blur-xl: blur(20px)
backdrop-blur-lg: blur(16px)
backdrop-blur-md: blur(12px)
```

## Spacing

### Padding/Margin Scale
```
0:    0
1:    0.25rem  (4px)
2:    0.5rem   (8px)
3:    0.75rem  (12px)
4:    1rem     (16px)
6:    1.5rem   (24px)
8:    2rem     (32px)
12:   3rem     (48px)
16:   4rem     (64px)
```

## Layout

### Breakpoints
```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Grid System
```
Dashboard:
- 1 column (mobile)
- 3 columns (desktop)
  - Left: 1 column (profile)
  - Right: 2 columns (stats)

Match History:
- 1 column (mobile)
- 2 columns (tablet)
- 3 columns (desktop)
```

## Iconography

### Sources
- Emoji for quick prototyping
- Heroicons for UI elements
- Custom SVGs for specific needs
- Data Dragon for LoL assets

### Common Icons
```
Game:     🎮
Stats:    📊
Coach:    🤖
Trophy:   🏆
Target:   🎯
Checkmark: ✅
Cross:     ❌
Star:      ⭐
Fire:      🔥
```

## Customization for Your DPM Style

If you want to match your specific DPM test version, update these in `tailwind.config.js`:

### Option 1: Purple Theme (Like DPM Purple)
```js
primary: {
  500: '#a855f7',  // Purple 500
  600: '#9333ea',  // Purple 600
  700: '#7e22ce',  // Purple 700
}
```

### Option 2: Teal Theme (Like Blitz)
```js
primary: {
  500: '#14b8a6',  // Teal 500
  600: '#0d9488',  // Teal 600
  700: '#0f766e',  // Teal 700
}
```

### Option 3: Red/Orange Theme (Like OP.GG)
```js
primary: {
  500: '#f97316',  // Orange 500
  600: '#ea580c',  // Orange 600
  700: '#c2410c',  // Orange 700
}
```

### Option 4: Green Theme (Victory/Nature)
```js
primary: {
  500: '#10b981',  // Emerald 500
  600: '#059669',  // Emerald 600
  700: '#047857',  // Emerald 700
}
```

## Best Practices

### Do's ✅
- Use semantic color names (victory/defeat vs green/red)
- Maintain consistent spacing (multiples of 4px)
- Use gradients for CTAs and highlights
- Animate state changes smoothly
- Keep dark mode contrast high
- Use glassmorphism for overlays

### Don'ts ❌
- Don't use pure white (#ffffff) - use gray-100
- Don't use pure black (#000000) - use dark-900
- Don't animate everything - be purposeful
- Don't use too many colors - stick to palette
- Don't forget hover/active states
- Don't make text too small (<12px)

## Accessibility

### Contrast Ratios
- Text on dark-900: Use gray-300+ (AAA)
- Primary text: Use white or gray-100 (AAA)
- Secondary text: Use gray-400 (AA)
- Disabled text: Use gray-600

### Focus States
- All interactive elements have focus rings
- Focus ring: 2px solid primary-500
- Offset: 2px

### Motion
- Respect `prefers-reduced-motion`
- Disable animations if requested
- Keep animations subtle

## Responsive Design

### Mobile First
- Design for mobile (320px+)
- Enhance for tablet (768px+)
- Optimize for desktop (1024px+)

### Touch Targets
- Minimum size: 44x44px
- Spacing between: 8px
- Use larger padding on mobile

## Dark Theme Only

Galpha uses a dark theme exclusively for:
- Reduced eye strain during gaming
- Better immersion with LoL aesthetic
- Premium, modern feel
- Battery savings (OLED displays)

## Branding

### Logo
- Primary: 🎮 Galpha Desktop
- Color: Gradient (primary-400 → primary-600)
- Font: Inter 700 (Bold)

### Tagline
"League of Legends Stats Tracker with AI-Powered Insights"

### Voice & Tone
- Professional but friendly
- Data-driven but not overwhelming
- Helpful, not pushy
- Encouraging, not toxic

---

**Want a different color scheme?**

Share your DPM test version colors (hex codes) and I can generate a custom theme!

Example:
```
Main BG:    #0a0e27
Card BG:    #1a1f3a
Primary:    #5b8def
Victory:    #4ade80
Defeat:     #f87171
```

Update these in [tailwind.config.js](tailwind.config.js) and restart the dev server!
