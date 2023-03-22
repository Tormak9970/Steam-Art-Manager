import { writable } from "svelte/store";

export const filters = writable({
  "": {

  },
});

export const showSetApiKeyToast = writable(false);
export const showConfirmEmptyCacheToast = writable(false);

export const canSave = writable(false);