import { writable, type Writable } from "svelte/store";
import type { Game } from "./lib/models/Game";

export const needsAPIKey = writable(true);

export const isOnline = writable(false);
export const activeUserId = writable(0);
export const steamGridDBKey = writable("");
export const steamGames:Writable<Game[]> = writable([]);

export const dbFilters = writable({
  "": {

  },
});

export const showSetApiKeyToast = writable(false);
export const showConfirmEmptyCacheToast = writable(false);

export const canSave = writable(false);