# Galpha Desktop - TODO List

## Immediate Actions (Before First Run)

- [ ] **Install Rust** on your system
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  source $HOME/.cargo/env
  ```

- [ ] **Get Riot API Key**
  - Visit https://developer.riotgames.com/
  - Sign in and generate API key
  - Save it for next step

- [ ] **Create config.toml**
  ```bash
  cp config.example.toml config.toml
  # Edit and add your API key
  ```

- [ ] **First Build**
  ```bash
  npm run tauri dev
  ```

## Phase 1 - MVP Completion (1-2 days)

### Critical Fixes
- [ ] Test Rust compilation and fix any errors
- [ ] Verify LCU connection works with real League Client
- [ ] Test database creation and data storage
- [ ] Verify summoner profile displays correctly

### UI Enhancements
- [ ] Wire up "Sync Matches" button
  - Call `initialize_riot_client` command
  - Call `fetch_match_history` command
  - Store matches in database
  - Refresh stats display

- [ ] Implement Match History Display
  - Create `MatchCard.tsx` component
  - Show: Champion, KDA, Win/Loss, Duration, Queue type
  - Add champion icons from Data Dragon
  - Make cards clickable for details

- [ ] Add Loading States
  - Skeleton loaders for stats cards
  - Progress indicators for sync
  - Better error messages

- [ ] Implement Auto-Refresh
  - Poll for new matches every 30 seconds
  - Show notification when new match found
  - Update stats in real-time

### Backend Improvements
- [ ] Add error logging to file
- [ ] Implement retry logic for failed API calls
- [ ] Add match detail fetching and storage
- [ ] Create utility function to parse match data

## Phase 2 - Advanced Stats (2-3 weeks)

### Match History Features
- [ ] **Match Details Modal**
  - Full match timeline
  - All players' stats
  - Items purchased
  - Runes & summoner spells
  - Team composition

- [ ] **Filtering & Sorting**
  - Filter by queue type (Ranked, Normal, ARAM)
  - Filter by champion
  - Filter by result (Win/Loss)
  - Sort by date, KDA, damage, etc.

- [ ] **Search Functionality**
  - Search matches by champion name
  - Search by date range
  - Quick filters (Last 7 days, This season, etc.)

### Statistics Dashboard
- [ ] **Champion Statistics**
  - Most played champions
  - Winrate per champion
  - Average KDA per champion
  - Champion mastery tracking

- [ ] **Performance Graphs** (using Recharts)
  - KDA over time (line graph)
  - Winrate trend (area chart)
  - CS/min progression (bar chart)
  - Damage dealt per game (scatter plot)

- [ ] **Role Analysis**
  - Stats breakdown by role (Top, Jungle, Mid, ADC, Support)
  - Best/worst performing role
  - Role recommendations

- [ ] **Recent Form**
  - Last 5/10/20 games summary
  - Win streak / Loss streak detection
  - Performance trend (improving/declining)

### Database Enhancements
- [ ] Add indexes for faster queries
- [ ] Implement data cleanup (old matches)
- [ ] Add backup/export functionality
- [ ] Store champion mastery data

## Phase 3 - AI Features (3-4 weeks)

### Pre-Game Analysis
- [ ] **Lobby Detection**
  - Detect champ select via LCU
  - Fetch all 10 players' data
  - Calculate team compositions

- [ ] **Win Prediction**
  - Machine learning model for win probability
  - Based on: Champion picks, player history, synergies
  - Show probability percentage

- [ ] **Counter Picks**
  - Suggest champions against enemy comp
  - Show pick/ban recommendations
  - Display champion counters

- [ ] **Teammate Analysis**
  - Show teammate recent performance
  - Identify smurfs (high winrate, new account)
  - Identify one-tricks (champion mains)
  - Flag dodgy accounts (high loss streak)

### AI Coach
- [ ] **Post-Match Analysis**
  - Identify mistakes (deaths in bad positions)
  - Compare performance to average for champion
  - Highlight strengths

- [ ] **Personalized Tips**
  - "You tend to die a lot at 15-20 minutes"
  - "Your CS is good early, but falls off late"
  - "You deal less damage than average on this champ"

- [ ] **Build Recommendations**
  - Suggest optimal items based on matchup
  - Compare your builds to high-elo players
  - Recommend rune adjustments

- [ ] **Skill Analysis**
  - CS improvement areas
  - Vision score tips
  - Objective control feedback

### Achievements System
- [ ] **Achievement Types**
  - KDA achievements (Pentakill Master, etc.)
  - CS achievements (200 CS before 20 min)
  - Win streak achievements
  - Champion-specific achievements

- [ ] **Badge Display**
  - Show unlocked badges on profile
  - Progress bars for in-progress achievements
  - Shareable achievement images

- [ ] **Challenges**
  - Weekly challenges (Get 5 wins, etc.)
  - Champion challenges (Win 10 games as X)
  - Role challenges (Play 5 different roles)

## Phase 4 - Advanced Features (4-6 weeks)

### In-Game Overlay
- [ ] **Overlay Window**
  - Transparent window over game
  - Toggle on/off with hotkey
  - Draggable and resizable

- [ ] **Timers**
  - Dragon timer (every 5 min)
  - Baron timer (every 6 min)
  - Buff timers (Blue/Red - 5 min)
  - Flash cooldowns (estimated)

- [ ] **Live Stats**
  - Current gold difference
  - Damage dealt in fight
  - CS difference
  - Vision score

- [ ] **Mini Tips**
  - "Dragon spawns in 30 seconds"
  - "You're behind in CS, focus on farming"
  - "Ward your jungle, they have priority"

### Social Features
- [ ] **Friends System**
  - Add friends by Riot ID
  - View friends' stats
  - Compare stats with friends

- [ ] **Leaderboards**
  - Local leaderboard among friends
  - Weekly/Monthly rankings
  - Challenge leaderboards

- [ ] **Share Feature**
  - Share match screenshots
  - Share achievement unlocks
  - Export stats as image

- [ ] **Challenges with Friends**
  - Create custom challenges
  - Track progress together
  - Friendly competition

### Multi-Account Support
- [ ] Support multiple accounts
- [ ] Switch between accounts
- [ ] Combined stats view
- [ ] Account comparison

### Settings & Customization
- [ ] **Theme System**
  - Multiple color themes
  - Custom theme creator
  - Import/export themes

- [ ] **Notification Settings**
  - Toggle notifications
  - Choose what to be notified about
  - Sound settings

- [ ] **Privacy Settings**
  - Hide specific stats
  - Private mode (no data collection)
  - Clear data option

- [ ] **Advanced Options**
  - Refresh interval customization
  - API rate limit settings
  - Database location
  - Auto-start with system

## Quality Assurance

### Testing
- [ ] Unit tests for Rust backend
- [ ] Integration tests for Tauri commands
- [ ] React component tests
- [ ] End-to-end tests

### Performance
- [ ] Profile app performance
- [ ] Optimize database queries
- [ ] Reduce memory usage
- [ ] Minimize CPU usage

### Bug Fixes
- [ ] Fix any crashes
- [ ] Handle edge cases
- [ ] Improve error messages
- [ ] Add retry mechanisms

### Documentation
- [ ] API documentation (Rust docs)
- [ ] Component documentation (JSDoc)
- [ ] User guide
- [ ] Video tutorials

## Distribution

### Preparation
- [ ] Add auto-updater
- [ ] Create installer/dmg
- [ ] Code signing (macOS/Windows)
- [ ] Virus scanning clearance

### Release
- [ ] GitHub Releases
- [ ] Website/landing page
- [ ] Social media announcement
- [ ] Reddit/Discord promotion

### Support
- [ ] Issue templates
- [ ] FAQ document
- [ ] Troubleshooting guide
- [ ] Community Discord

## Future Ideas (Backlog)

### Advanced Analytics
- [ ] Heatmaps (deaths, wards, CS)
- [ ] Replay analysis integration
- [ ] Compare with pro players
- [ ] Meta analysis (current patch trends)

### Integrations
- [ ] OP.GG data import
- [ ] Stream overlays (OBS integration)
- [ ] Discord Rich Presence
- [ ] Twitch integration

### Monetization (Optional)
- [ ] Pro version with advanced features
- [ ] Patreon for supporters
- [ ] Donation system
- [ ] Merchandise

### Community
- [ ] User-submitted tips
- [ ] Coach marketplace
- [ ] Team finder
- [ ] Tournament organizer

## Priority Matrix

**High Priority (Do First)**
1. Complete Phase 1 MVP
2. Test with real data
3. Match history display
4. Auto-sync functionality

**Medium Priority**
5. Champion statistics
6. Performance graphs
7. Pre-game analysis
8. AI coach basics

**Low Priority**
9. In-game overlay
10. Social features
11. Advanced customization

**Nice to Have**
12. Achievements
13. Themes
14. Multi-account
15. Integrations

---

## Quick Win Checklist (This Week)

- [ ] Install Rust
- [ ] Build app successfully
- [ ] Test LoL detection
- [ ] Verify LCU connection
- [ ] Display summoner profile
- [ ] Fetch one match from Riot API
- [ ] Store match in database
- [ ] Display match in UI

Once these are done, you have a working MVP! 🎉

---

**Last Updated**: October 2025
**Status**: Ready to start Phase 1 implementation
