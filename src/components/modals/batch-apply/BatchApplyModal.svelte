<script lang="ts">
  import { AppController } from "@controllers";
  import { Button } from "@interactables";
  import { gridType, manualSteamGames, nonSteamGames, showInfoSnackbar, steamGames } from "@stores/AppState";
  import { showBatchApplyModal, showBatchApplyProgress } from "@stores/Modals";
  import { GridTypes } from "@types";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import GameFilter from "../modal-utils/game-filter/GameFilter.svelte";

  $: allSteamGames = [ ...$steamGames, ...$manualSteamGames ];

  let open = true;
  let selectedGameIds: string[] = [];

  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showBatchApplyModal = false;
  }

  /**
   * Batch applies grids to all games.
   */
  function batchApply(): void {
    AppController.batchApplyGrids(selectedGameIds);
    $showBatchApplyProgress = true;
    onClose();
  }

  /**
   * Cancels batch applying grids.
   */
  function cancel(): void {
    $showInfoSnackbar({ message: "Cancelled Batch Apply." });
    onClose();
  }
</script>

<ModalBody title={`Batch Apply ${$gridType !== GridTypes.HERO ? $gridType : `${$gridType}e`}s`} open={open} on:close={() => open = false} on:closeEnd={onClose}>
  <div class="content">
    <div class="info">
      Choose the games you would like to batch apply grids to.
    </div>
    <GameFilter steamGames={allSteamGames} nonSteamGames={$nonSteamGames} bind:selectedGameIds={selectedGameIds} />
  </div>
  <span slot="buttons" class="buttons">
    <Button on:click={cancel} width="47.5%">Cancel</Button>
    <Button on:click={batchApply} width="47.5%">Apply</Button>
  </span>
</ModalBody>

<style>
  .info {
    margin-top: 7px;
    font-size: 14px;
  }

  .buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }
</style>
