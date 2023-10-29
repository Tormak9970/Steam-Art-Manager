import { writable, type Writable } from "svelte/store";
import type { SGDBGame, SGDBImage } from "../lib/models/SGDB";
import { DEFAULT_FILTERS } from "../lib/utils/Defaults";

export type DBFilters = {
  [key in GridTypes]: {
    styles: Record<string, boolean>,
    dimensions?: Record<string, boolean>,
    mimes: Record<string, boolean>,
    types: Record<string, boolean>,
    oneoftag: Record<string, boolean>,
  }
}

export enum GridTypes {
  CAPSULE="Capsule",
  WIDE_CAPSULE="Wide Capsule",
  HERO="Hero",
  LOGO="Logo",
  ICON="Icon"
}

export enum Platforms {
  STEAM="Steam",
  NON_STEAM="Non Steam"
}

export enum Theme {
  DARK,
  LIGHT
}

export const theme = writable(Theme.DARK);
export const renderGamesInList = writable(false);
export const optionsSize = writable(16);
export const gamesSize = writable(42);
export const gridsSize = writable(42);

export const requestTimeoutLength = writable(5000);

export const needsSGDBAPIKey = writable(true);
export const steamGridDBKey = writable("");

export const needsSteamKey = writable(true);
export const steamKey = writable("");

export const steamInstallPath = writable("");

export const selectedResultPage = writable(0);

export const canSave = writable(false);
export const isOnline = writable(false);
export const loadingGames = writable(true);
export const currentPlatform: Writable<Platforms> = writable(Platforms.STEAM);
export const gridType: Writable<GridTypes> = writable(GridTypes.CAPSULE);

export const selectedGameAppId: Writable<number> = writable(null);
export const selectedGameName: Writable<string> = writable(null);
export const dowloadingGridId: Writable<number> = writable(null);

export const showHidden = writable(false);

export const steamUsers: Writable<{ [id: string]: SteamUser }> = writable({});
export const activeUserId = writable(0);


export const originalSteamShortcuts: Writable<SteamShortcut[]> = writable([]);
export const steamShortcuts: Writable<SteamShortcut[]> = writable([]);

export const steamGames: Writable<GameStruct[]> = writable([]);
export const nonSteamGames: Writable<GameStruct[]> = writable([]);
export const hiddenGameIds: Writable<number[]> = writable([]);
export const manualSteamGames: Writable<GameStruct[]> = writable([]);
export const customGameNames: Writable<{ [appid: string]: string }> = writable({});

export const unfilteredLibraryCache: Writable<{ [appid: string]: LibraryCacheEntry }> = writable({});
export const originalAppLibraryCache: Writable<{ [appid: string]: LibraryCacheEntry }> = writable({});
export const appLibraryCache: Writable<{ [appid: string]: LibraryCacheEntry }> = writable({});


export const steamGridSteamAppIdMap: { [appid: number]: string } = {};
export const steamGridSearchCache:Writable<{ [appid: number]: SGDBGame[] }> = writable({});
export const steamGridNameSearchCache: { [query: string]: SGDBGame[] } = {};
export const gridsCache:{ [steamGridId: number]: SGDBImage[] } = {};
export const selectedSteamGridGameId = writable("None");

export const originalLogoPositions:Writable<{ [appid: string]: SteamLogoConfig }> = writable({});
export const steamLogoPositions:Writable<{ [appid: string]: SteamLogoConfig }> = writable({});


export const dbFilters:Writable<DBFilters> = writable(DEFAULT_FILTERS);