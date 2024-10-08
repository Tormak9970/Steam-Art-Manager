<script lang="ts">
  import { Button } from "@interactables";
  import { ProgressBar } from "@layout";
  import { batchApplyMessage, batchApplyProgress, batchApplyWasCancelled, showBatchApplyProgress } from "@stores/Modals";
  import ModalBody from "../modal-utils/ModalBody.svelte";

  let open = true;

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

<ModalBody title={"Batch Apply Progress"} open={open} on:close={() => open = false} on:closeEnd={onClose}>
  <div class="content">
    <div class="options">
      <ProgressBar bind:progress={$batchApplyProgress} width="100%" onFinish={onFinish} />
    </div>
    <div class="info">{$batchApplyMessage}</div>
  </div>
  <span slot="buttons" class="buttons">
    {#if $batchApplyProgress === 100}
      <Button label="Close" on:click={closeAfterComplete} width="100%" />
    {:else}
      <Button label="Cancel" on:click={cancel} width="100%" />
    {/if}
  </span>
</ModalBody>

<style>
  .content {
    min-width: 18rem;
  }
  .info {
    margin-top: 7px;
    font-size: 12px;
  }

  .options {
    margin-top: 7px;
    width: 100%;
  }

  .buttons {
    width: 100%;
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
