# Setup Instructions for Galpha Desktop

## Prerequisites Installation

### 1. Install Rust

Galpha Desktop requires Rust to be installed on your system. Here's how to install it:

**macOS / Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, restart your terminal and verify:
```bash
rustc --version
cargo --version
```

**Windows:**
1. Download and run [rustup-init.exe](https://rustup.rs/)
2. Follow the on-screen instructions
3. Restart your terminal

### 2. Install Tauri Prerequisites

**macOS:**
```bash
xcode-select --install
```

**Windows:**
- Install [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

**Linux (Debian/Ubuntu):**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### 3. Verify Node.js Installation

Galpha requires Node.js v18 or higher:

```bash
node --version  # Should show v18.x or higher
npm --version
```

If not installed, download from [nodejs.org](https://nodejs.org/)

## Project Setup

### 1. Clone and Install Dependencies

```bash
cd /Users/galnir/Documents/GitHub/Galpha
npm install
```

### 2. Configure Riot API Key

1. Get your API key from [Riot Developer Portal](https://developer.riotgames.com/)
2. Create configuration file:
   ```bash
   cp config.example.toml config.toml
   ```
3. Edit `config.toml` and add your API key:
   ```toml
   [riot_api]
   api_key = "RGAPI-YOUR-KEY-HERE"
   region = "euw1"
   ```

### 3. Run Development Build

```bash
npm run tauri dev
```

This will:
- Compile the Rust backend
- Start the Vite dev server for React
- Open the Galpha Desktop application

**Note:** The first build will take several minutes as it downloads and compiles all Rust dependencies.

## Building for Production

Once everything is set up and working:

```bash
npm run tauri build
```

The compiled app will be in:
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Windows**: `src-tauri/target/release/bundle/msi/`
- **Linux**: `src-tauri/target/release/bundle/deb/` or `appimage/`

## Troubleshooting

### "command not found: rustc"
- Rust is not installed or not in PATH
- Solution: Install Rust using instructions above and restart terminal

### "failed to run custom build command for `sqlx`"
- Missing build dependencies
- Solution: Install platform-specific prerequisites above

### "Error connecting to LCU"
- League of Legends is not running
- Solution: Start League Client first

### "Failed to fetch summoner"
- Lockfile permissions issue
- Solution: Run Galpha Desktop with appropriate permissions

### "Riot API request failed: 403"
- Invalid or expired API key
- Solution: Get a new API key and update `config.toml`

### "Riot API request failed: 429"
- Rate limit exceeded
- Solution: Wait a few minutes, the app will auto-retry

## Development Tips

### Hot Reload
The frontend (React) has hot module replacement - changes appear instantly.
Backend (Rust) changes require restarting the dev server.

### Viewing Logs
Logs appear in the terminal where you ran `npm run tauri dev`.

### Database Location
- **macOS**: `~/Library/Application Support/galpha/galpha.db`
- **Windows**: `%APPDATA%\galpha\galpha.db`
- **Linux**: `~/.local/share/galpha/galpha.db`

### Clearing Data
To reset the database, simply delete the `.db` file above.

### VSCode Extensions (Recommended)
- **rust-analyzer** - Rust language support
- **Tauri** - Tauri-specific tools
- **ES7+ React/Redux/React-Native snippets** - React snippets
- **Tailwind CSS IntelliSense** - Tailwind autocomplete

## Next Steps

Once you have the app running:

1. **Test LoL Detection**: Start League of Legends and verify Galpha detects it
2. **Check LCU Connection**: Ensure your summoner profile appears
3. **Test Database**: Verify data is being saved (check logs)
4. **Add Match Data**: Play a game and check if it appears in history

## Need Help?

- Check the [README.md](README.md) for general information
- Open an issue on GitHub for bugs
- Review Tauri docs: https://tauri.app/
- Review Riot API docs: https://developer.riotgames.com/

Happy coding! 🚀
