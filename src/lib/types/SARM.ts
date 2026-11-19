export type GameStruct = {
  appid: number,
  name: string,
  gridInfo?: GameStructGridInfo
  type: string
  installed: boolean
  lastPlayed?: number
  playtime?: number

  // Only available when using Steam Client
  hiddenInSteam?: boolean,
  isFamilySharing?: boolean,
  releaseDate?: number,
  purchaseDate?: number,
  storeCategories?: number[],
  storeTags?: number[],
  steamReviewScore?: number,
  steamDeckCompatCategory?: number
  steamFrameCompatCategory?: number
  steamMachineCompatCategory?: number
  steamOSCompatCategory?: number
}

export type GameStructGridInfo = {
    icon: string,
    capsule: string,
    wideCapsule: string,
    hero: string,
    logo: string,
  }

export enum GridTypes {
  CAPSULE="Capsule",
  WIDE_CAPSULE="Wide Capsule",
  HERO="Hero",
  LOGO="Logo",
  ICON="Icon"
}

export type GridTypesOptionalMap<T> = {
  [key in GridTypes]?: T;
}

export type GridTypesMap<T> = {
  [key in GridTypes]: T;
}

export type MainWindowPanels = {
  options: number,
  games: number,
  grids: number
}

export type CleanGridsPreset = "clean" | "custom";
export type ManageManualGamesMethod = "manual" | "search";

export type LibraryCacheEntry = GridTypesOptionalMap<string>;

export type ChangedPath = {
  appId: string,
  gridType: GridTypes,
  oldPath: string,
  targetPath: string,
  sourcePath: string
}

export type DialogModalType = "INFO" | "WARNING" | "ERROR";

export type CleanConflict = {
  fileAName: string,
  fileAPath: string,
  fileBName: string,
  fileBPath: string,
  appid: string,
  gridType: string
}

export type LocalConfigEntry = {
  lastPlayed?: string,
  playtime?: string,
}

export type InstallFolder = {
  displayName?: string,
  drive: string,
  bIsMounted: boolean,
  strFolderPath: string,
  apps: number[],
}

export type Collection = {
  id: number,
  name: string,
  apps: number[],
}

export type SteamClientFilterData = {
  installFolders: InstallFolder[],
  tags: Record<number, string>,
  collections: Collection[]
}