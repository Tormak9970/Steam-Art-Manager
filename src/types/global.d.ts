type AppSettings = {
  version: string;
  steamGridDbApiKey: string;
  steamApiKey: string;
  hiddenGameIds: []
};

type SteamRegistryApp = {
  appid: string,
  name: string
}

type GameStruct = {
  appid: number,
  name: string,
}

type SteamShortcut = {
  AllowDesktopConfig: number
  AllowOverlay: number
  AppName: string
  Devkit: number
  DevkitGameID: string,
  DevkitOverrideAppID: number
  Exe: string,
  FlatpakAppID: string,
  IsHidden: number,
  LastPlayTime: number,
  LaunchOptions: string,
  OpenVR: number,
  ShortcutPath: string,
  StartDir: string,
  appid: number,
  icon: string,
  tags: {
    [key: number]: string
  }
}

type SteamUser = {
  id64: string,
  id32: string,
  AccountName: string,
  PersonaName: string,
  RememberPassword: string,
  WantsOfflineMode: string,
  SkipOfflineModeWarning: string,
  AllowAutoLogin: string,
  MostRecent: string,
  Timestamp: string
}

type LibraryCacheEntry = {
  "Capsule": string,
  "Wide Capsule": string,
  "Hero": string,
  "Logo": string,
  "Icon": string,
}

type ChangedPath = {
  appId: string,
  gridType: string,
  oldPath: string,
  targetPath: string,
  sourcePath: string
}