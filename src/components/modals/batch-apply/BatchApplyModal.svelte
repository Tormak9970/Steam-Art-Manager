<script lang="ts">
  import { GridTypes, gridType } from "../../../stores/AppState";
  import Button from "../../interactables/Button.svelte";
  import { AppController } from "../../../lib/controllers/AppController";
  import { ToastController } from "../../../lib/controllers/ToastController";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import GameFilter from "../modal-utils/game-filter/GameFilter.svelte";
  import { showBatchApplyModal, showBatchApplyProgress } from "../../../stores/Modals";

  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showBatchApplyModal = false;
  }

  let selectedGameIds: string[] = [];

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
    ToastController.showGenericToast("Cancelled Batch Apply.");
    onClose();
  }
</script>

<ModalBody title={`Batch Apply ${$gridType != GridTypes.HERO ? $gridType : `${$gridType}e`}s`} onClose={onClose}>
  <div class="content">
    <div class="info">
      Choose the games you would like to batch apply grids to.
    </div>
    <GameFilter bind:selectedGameIds={selectedGameIds} />
    <div class="buttons">
      <Button label="Apply" onClick={batchApply} width="47.5%" />
      <Button label="Cancel" onClick={cancel} width="47.5%" />
    </div>
  </div>
</ModalBody>

<style>
  .info {
    margin-top: 7px;
    margin-left: 7px;
    margin-right: 7px;
    font-size: 14px;
  }

  .buttons {
    margin-top: 14px;
    margin-bottom: 7px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
