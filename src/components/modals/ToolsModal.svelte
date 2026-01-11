<script lang="ts">
  import { AppController, DialogController } from "@controllers";
  import { Clean, Export, GameTiles, Import, Plus, Stack } from "@icons";
  import { IconButton } from "@interactables";
  import { canSave } from "@stores/AppState";
  import { showBatchApplyModal, showCleanGridsModal, showManualGamesModal, showToolsModal, showUpdateTilesModal } from "@stores/Modals";
  import ModalBody from "./modal-utils/ModalBody.svelte";

  let open = true;

  type Tool = {
    name: string;
    icon: any;
    onClick: () => Promise<void> | void;
  }

  
  /**
   * Wrapper function for handling when the Clean Grids action is selected.
   */
  async function onCleanGridsClick(): Promise<void> {
    if ($canSave) {
      const shouldSaveAndOpen = await DialogController.ask("Found in Progress Changes", "WARNING", "You need to save your changes before cleaning. Would you like to save?", "Yes", "No");

      if (shouldSaveAndOpen) {
        await AppController.saveChanges();
        $showCleanGridsModal = true;
      }
    } else {
      $showCleanGridsModal = true;
    }
  }

  const toolsList: Tool[] = [
    {
      name: "Export",
      icon: Export,
      onClick: AppController.exportGrids
    },
    {
      name: "Import",
      icon: Import,
      onClick: AppController.importGrids
    },
    {
      name: "Batch Apply",
      icon: Stack,
      onClick: () => { $showBatchApplyModal = true; }
    },
    {
      name: "Manage Manual Games",
      icon: Plus,
      onClick: () => { $showManualGamesModal = true; }
    },
    {
      name: "Clean Grids",
      icon: Clean,
      onClick: onCleanGridsClick
    },
    {
      name: "Update Game Tiles",
      icon: GameTiles,
      onClick: () => { $showUpdateTilesModal = true; }
    },
  ];

  /**
   * The function to run when the modal closes.
   */
  function onClose() {
    $showToolsModal = false;
  }
</script>

<ModalBody title={"Tools"} open={open} on:close={() => open = false} on:closeEnd={onClose}>
  <div class="content">
    {#each toolsList as tool}
      <IconButton label={tool.name} on:click={tool.onClick} height="auto" width="auto" tooltipPosition="bottom">
        <svelte:component this={tool.icon} style="height: 10.5rem; width: 10.5rem; padding: 20.5rem;" />
      </IconButton>
    {/each}
  </div>
</ModalBody>

<style>
  .content {
		width: 400px;

		display: grid;
    gap: 14px;
		grid-template-columns: repeat(4, 1fr);
    grid-auto-flow: row;


    padding-top: 14px;
	}
</style>
