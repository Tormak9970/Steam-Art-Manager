type AppSettings = {
  version: string;
  steamGridDbApiKey: string;
  appIdBlacklist: []
};

type SteamRegistryApp = {
  appid: string,
  name: string
}

declare const __APP_VERSION__: string;