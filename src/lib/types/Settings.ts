import type { CleanGridsPreset, GameStruct, GridTypesOptionalMap, MainWindowPanels, ManageManualGamesMethod } from "./SARM";
import type { SGDBImage } from "./SGDB";

export enum SortMethods {
  ALPHABETICAL,
  LAST_PLAYED,
  PLAYTIME
}

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
  onlyShowInstalled: boolean,
  onlyShowMissing: boolean,
  previewOnClick: boolean,

  debugMode: boolean,

  appTypes: string[],

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
      gridImageSize: string,
      filters: any,
      sortBy: SortMethods,
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
  },

  fixes: {
    autoGenLogoPos: boolean
  }
};