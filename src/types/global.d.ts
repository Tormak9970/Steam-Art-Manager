type AppSettings = {
  version: string;
  steamGridDbApiKey: string;
  hiddenGameIds: []
};

type SteamRegistryApp = {
  appid: string,
  name: string
}

type SteamGame = {
  appid: number,
  name: string,
}

type LibraryCacheEntry = {
  "Grids": string,
  "Heros": string,
  "Logos": string,
  "Icons": string,
}

declare const __APP_VERSION__: string;