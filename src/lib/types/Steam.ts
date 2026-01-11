export type LogoPinPositions = "BottomLeft" | "CenterCenter" | "UpperCenter" | "BottomCenter" | "REMOVE";

export type LogoPosition = {
  pinnedPosition: LogoPinPositions,
  nWidthPct: number,
  nHeightPct: number,
};

export type SteamLogoConfig = {
  nVersion: number,
  logoPosition: LogoPosition,
}


export type SteamRegistryApp = {
  appid: string,
  name: string
}

export type SteamShortcut = {
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

export type SteamUser = {
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