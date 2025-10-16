/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RIOT_API_KEY: string
  readonly VITE_DISCORD_CLIENT_ID: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
