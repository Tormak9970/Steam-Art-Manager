<script lang="ts">
  import { batchApplyMessage, batchApplyProgress, batchApplyWasCancelled } from "../../../Stores";
  import ProgressBar from "../../info/ProgressBar.svelte";
  import Button from "../../interactables/Button.svelte";

  export let onClose: () => void;

  /**
   * Batch applies grids to all games.
   */
  function closeAfterComplete() {
    onClose();
  }

  /**
   * Cancels batch applying grids.
   */
  function cancel() {
    $batchApplyWasCancelled = true;
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="background" on:click={onClose}>
  <div class="modal-body" on:click|stopPropagation>
    <div class="header">Batch Apply Progress</div>
    <div class="border" />
    <div class="content">
      <div class="options">
        <ProgressBar bind:progress={$batchApplyProgress} width="100%" />
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
  </div>
</div>

<style>
  @import "/theme.css";

  .background {
    font-size: 12px;
    z-index: 3;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.6);
    width: 100%;
    height: calc(100% - 30px);
    display: flex;
  }

  .border {
    margin-top: 7px;
    border-bottom: 1px solid var(--foreground);
  }

  .modal-body {
    margin: auto;
    background-color: var(--background);
    border-radius: 2px;
    border: 1px solid var(--shadow);
    position: relative;

    width: 300px;
  }

  .header {
    text-align: center;
    font-size: 20px;
    margin-top: 4px;
  }

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
