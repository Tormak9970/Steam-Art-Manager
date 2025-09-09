import type { CleanGridsPreset, GameStruct, GridTypesOptionalMap, MainWindowPanels, ManageManualGamesMethod } from "./SARM";
import type { SGDBImage } from "./SGDB";

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
  userSelectedGrids: Record<string, GridTypesOptionalMap<SGDBImage[]>>,
  
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
      showCached: boolean,
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