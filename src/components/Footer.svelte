<script lang="ts">
  import { AppController } from "../lib/controllers/AppController";
  import { canSave, showConfirmEmptyCacheToast, showSetApiKeyToast } from "../Stores";
  import Button from "./interactables/Button.svelte";
  
  /**
   * Empties the cache.
   */
  function emptyCache() { $showConfirmEmptyCacheToast = true; }

  /**
   * Opens a toast prompting the user to set their steamGridDB api key.
   */
  function addSteamGridKey() { $showSetApiKeyToast = true; }
</script>

<div class="footer">
  <div class="info">
    <div style="margin-left: 8px; text-align: center;">© Travis Lane {new Date().getFullYear()}</div>
  </div>
  <div class="btns">
    {#if $canSave}
      <Button label="Save" onClick={AppController.saveChanges} highlight={true} width="auto" height="20px" />
      <div style="height: 100%; width: 7px;" />
      <Button label="Cancel" onClick={AppController.discardChanges} width="auto" height="20px" />
      <div style="height: 100%; width: 7px;" />
    {/if}
    <Button label="Empty Cache" onClick={emptyCache} width="auto" height="20px" />
    <div style="height: 100%; width: 7px;" />
    <Button label="Import" onClick={AppController.importGrids} width="auto" height="20px" />
    <div style="height: 100%; width: 7px;" />
    <Button label="Export" onClick={AppController.exportGrids} width="auto" height="20px" />
    <div style="height: 100%; width: 7px;" />
    <Button label="Add SteamGrid Key" onClick={addSteamGridKey} width="auto" height="20px" />
  </div>
</div>

<style>
  @import "/theme.css";

  .footer {
    height: 30px;
    width: 100%;

    background: var(--hover);
    user-select: none;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
  }
  .info {
    display: flex;
    align-items: center;
    font-size: 10px;
    opacity: 0.2;
    margin-bottom: 3px;
  }
  .btns {
    height: 22px;
    display: flex;
    padding-right: 7px;
  }
</style>
