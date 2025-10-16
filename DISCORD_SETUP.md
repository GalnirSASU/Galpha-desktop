# Discord OAuth2 Setup Guide

Galpha uses Discord OAuth2 for user authentication and future monetization features. Follow these steps to set up your Discord application.

## Step 1: Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** in the top right
3. Give your application a name (e.g., "Galpha Desktop")
4. Accept the Terms of Service and click **"Create"**

## Step 2: Get Your Client ID

1. In your application's page, go to the **"OAuth2"** section in the left sidebar
2. Under **"Client Information"**, you'll see your **Client ID**
3. Click the **"Copy"** button to copy it

## Step 3: Configure Redirect URI

1. Still in the **OAuth2** section, scroll down to **"Redirects"**
2. Click **"Add Redirect"**
3. Enter: `http://localhost:3737/callback`
4. Click **"Save Changes"**

## Step 4: Configure Your Application

1. Open the `.env` file in the root of the Galpha project (if it doesn't exist, copy `.env.example` to `.env`)
2. Replace the `VITE_DISCORD_CLIENT_ID` value with your actual Client ID:

```env
VITE_DISCORD_CLIENT_ID=your_actual_client_id_here
```

## Step 5: Test Authentication

1. Run the application: `npm run tauri dev`
2. Click the **"Login with Discord"** button
3. You should be redirected to Discord's authorization page
4. After authorizing, you'll be redirected back to Galpha and logged in

## Troubleshooting

### "Invalid Client" Error
- Make sure your Client ID in the `.env` file is correct
- Verify that you've saved the redirect URI in the Discord Developer Portal

### Browser Doesn't Open
- Check that the `open` crate can access your default browser
- Try manually copying the URL from the console and pasting it in your browser

### "Redirect URI Mismatch" Error
- Ensure the redirect URI in Discord Developer Portal is exactly: `http://localhost:3737/callback`
- Make sure there are no trailing slashes or extra characters

## Security Notes

- **Never commit your `.env` file** - It contains sensitive client information
- The `.gitignore` file should already exclude `.env`
- Keep your Client ID private - it's used for authentication

## Future: Client Secret

For production deployment with backend verification, you'll need to:
1. Generate a Client Secret in the Discord Developer Portal
2. Add it to your `.env` file: `VITE_DISCORD_CLIENT_SECRET=your_secret`
3. Implement server-side token verification

This is not required for local development.
