import { DEFAULT_FILTERS } from "@models";
import { GridTypes, type GameStruct, type LibraryCacheEntry, type SGDBGame, type SteamLogoConfig, type SteamShortcut, type SteamUser } from "@types";
import { derived, writable, type Writable } from "svelte/store";

export type DBFilters = {
  [key in GridTypes]: {
    styles: Record<string, boolean>,
    dimensions?: Record<string, boolean>,
    mimes: Record<string, boolean>,
    types: Record<string, boolean>,
    oneoftag: Record<string, boolean>,
  }
}

export enum Platforms {
  STEAM="Steam",
  NON_STEAM="Non Steam"
}

export enum Theme {
  DARK,
  LIGHT
}

export const requestTimeoutLength = writable(5000);

// * Settings
export const theme = writable(Theme.DARK);
export const debugMode = writable(false);
export const renderGamesInList = writable(false);

export const optionsSize = writable(16);
export const gamesSize = writable(42);
export const gridsSize = writable(42);

export const selectedCleanGridsPreset = writable<"clean" | "custom">("clean");
export const selectedManualGamesAddMethod = writable<"manual" | "search">("search");


// * App State
export const loadingSettings = writable(true);
export const windowIsMaximized = writable(false);

export const needsSGDBAPIKey = writable(true);
export const steamGridDBKey = writable("");

export const needsSteamKey = writable(true);
export const steamKey = writable("");

export const steamInstallPath = writable("");

export const canSave = writable(false);
export const isOnline = writable(false);
export const loadingGames = writable(true);
export const currentPlatform: Writable<Platforms> = writable(Platforms.STEAM);
export const gridType: Writable<GridTypes> = writable(GridTypes.CAPSULE);

export const selectedGameAppId = writable<string>("");
export const dowloadingGridId = writable<string>("");
export const selectedSteamGridGameId = writable("None");

export const showHidden = writable(false);

export const steamUsers = writable<{ [id: string]: SteamUser }>({});
export const activeUserId = writable(0);


export const originalSteamShortcuts = writable<SteamShortcut[]>([]);
export const steamShortcuts = writable<SteamShortcut[]>([]);

export const steamGames = writable<GameStruct[]>([]);
export const nonSteamGames = writable<GameStruct[]>([]);
export const hiddenGameIds = writable<number[]>([]);
export const manualSteamGames = writable<GameStruct[]>([]);
export const customGameNames = writable<{ [appid: string]: string }>({});

export const unfilteredLibraryCache = writable<{ [appid: string]: LibraryCacheEntry }>({});
export const originalAppLibraryCache = writable<{ [appid: string]: LibraryCacheEntry }>({});
export const appLibraryCache = writable<{ [appid: string]: LibraryCacheEntry }>({});


export const steamGridSearchCache: Writable<{ [appid: string]: SGDBGame[] }> = writable({});
export const hasMorePagesCache = writable<{ [steamGridId: string]: { [key in GridTypes]?: boolean } }>({});

export const originalLogoPositions = writable<{ [appid: string]: SteamLogoConfig }>({});
export const steamLogoPositions = writable<{ [appid: string]: SteamLogoConfig }>({});


export const dbFilters: Writable<DBFilters> = writable(DEFAULT_FILTERS);

export const selectedGameName = derived(
  [selectedGameAppId, steamGames, nonSteamGames, manualSteamGames, customGameNames],
  ([$selectedGameAppId, $steamGames, $nonSteamGames, $manualSteamGames, $customGameNames]) => {
    if ($selectedGameAppId === "") return "None";

    if ($customGameNames[$selectedGameAppId]) return $customGameNames[$selectedGameAppId];

    const appId = parseInt($selectedGameAppId);

    const steamGame = $steamGames.find((game) => game.appid === appId);
    if (steamGame) return steamGame.name;

    const manualGame = $manualSteamGames.find((game) => game.appid === appId);
    if (manualGame) return manualGame.name;

    const nonSteam = $nonSteamGames.find((game) => game.appid === appId);
    if (nonSteam) return nonSteam.name;

    return "None";
  }
);