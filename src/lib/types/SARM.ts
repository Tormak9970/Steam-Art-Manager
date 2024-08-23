export type GameStruct = {
  appid: number,
  name: string,
}

export type MainWindowPanels = {
  options: number,
  games: number,
  grids: number
}

export type CleanGridsPreset = "clean" | "custom";
export type ManageManualGamesMethod = "manual" | "search";

export type LibraryCacheEntry = {
  "Capsule": string,
  "Wide Capsule": string,
  "Hero": string,
  "Logo": string,
  "Icon": string,
}

export type ChangedPath = {
  appId: string,
  gridType: string,
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