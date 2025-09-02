import { DEFAULT_FILTERS } from "@models";
import { GridTypes, type GameStruct, type GridTypesMap, type GridTypesOptionalMap, type LibraryCacheEntry, type SGDBGame, type SteamShortcut, type SteamUser } from "@types";
import { derived, writable, type Writable } from "svelte/store";

export type DBFilter = {
  styles: Record<string, boolean>;
  dimensions?: Record<string, boolean>;
  mimes: Record<string, boolean>;
  types: Record<string, boolean>;
  oneoftag: Record<string, boolean>;
};

export type DBFilters = GridTypesMap<DBFilter>;

export enum Platforms {
  STEAM="Steam",
  NON_STEAM="Non Steam"
}

export enum Theme {
  DARK,
  LIGHT
}

export const showInfoSnackbar = writable<(data: ShowInfoOptions) => void>();
export const showErrorSnackbar = writable<(data: ShowInfoOptions) => void>();


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
export const customGameNames = writable<Record<string, string>>({});

export const cacheSelectedGrids = writable(false);
export const showCachedGrids = writable(false);

/**
 * The default library art provided by Steam.
 */
export const unfilteredLibraryCache = writable<Record<string, LibraryCacheEntry>>({});
/**
 * The user's library art including custom art.
 */
export const originalAppLibraryCache = writable<Record<string, LibraryCacheEntry>>({});
/**
 * The user's library art including custom art and changes made in this session.
 */
export const appLibraryCache = writable<Record<string, LibraryCacheEntry>>({});

export const steamGridSearchCache = writable<Record<string, SGDBGame[]>>({});
export const hasMorePagesCache = writable<Record<string, GridTypesOptionalMap<boolean>>>({});
export const userSelectedGrids = writable<Record<string, GridTypesOptionalMap<string[]>>>({});


export const dbFilters: Writable<DBFilters> = writable(DEFAULT_FILTERS);

export const selectedGameName = derived(
  [ selectedGameAppId, steamGames, nonSteamGames, manualSteamGames, customGameNames ],
  ([ $selectedGameAppId, $steamGames, $nonSteamGames, $manualSteamGames, $customGameNames ]) => {
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