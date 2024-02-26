type GameStruct = {
  appid: number,
  name: string,
}

type MainWindowPanels = {
  options: number,
  games: number,
  grids: number
}

type CleanGridsPreset = "clean" | "custom";
type ManageManualGamesMethod = "manual" | "search";

type AppSettings = {
  version: string,
  steamInstallPath: string,
  shownShortcutPrompt: boolean,
  steamGridDbApiKey: string,
  steamApiKeyMap: Record<string, string>,
  hiddenGameIds: number[],
  manualSteamGames: GameStruct[],
  customGameNames: Record<string, string>,
  
  theme: number,
  showHiddenGames: boolean,

  /**
   * @deprecated no longer used
   */
  gameViewType?: number,
  /**
   * @deprecated no longer used
   */
  filters?: any,
  /**
   * @deprecated no longer used
   */
  panels?: {
    options: number,
    games: number,
    grids: number
  },
  
  windowSettings: {
    main: {
      filters: any,
      panels: MainWindowPanels,
      gameViewType: number,
      type: string
    },
    cleanGrids: {
      preset: CleanGridsPreset
    },
    manageManualGames: {
      method: ManageManualGamesMethod
    }
  }
};

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

type DialogModalType = "INFO" | "WARNING" | "ERROR";

type LogoPinPositions = "BottomLeft" | "UpperLeft" | "CenterCenter" | "UpperCenter" | "BottomCenter" | "REMOVE";

type LogoPosition = {
  pinnedPosition: LogoPinPositions,
  nWidthPct: number,
  nHeightPct: number,
};

type SteamLogoConfig = {
  nVersion: number,
  logoPosition: LogoPosition,
}

type CleanConflict = {
  fileAName: string,
  fileAPath: string,
  fileBName: string,
  fileBPath: string,
  appid: string,
  gridType: string
}