<script lang="ts">
  import { CacheController } from "@controllers";
  import { Button, Toggle } from "@interactables";
  import { gridType, manualSteamGames, nonSteamGames, showInfoSnackbar, steamGames } from "@stores/AppState";
  import { showBatchApplyModal, showBatchApplyProgress } from "@stores/Modals";
  import { GridTypes } from "@types";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import GameFilter from "../modal-utils/game-filter/GameFilter.svelte";

  $: allSteamGames = [ ...$steamGames, ...$manualSteamGames ];

  let allGridTypes = false;

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
    CacheController.batchApplyGrids(selectedGameIds, allGridTypes);
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
    <div class="upper">
      <div class="info">
        Choose the games you would like to batch apply grids to.
      </div>
      <div class="toggle-container">
        <Toggle label="All Grid Types" bind:value={allGridTypes} />
      </div>
    </div>
    <GameFilter steamGames={allSteamGames} nonSteamGames={$nonSteamGames} bind:selectedGameIds={selectedGameIds} />
  </div>
  <span slot="buttons" class="buttons">
    <Button on:click={cancel} width="47.5%">Cancel</Button>
    <Button on:click={batchApply} width="47.5%">Apply</Button>
  </span>
</ModalBody>

<style>
  .content {
    min-width: 40rem;
  }

  .upper {
    margin-top: 0.5rem;
    width: 100%;

    display: flex;

    align-items: center;
    justify-content: space-between;
  }

  .toggle-container {
    margin-right: 0.25rem;
  }
  .info {
    font-size: 0.875rem;
    line-height: 0.875rem;

    text-align: center;
    vertical-align: center;
  }

  .buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }
</style>
