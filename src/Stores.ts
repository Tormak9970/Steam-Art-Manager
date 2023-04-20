import { writable, type Writable } from "svelte/store";
import type { SGDBGame, SGDBImage } from "./lib/models/SGDB";
import { sharedStore } from "./lib/utils/SharedStore";

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

export const theme = sharedStore(Theme.DARK, "theme");

export const needsSGDBAPIKey = sharedStore(true, "needsSGDBAPIKey");
export const needsSteamKey = sharedStore(true, "needsSteamKey");

export const steamGridDBKey = sharedStore("", "steamGridDBKey");
export const steamKey = sharedStore("", "steamKey");


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

export const originalAppLibraryCache: Writable<{ [appid: string]: LibraryCacheEntry }> = writable({});
export const appLibraryCache: Writable<{ [appid: string]: LibraryCacheEntry }> = writable({});


export const steamGridSteamAppIdMap: { [appid: number]: string } = {};
export const steamGridsCache:{ [appid: number]: SGDBImage[] } = {};
export const steamGridSearchCache:Writable<{ [appid: number]: SGDBGame[] }> = writable({});
export const nonSteamGridsCache:{ [steamGridId: number]: SGDBImage[] } = {};
export const selectedSteamGridGameId = writable("None");

export const dbFilters:Writable<DBFilters> = writable({
  "Capsule": {
    "styles": {
      "alternate": true,
      "blurred": true,
      "white_logo": true,
      "material": true,
      "no_logo": true,
    },
    "dimensions": {
      "600x900": true,
      "342x482": true,
      "660x930": true,
      "512x512": false,
      "1024x1024": false,
    },
    "mimes": {
      "image/png": true,
      "image/jpeg": true,
      "image/webp": true,
    },
    "types": {
      "static": true,
      "animated": true,
    },
    "oneoftag": {
      "humor": true,
      "nsfw": false,
      "epilepsy": false,
      "untagged": true,
    }
  },
  "Wide Capsule": {
    "styles": {
      "alternate": true,
      "blurred": true,
      "white_logo": true,
      "material": true,
      "no_logo": true,
    },
    "dimensions": {
      "460x215": true,
      "920x430": true,
      "512x512": false,
      "1024x1024": false,
    },
    "mimes": {
      "image/png": true,
      "image/jpeg": true,
      "image/webp": true,
    },
    "types": {
      "static": true,
      "animated": true,
    },
    "oneoftag": {
      "humor": true,
      "nsfw": false,
      "epilepsy": false,
      "untagged": true,
    }
  },
  "Hero": {
    "styles": {
      "alternate": true,
      "blurred": true,
      "material": true,
    },
    "dimensions": {
      "3840x1240": true,
      "1920x620": true,
      "1600x650": true,
    },
    "mimes": {
      "image/png": true,
      "image/jpeg": true,
      "image/webp": true,
    },
    "types": {
      "static": true,
      "animated": true,
    },
    "oneoftag": {
      "humor": true,
      "nsfw": false,
      "epilepsy": false,
      "untagged": true,
    }
  },
  "Logo": {
    "styles": {
      "official": true,
      "white": true,
      "black": true,
      "custom": true,
    },
    "mimes": {
      "image/png": true,
      "image/webp": true,
    },
    "types": {
      "static": true,
      "animated": true,
    },
    "oneoftag": {
      "humor": true,
      "nsfw": false,
      "epilepsy": false,
      "untagged": true,
    }
  },
  "Icon": {
    "styles": {
      "official": true,
      "custom": true,
    },
    "mimes": {
      "image/png": true,
      "image/webp": true,
      "image/vnd.microsoft.icon": true
    },
    "types": {
      "static": true,
      "animated": true,
    },
    "oneoftag": {
      "humor": true,
      "nsfw": false,
      "epilepsy": false,
      "untagged": true,
    }
  }
});
