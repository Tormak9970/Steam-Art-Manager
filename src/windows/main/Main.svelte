<script lang="ts">
	import { SvelteToast } from "@zerodevx/svelte-toast";
	import { onDestroy, onMount } from "svelte";
	import Titlebar from "../../components/Titlebar.svelte";
	import { Splitpanes } from 'svelte-splitpanes';
	import Footer from "../../components/Footer.svelte";
	import Options from "../../components/core/filters/Options.svelte";
	import Games from "../../components/core/games/Games.svelte";
	import Grids from "../../components/core/grids/Grids.svelte";
  import { AppController } from "../../lib/controllers/AppController";
  import { exit } from "@tauri-apps/api/process";
  import { activeUserId, batchApplyMessage, batchApplyProgress, batchApplyWasCancelled, gridModalInfo, isOnline, showBatchApplyModal, showBatchApplyProgress, showGridModal, showLogoPositionModal, steamUsers } from "../../Stores";
	import { WindowController } from "../../lib/controllers/WindowController";
	import DropDown from "../../components/interactables/DropDown.svelte";
	import type { Unsubscriber } from "svelte/store";
  import GridPreviewModal from "../../components/toast-modals/GridPreviewModal.svelte";
  import { LogController } from "../../lib/controllers/LogController";
    import LogoPositionModal from "../../components/toast-modals/LogoPositionModal.svelte";
    import BatchApplyModal from "../../components/toast-modals/batch-apply/BatchApplyModal.svelte";
    import BatchApplyProgressModal from "../../components/toast-modals/batch-apply/BatchApplyProgressModal.svelte";
	
	let mainFocusUnsub: any;
	let activeUserIdUnsub: Unsubscriber;
	let usersUnsub: Unsubscriber;

	let isFocused = true;

	let users = Object.values($steamUsers).map((user) => {
		return {
			"label": user.PersonaName,
			"data": user.id32
		}
	});
	let selectedUserId = $activeUserId.toString();

  /**
   * Function to run when the grid preview modal is closed.
   */
	function onGridModalClose() {
		$showGridModal = false;
		$gridModalInfo = null;
	}

  /**
   * Function to run when the batch apply modal is closed.
   */
	function onBatchApplyModalClose() {
		$showBatchApplyModal = false;
	}

  /**
   * Function to run when the batch apply progress modal is closed.
   */
  function onBatchApplyProgressClose() {
    $showBatchApplyProgress = false;
    $batchApplyProgress = 0;
    $batchApplyMessage = "Starting batch job...";
    $batchApplyWasCancelled = false;
  }

  /**
   * Function to run when the logo position modal is closed.
   */
	function onLogoPositionModalClose() {
		$showLogoPositionModal = false;
	}

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

	onMount(async () => {
    window.addEventListener("error", onError);

    WindowController.mainWindow.onFocusChanged(({ payload: focused }) => {
      isFocused = true; //focused;
    }).then((unsub) => {
			mainFocusUnsub = unsub;
		});
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

		if (mainFocusUnsub) mainFocusUnsub();
		if (activeUserIdUnsub) activeUserIdUnsub();
		if (usersUnsub) usersUnsub();
	});
</script>

<div class="wrap">
	<SvelteToast target="top" options={{ initial: 0, intro: { y: -64 } }} />
</div>
<main class:dim={!isFocused}>
	<Titlebar title="Steam Art Manager">
		<DropDown label="User" options={users} value={selectedUserId} onChange={AppController.changeSteamUser} width="80px" placement="right" />
  </Titlebar>
	<div class="content">
		<GridPreviewModal show={$showGridModal} onClose={onGridModalClose} />
    {#if $showBatchApplyProgress}
		  <BatchApplyProgressModal onClose={onBatchApplyProgressClose} />
    {/if}
    {#if $showBatchApplyModal}
		  <BatchApplyModal onClose={onBatchApplyModalClose} />
    {/if}
    {#if $showLogoPositionModal}
		  <LogoPositionModal onClose={onLogoPositionModalClose} />
    {/if}
		<Splitpanes>
			<Options />

			<Games />
			
			<Grids />
		</Splitpanes>
	</div>
	<Footer />
</main>
<SvelteToast />

<style>
	@import "/theme.css";

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

	.wrap {
		--toastContainerTop: 0.5rem;
		--toastContainerRight: 0.5rem;
		--toastContainerBottom: auto;
		--toastContainerLeft: calc(50vw - 13rem) !important;
		--toastBoxShadow: transparent 0px 0px 0px 0px;
		--toastWidth: 26rem !important;
		--toastMinHeight: 100px;
		--toastPadding: 0 0.5rem !important;
		font-size: 0.875rem;
	}
	@media (min-width: 40rem) {
		.wrap {
			--toastContainerRight: auto;
			--toastContainerLeft: calc(50vw - 20rem);
			--toastWidth: 40rem;
		}
	}

	.content {
		width: 100%;
		height: calc(100% - 60px);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}

	.dim {
		opacity: 0.8;
	}
</style>