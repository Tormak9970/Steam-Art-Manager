<script lang="ts">
  import { AppController, LogController } from "@controllers";
  import { DropDown } from "@interactables";
  import { activeUserId, isOnline, steamUsers, windowIsMaximized } from "@stores/AppState";
  import { showBatchApplyModal, showBatchApplyProgress, showCleanConflictDialog, showCleanGridsModal, showCurrentGridsModal, showDialogModal, showGameSearchModal, showGridModal, showInfoModal, showLogoPositionModal, showManualGamesModal, showSteamPathModal, showUpdateModal, updateManifest } from "@stores/Modals";
  import { exit } from "@tauri-apps/plugin-process";
  import { check as checkUpdate } from "@tauri-apps/plugin-updater";
  import { SettingsManager } from "@utils";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { onDestroy, onMount } from "svelte";
  import { Splitpanes, type IPaneSizingEvent } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import Footer from "../../components/Footer.svelte";
  import Titlebar from "../../components/Titlebar.svelte";
  import Options from "../../components/core/filters/Options.svelte";
  import Games from "../../components/core/games/Games.svelte";
  import Grids from "../../components/core/grids/Grids.svelte";
  import Modals from "../../components/modals/Modals.svelte";
	
	let activeUserIdUnsub: Unsubscriber;
	let usersUnsub: Unsubscriber;

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

  /**
   * Handles panel resize events.
   * @param event The resize event.
   */
  async function handlePanelResize(event: CustomEvent<IPaneSizingEvent[]>) {
    if (event.detail) {
      await SettingsManager.updateSetting("windowSettings.main.panels", {
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

		let i = 0;

		while(!$isOnline && i < 4) {
			if (navigator.onLine) $isOnline = true;
		}

    try {
      const update = await checkUpdate();

      if (update && update.available) {
        $updateManifest = update;
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

		if (activeUserIdUnsub) activeUserIdUnsub();
		if (usersUnsub) usersUnsub();
	});
</script>

<main class:rounded={!$windowIsMaximized}>
	<Titlebar title="Steam Art Manager" bind:isMaxed={$windowIsMaximized}>
		<DropDown
      label="User"
      options={(users && users.length > 0) ? users : [ { label: "Loading...", data: "placeholder" } ]}
      value={(users && users.length > 0) ? selectedUserId : "placeholder"}
      onChange={AppController.changeSteamUser}
      width="100px"
      tooltipPosition="bottom"
      entryTooltipPosition="right"
      disabled={$showDialogModal || $showSteamPathModal || $showGameSearchModal || $showGridModal || $showBatchApplyProgress || $showBatchApplyModal || $showLogoPositionModal || $showManualGamesModal || $showCleanGridsModal || $showCleanConflictDialog || $showUpdateModal || $showInfoModal || $showCurrentGridsModal}
    />
  </Titlebar>
	<div class="content">
    <Modals />
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

  .rounded {
    border-radius: 4px;
    overflow: hidden;
    background-color: transparent;
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
		height: calc(100% - 62px);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;

    position: relative;
    z-index: 1;
	}
</style>