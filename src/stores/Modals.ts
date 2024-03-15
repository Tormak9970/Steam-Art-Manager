import { writable, type Writable } from "svelte/store";
import type { SGDBGame, SGDBImage } from "../lib/models/SGDB";
import type { UpdateManifest } from "@tauri-apps/api/updater";

export const showGridModal = writable(false);
export const gridModalInfo: Writable<SGDBImage> = writable(null);

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
export const cleanConflicts: Writable<CleanConflict[]> = writable([]);

export const showUpdateModal = writable(false);
export const updateManifest: Writable<UpdateManifest> = writable(null);

export const showSteamPathModal = writable(false);
export const steamPathModalClose = writable(async () => {});

export const showGameSearchModal = writable(false);
export const gameSearchModalDefault = writable("");
export const gameSearchModalSelect = writable((game: SGDBGame) => {});
export const gameSearchModalCancel = writable(() => {});

export const showDialogModal = writable(false);
export const dialogModalTitle = writable("");
export const dialogModalMessage = writable("");
export const dialogModalType: Writable<DialogModalType> = writable("INFO");
export const dialogModalConfirmText = writable("");
export const dialogModalConfirm = writable(async () => {});
export const dialogModalCancelText = writable("");
export const dialogModalCancel = writable(async () => {});

export const showInfoModal = writable(false);

export const showCurrentGridsModal = writable(false);
export const currentGridsAppid = writable(null);

export const showUpdateTilesModal = writable(false);