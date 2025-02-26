export type GameStruct = {
  appid: number,
  name: string,
  gridInfo?: {
    icon: string,
    capsule: string,
    wideCapsule: string,
    hero: string,
    logo: string,
  }
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