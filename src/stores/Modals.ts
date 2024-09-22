import type { Update } from "@tauri-apps/plugin-updater";
import type { CleanConflict, DialogModalType, SGDBGame, SGDBImage } from "@types";
import { writable } from "svelte/store";

export const showToolsModal = writable(false);

export const showGridModal = writable(false);
export const gridModalInfo = writable<SGDBImage | null>(null);

export const showLogoPositionModal = writable(false);

export const showBatchApplyModal = writable(false);

export const batchApplyWasCancelled = writable(false);
export const batchApplyProgress = writable(0);
export const batchApplyMessage = writable("Starting batch job...");
export const showBatchApplyProgress = writable(false);

export const showManualGamesModal = writable(false);

export const showCleanGridsModal = writable(false);

export const showSettingsModal = writable(false);

export const showCleanConflictDialog = writable(false);
export const cleanConflicts = writable<CleanConflict[]>([]);

export const showUpdateModal = writable(false);
export const updateManifest = writable<Update | null>(null);

export const showSteamPathModal = writable(false);
export const steamPathModalClose = writable(async () => {});

export const showGameSearchModal = writable(false);
export const gameSearchModalDefault = writable("");
export const gameSearchModalSelect = writable((game: SGDBGame) => {});
export const gameSearchModalCancel = writable(() => {});

export const showDialogModal = writable(false);
export const dialogModalTitle = writable("");
export const dialogModalMessage = writable("");
export const dialogModalType = writable<DialogModalType>("INFO");
export const dialogModalConfirmText = writable("");
export const dialogModalConfirm = writable(async () => {});
export const dialogModalCancelText = writable("");
export const dialogModalCancel = writable(async () => {});

export const showInfoModal = writable(false);

export const showCurrentGridsModal = writable(false);
export const currentGridsAppid = writable("");

export const showUpdateTilesModal = writable(false);