/// <reference types="vite/client" />

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

interface ImportMetaEnv {
  readonly VITE_RIOT_API_KEY: string
  readonly VITE_DISCORD_CLIENT_ID: string
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
