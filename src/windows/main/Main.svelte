<script lang="ts">
  import { checkUpdate } from "@tauri-apps/api/updater";
	import { SvelteToast } from "@zerodevx/svelte-toast";
	import { onDestroy, onMount } from "svelte";
	import Titlebar from "../../components/Titlebar.svelte";
	import { Splitpanes, type IPaneSizingEvent } from "svelte-splitpanes";
	import Footer from "../../components/Footer.svelte";
	import Options from "../../components/core/filters/Options.svelte";
	import Games from "../../components/core/games/Games.svelte";
	import Grids from "../../components/core/grids/Grids.svelte";
  import { AppController } from "../../lib/controllers/AppController";
  import { exit } from "@tauri-apps/api/process";
  import { activeUserId, dbFilters, isOnline, showHidden, steamUsers } from "../../stores/AppState";
  import { showManualGamesModal, showBatchApplyModal, showBatchApplyProgress, showGridModal, showLogoPositionModal, showSettingsModal, showCleanGridsModal, showCleanConflictDialog, showUpdateModal, updateManifest, showDialogModal, showSteamPathModal, showGameSearchModal } from "../../stores/Modals";
	import DropDown from "../../components/interactables/DropDown.svelte";
	import type { Unsubscriber } from "svelte/store";
  import GridPreviewModal from "../../components/modals/GridPreviewModal.svelte";
  import { LogController } from "../../lib/controllers/LogController";
  import LogoPositionModal from "../../components/modals/LogoPositionModal.svelte";
  import BatchApplyModal from "../../components/modals/batch-apply/BatchApplyModal.svelte";
  import BatchApplyProgressModal from "../../components/modals/batch-apply/BatchApplyProgressModal.svelte";
  import ManualGamesModal from "../../components/modals/manual-games/ManualGamesModal.svelte";
  import SettingsModal from "../../components/modals/settings/SettingsModal.svelte";
  import CleanGridsModal from "../../components/modals/clean-grids/CleanGridsModal.svelte";
  import CleanConflictDialog from "../../components/modals/clean-grids/CleanConflictDialog.svelte";
  import UpdateModal from "../../components/modals/updates/UpdateModal.svelte";
  import DialogModal from "../../components/modals/DialogModal.svelte";
  import SteamPathModal from "../../components/modals/SteamPathModal.svelte";
  import GameSearchModal from "../../components/modals/game-search/GameSearchModal.svelte";
  import { SettingsManager } from "../../lib/utils/SettingsManager";
	
  let updateUnsub: any;
	let activeUserIdUnsub: Unsubscriber;
	let usersUnsub: Unsubscriber;
  let showHiddenUnsub: Unsubscriber;
  let dbFiltersUnsub: Unsubscriber;

	let users = Object.values($steamUsers).map((user) => {
		return {
			"label": user.PersonaName,
			"data": user.id32
		}
	});
	let selectedUserId = $activeUserId.toString();

  /**
   * Handler for all main window errors.
   * @param e The error event.
   */
  function onError(e: ErrorEvent): void {
    const message = e.message;
    const fileName = e.filename;
    const columnNumber = e.colno;
    const lineNumber = e.lineno;

    LogController.error(`MainWindow: ${message} in ${fileName} at ${lineNumber}:${columnNumber}.`);
  }

  async function handlePanelResize(event: CustomEvent<IPaneSizingEvent[]>) {
    console.log("Resize event:", event);
    if (event.detail) {
      await SettingsManager.updateSetting("panels", {
        "options": event.detail[0].size,
        "games": event.detail[1].size,
        "grids": event.detail[2].size
      })
    }
  }

	onMount(async () => {
    window.addEventListener("error", onError);

		activeUserIdUnsub = activeUserId.subscribe((id) => {
			selectedUserId = id.toString();
		});
		usersUnsub = steamUsers.subscribe((sUsers) => {
			users = Object.values(sUsers).map((user) => {
				return {
					"label": user.PersonaName,
					"data": user.id32
				}
			});
			if (!selectedUserId) selectedUserId = $activeUserId.toString();
		});
    showHiddenUnsub = showHidden.subscribe((show) => {
      SettingsManager.updateSetting("showHiddenGames", show);
    });
    dbFiltersUnsub = dbFilters.subscribe((filters) => {
      SettingsManager.updateSetting("filters", filters);
    });

		let i = 0;

		while(!$isOnline && i < 4) {
			if (navigator.onLine) $isOnline = true;
		}

    try {
      const { shouldUpdate, manifest } = await checkUpdate();

      if (shouldUpdate) {
        $updateManifest = manifest;
        $showUpdateModal = true;
      }
    } catch (error) {
      console.error(error);
    }

		await AppController.setup();

    if (!$isOnline) {
      const wantsToContinue = await AppController.promptOffline();
      if (!wantsToContinue) exit(0);
    }

    AppController.init();
	});

	onDestroy(async () => {
    window.removeEventListener("error", onError);
		await AppController.destroy();

    if (updateUnsub) updateUnsub()
		if (activeUserIdUnsub) activeUserIdUnsub();
		if (usersUnsub) usersUnsub();
    if (showHiddenUnsub) showHiddenUnsub();
    if (dbFiltersUnsub) dbFiltersUnsub();
	});
</script>

<main>
	<Titlebar title="Steam Art Manager">
		<DropDown
      label="User"
      options={users}
      value={selectedUserId}
      onChange={AppController.changeSteamUser}
      width="100px"
      tooltipPosition="bottom"
      entryTooltipPosition="right"
      disabled={$showDialogModal || $showSteamPathModal || $showGameSearchModal || $showGridModal || $showBatchApplyProgress || $showBatchApplyModal || $showLogoPositionModal || $showManualGamesModal || $showCleanGridsModal || $showCleanConflictDialog || $showUpdateModal}
    />
  </Titlebar>
	<div class="content">
    {#if $showDialogModal}
      <DialogModal />
    {/if}
    {#if $showSteamPathModal}
      <SteamPathModal />
    {/if}
    {#if $showGameSearchModal}
      <GameSearchModal />
    {/if}
    {#if $showGridModal}
      <GridPreviewModal />
    {/if}
    {#if $showBatchApplyProgress}
      <BatchApplyProgressModal />
    {/if}
    {#if $showBatchApplyModal}
      <BatchApplyModal />
    {/if}
    {#if $showLogoPositionModal}
      <LogoPositionModal />
    {/if}
    {#if $showManualGamesModal}
      <ManualGamesModal />
    {/if}
    {#if $showCleanGridsModal}
      <CleanGridsModal />
    {/if}
    {#if $showSettingsModal}
      <SettingsModal />
    {/if}
    {#if $showCleanConflictDialog}
      <CleanConflictDialog />
    {/if}
    {#if $showUpdateModal}
      <UpdateModal />
    {/if}
		<Splitpanes dblClickSplitter={false} on:resized={handlePanelResize}>
			<Options />

			<Games />
			
			<Grids />
		</Splitpanes>
	</div>
	<Footer />
</main>
<div class="core-toast">
  <SvelteToast />
</div>

<style>
	main {
		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;

		color: var(--font-color);

		transition: opacity 0.1s ease-in-out;
	}

  .core-toast {
    font-size: 14px;
    --toastBorderRadius: 2px;
    --toastBarHeight: 3px;
    --toastWidth: 13rem;
    --toastMinHeight: 3rem;
  }

	.content {
		width: 100%;
		height: calc(100% - 60px);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}
</style>