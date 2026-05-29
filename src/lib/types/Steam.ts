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

export type CommonLibraryImage = {
  english?: string,
}

export type CommonLibraryAsset = {
  image: CommonLibraryImage,
}

export type CommonLibraryInfo = {
  library_capsule?: CommonLibraryAsset,
  library_header?: CommonLibraryAsset,
  header_image?: CommonLibraryAsset,
  library_hero?: CommonLibraryAsset,
  library_logo?: CommonLibraryAsset,
}

export type AppInfoCommonProps = {
  library_assets_full?: CommonLibraryInfo
  name: string | any,
  type?: string,
  icon?: string,
  header_image?: CommonLibraryImage,
}

export type AppInfo = {
  appid: number,
  common?: AppInfoCommonProps
}

export type AppInfoVdf = {
    entries: AppInfo[]
}