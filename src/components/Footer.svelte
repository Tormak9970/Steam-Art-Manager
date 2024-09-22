<script lang="ts">
  import { AppController, DialogController } from "@controllers";
  import { Clean, Cog, Export, GameTiles, GitHub, Import, Info, Plus, Refresh, Stack } from "@icons";
  import { Button, IconButton } from "@interactables";
  import { canSave, isOnline } from "@stores/AppState";
  import { showBatchApplyModal, showCleanGridsModal, showInfoModal, showManualGamesModal, showSettingsModal, showUpdateTilesModal } from "@stores/Modals";
  import { open } from "@tauri-apps/plugin-shell";

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
</script>

<div class="footer">
  <div class="info">
    <!-- svelte-ignore missing-declaration -->
    <div style="margin-left: 8px; text-align: center;">v{APP_VERSION}</div>
  </div>
  <div class="btns">
    {#if $canSave}
      <Button label="Save" onClick={AppController.saveChanges} highlight={true} width="auto" height="22px" />
      <Button label="Cancel" onClick={AppController.discardChanges} width="auto" height="22px" />
    {/if}
    {#if !$isOnline}
      <Button label="Go Online" onClick={AppController.tryGoOnline} width="auto" height="22px" />
    {/if}
    
    <IconButton label="Info" onClick={() => $showInfoModal = true} width="auto" tooltipPosition="auto">
      <Info height="1rem" style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="View on GitHub" onClick={() => open("https://github.com/Tormak9970/Steam-Art-Manager")} width="auto" tooltipPosition="auto">
      <GitHub style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="Reload SARM" onClick={AppController.reload} width="auto" tooltipPosition="auto">
      <Refresh style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="Update Game Tiles" onClick={() => { $showUpdateTilesModal = true; }} width="auto" tooltipPosition="auto">
      <GameTiles style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="Clean Grids" onClick={onCleanGridsClick} width="auto" tooltipPosition="auto">
      <Clean style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="Manage Manual Games" onClick={() => { $showManualGamesModal = true; }} width="auto" tooltipPosition="auto">
      <Plus style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="Batch Apply" onClick={() => { $showBatchApplyModal = true; }} width="auto" tooltipPosition="auto">
      <Stack style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="Import" onClick={AppController.importGrids} width="auto" tooltipPosition="auto">
      <Import style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="Export" onClick={AppController.exportGrids} width="auto" tooltipPosition="auto">
      <Export style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="Settings" onClick={() => { $showSettingsModal = true; }} width="auto">
      <Cog style="height: 12px; width: 12px;" />
    </IconButton>
  </div>
</div>

<style>
  .footer {
    height: 30px;
    width: 100%;

    background: var(--background);
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
  }
  .info {
    display: flex;
    align-items: center;
    font-size: 12px;
    opacity: 0.5;
  }
  .btns {
    height: 22px;
    display: flex;
    padding-right: 7px;

    gap: 7px;
  }
</style>
