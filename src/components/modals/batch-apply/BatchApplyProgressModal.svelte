<script lang="ts">
  import { batchApplyMessage, batchApplyProgress, batchApplyWasCancelled, showBatchApplyProgress } from "../../../stores/Modals";
  import ProgressBar from "../../info/ProgressBar.svelte";
  import Button from "../../interactables/Button.svelte";
  import ModalBody from "../modal-utils/ModalBody.svelte";

  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showBatchApplyProgress = false;
    $batchApplyProgress = 0;
    $batchApplyMessage = "Starting batch job...";
    $batchApplyWasCancelled = false;
  }

  /**
   * Batch applies grids to all games.
   */
  function closeAfterComplete(): void {
    onClose();
  }

  /**
   * Cancels batch applying grids.
   */
  function cancel(): void {
    $batchApplyWasCancelled = true;
  }

  /**
   * The function to run when the progress bar completes.
   */
  function onFinish(): void {
    $batchApplyMessage = "Batch apply complete."
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalBody title={"Batch Apply Progress"} onClose={onClose}>
  <div class="content">
    <div class="options">
      <ProgressBar bind:progress={$batchApplyProgress} width="100%" onFinish={onFinish} />
    </div>
    <div class="info">{$batchApplyMessage}</div>
    <div class="buttons">
      {#if $batchApplyProgress == 100}
        <Button label="Close" onClick={closeAfterComplete} width="100%" />
      {:else}
        <Button label="Cancel" onClick={cancel} width="100%" />
      {/if}
    </div>
  </div>
</ModalBody>

<style>
  .info {
    margin-top: 7px;
    margin-left: 7px;
    font-size: 12px;
  }

  .options {
    margin-top: 7px;
    margin-left: 7px;
    margin-right: 7px;
    width: calc(100% - 14px);
  }

  .buttons {
    margin-top: 14px;
    margin-bottom: 7px;
    margin-left: 7px;
    margin-right: 7px;
    width: calc(100% - 14px);
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
