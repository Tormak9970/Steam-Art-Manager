import type { CleanGridsPreset, GameStruct, GridTypesOptionalMap, MainWindowPanels, ManageManualGamesMethod } from "./SARM";
import type { SGDBImage } from "./SGDB";

export enum SortMethods {
  ALPHABETICAL = 0,
  LAST_PLAYED = 1,
  PLAYTIME = 2
}

export enum ExperimentalSortMethods {
  PURCHASE_DATE = 3,
  RELEASE_DATE = 4,
  STEAM_REVIEW_SCORE = 5
}

export enum FilterMethods {
  NAME = 0,
  APP_ID = 1,
}

export enum ExperimentalFilterMethods {
  COLLECTIONS = 2,
  STORE_CATEGORIES = 3,
  STORE_TAGS = 4,
  STEAM_REVIEW_SCORE = 5,
  DECK_COMPAT_CATGEORY = 6,
  FRAME_COMPAT_CATGEORY = 7,
  MACHINE_COMPAT_CATGEORY = 8,
  STEAMOS_COMPAT_CATGEORY = 9,
  IS_FAMILY_SHARING = 10,
}

export type Settings = {
  version: string,
  useCEFInjection: boolean,
  
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
      sortBy: SortMethods | ExperimentalSortMethods,
      filterBy: FilterMethods | ExperimentalFilterMethods,
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