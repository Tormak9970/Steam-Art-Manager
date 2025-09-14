<script lang="ts">
  import { Footer, Games, Grids, Modals, Options } from "@components";
  import { AppController, DialogController, LogController, SettingsController } from "@controllers";
  import { canSave, isOnline } from "@stores/AppState";
  import { showUpdateModal, updateManifest } from "@stores/Modals";
  import { Window } from "@tauri-apps/api/window";
  import { exit } from "@tauri-apps/plugin-process";
  import { check as checkUpdate } from "@tauri-apps/plugin-updater";
  import { onDestroy, onMount } from "svelte";
  import { Splitpanes, type IPaneSizingEvent } from "svelte-splitpanes";

  let windowCloseUnsub: () => void;

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
      await SettingsController.set("windowSettings.main.panels", {
        "options": event.detail[0].size,
        "games": event.detail[1].size,
        "grids": event.detail[2].size
      })
    }
  }
  
  /**
   * Function to run when the user attempts to close the main window.
   */
  async function onCloseListener(): Promise<void> {
    if ($canSave) {
      const shouldQuit = await DialogController.ask("Unsaved Changes!", "WARNING", "You have unsaved changes! Quitting will cause you to loose them", "Confirm", "Cancel");
      if (shouldQuit) {
        const success = await exit(0);
        LogController.log(`Program exited: ${success}`);
      }
    } else {
      const success = await exit(0);
      LogController.log(`Program exited: ${success}`);
    }
  }

	onMount(async () => {
    window.addEventListener("error", onError);
    
    // * This is actually async but isn't typed properly.
    Window.getByLabel("main")!.then((appWindow) => {
      appWindow!.onCloseRequested(async (event) => {
        event.preventDefault();
        await onCloseListener();
      }).then((listener) => windowCloseUnsub = listener);
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
    
    if (windowCloseUnsub) windowCloseUnsub();
	});
</script>

<main>
  <Modals />
	<div class="content">
		<Splitpanes dblClickSplitter={false} on:resized={handlePanelResize}>
			<Options />

      <Games />
      
      <Grids />
		</Splitpanes>
	</div>
	<Footer />
</main>

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

	.content {
		width: 100%;
		height: calc(100% - 2rem);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;

    position: relative;
    z-index: 1;
	}
</style>