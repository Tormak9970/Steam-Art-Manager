import { writable, type Writable } from "svelte/store";
import type { Game } from "./lib/models/Game";

export enum ArtTypes {
  GRIDS="Grids",
  HEROS="Heros",
  LOGOS="Logos",
  ICONS="Icons"
}

export const needsAPIKey = writable(true);
export const canSave = writable(false);
export const artType:Writable<ArtTypes> = writable(ArtTypes.GRIDS);

export const isOnline = writable(false);
export const activeUserId = writable(0);
export const steamGridDBKey = writable("");
export const steamGames:Writable<Game[]> = writable([]);

export const dbFilters = writable({
  "Grids": {
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
      "600x900": true,
      "342x482": true,
      "660x930": true,
      "512x512": true,
      "1024x1024": true,
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
  "Heros": {
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
  "Logos": {
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
  "Icons": {
    "styles": {
      "official": true,
      "custom": true,
    },
    "dimensions": {
      "8": true,
      "10": true,
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
  }
});
