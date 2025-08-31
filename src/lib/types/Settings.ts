import type { CleanGridsPreset, GameStruct, MainWindowPanels, ManageManualGamesMethod } from "./SARM";

export type Settings = {
  version: string,
  steamInstallPath: string,
  shownShortcutPrompt: boolean,
  steamGridDbApiKey: string,
  steamApiKeyMap: Record<string, string>,
  hiddenGameIds: number[],
  manualSteamGames: GameStruct[],
  customGameNames: Record<string, string>,

  cacheSelectedGrids: boolean,
  
  theme: number,
  showHiddenGames: boolean,

  debugMode: boolean,

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