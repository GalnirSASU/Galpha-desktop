# Galpha Desktop

**League of Legends Stats Tracker with AI-Powered Insights**

Galpha Desktop is a modern, feature-rich desktop application for League of Legends players that provides real-time statistics, match history, and AI-powered analysis - all automatically synced when you play.

## Features

### Core Features (Phase 1 - MVP)
- **Automatic Detection** - Detects when League of Legends is running
- **LCU Integration** - Connects to your League Client automatically
- **Player Profile** - Displays your summoner info, level, and icon
- **Statistics Dashboard** - KDA, winrate, CS/min, damage, vision score
- **Match History** - View your recent games with detailed stats
- **Local Database** - All data stored locally using SQLite

### Planned Features (Phase 2-3)
- **Pre-game Analysis** - Analyze teammates and opponents in lobby
- **Win Probability** - AI-powered prediction before the game starts
- **AI Coach** - Post-match analysis with personalized tips
- **Achievements System** - Unlock badges and challenges
- **Advanced Analytics** - Heatmaps, progression graphs, tilt detection
- **In-game Overlay** - Real-time stats and timers (optional)
- **Social Features** - Leaderboards, challenges with friends

## Tech Stack

### Backend (Rust)
- **Tauri** - Modern desktop app framework
- **Tokio** - Async runtime
- **SQLx** - Database operations
- **Reqwest** - HTTP client for Riot API
- **Sysinfo** - Process detection

### Frontend (React)
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### APIs
- **Riot Games API** - Official match data
- **LCU API** - League Client integration
- **Data Dragon** - Champion & item assets

## Getting Started

### Prerequisites
- **Rust** (latest stable) - [Install Rust](https://www.rust-lang.org/tools/install)
- **Node.js** (v18+) - [Install Node.js](https://nodejs.org/)
- **League of Legends** - Obviously!
- **Riot API Key** - [Get one here](https://developer.riotgames.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/galpha-desktop.git
   cd galpha-desktop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your API key**
   ```bash
   cp config.example.toml config.toml
   # Edit config.toml and add your Riot API key
   ```

4. **Run the development build**
   ```bash
   npm run tauri dev
   ```

### Building for Production

```bash
npm run tauri build
```

The installer will be generated in `src-tauri/target/release/bundle/`

## Configuration

Edit `config.toml` to customize:
- Riot API key and region
- Auto-start settings
- Refresh intervals
- Database location
- Feature flags

## Project Structure

```
galpha-desktop/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── styles/             # CSS/Tailwind styles
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
│
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── lcu/            # League Client integration
│   │   ├── riot_api/       # Riot API client
│   │   ├── database/       # SQLite database
│   │   └── lib.rs          # Main Rust code
│   └── Cargo.toml          # Rust dependencies
│
├── config.toml             # Configuration (create from .example)
└── README.md               # This file
```

## How It Works

1. **Detection** - Galpha monitors your system for the League of Legends process
2. **Connection** - When detected, it reads the lockfile and connects to the LCU API
3. **Data Fetching** - Retrieves your summoner info and PUUID
4. **API Calls** - Uses PUUID to fetch match history from Riot API
5. **Storage** - Saves all data to local SQLite database
6. **Display** - Shows beautiful stats in the React dashboard
7. **Auto-Sync** - Refreshes every 30 seconds for new matches

## Rate Limiting

Galpha respects Riot API rate limits:
- **Development Key**: 20 requests/second, 100 requests/2 minutes
- **Production Key**: 100 requests/second, 3000 requests/2 minutes

The built-in rate limiter ensures you never exceed these limits.

## Privacy & Security

- **100% Local** - All data stored on your computer
- **No Servers** - Direct connection to Riot APIs only
- **Open Source** - Full transparency, audit the code yourself
- **API Key Safe** - Stored locally in config.toml (never committed)

## Roadmap

### Phase 1 - Core (Current)
- [x] Project setup with Tauri + React
- [x] LoL process detection
- [x] LCU connector
- [x] SQLite database
- [x] Basic dashboard UI
- [ ] Riot API integration (in progress)
- [ ] Match history display

### Phase 2 - Stats & History
- [ ] Match details view
- [ ] Champion statistics
- [ ] Ranked stats tracking
- [ ] Performance graphs
- [ ] Export data feature

### Phase 3 - AI Features
- [ ] Pre-game lobby analysis
- [ ] Win probability calculator
- [ ] Post-match AI coach
- [ ] Personalized tips
- [ ] Champion recommendations

### Phase 4 - Advanced
- [ ] In-game overlay
- [ ] Achievements system
- [ ] Social features
- [ ] Multi-account support
- [ ] Cloud sync (optional)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Disclaimer

Galpha Desktop is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are trademarks or registered trademarks of Riot Games, Inc.

## Credits

- Built with [Tauri](https://tauri.app/)
- Powered by [Riot Games API](https://developer.riotgames.com/)
- Inspired by apps like OP.GG, U.GG, and Porofessor

---

**Made with ❤️ for the League of Legends community**
