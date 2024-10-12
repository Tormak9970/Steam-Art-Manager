<script lang="ts">
  import { AppController } from "@controllers";
  import { Cog, GitHub, Info, Refresh, Wrench } from "@icons";
  import { Button, IconButton } from "@interactables";
  import { canSave, isOnline } from "@stores/AppState";
  import { showInfoModal, showSettingsModal, showToolsModal } from "@stores/Modals";
  import { open } from "@tauri-apps/plugin-shell";
</script>

<div class="footer">
  <div class="info">
    <!-- svelte-ignore missing-declaration -->
    <div style="margin-left: 8px; text-align: center;">v{APP_VERSION}</div>
  </div>
  <div class="btns">
    {#if $canSave}
      <Button highlight on:click={AppController.saveChanges}>Save</Button>
      <Button on:click={AppController.discardChanges}>Cancel</Button>
    {/if}
    {#if !$isOnline}
      <Button on:click={AppController.tryGoOnline}>Go Online</Button>
    {/if}
    
    <IconButton label="Info" on:click={() => $showInfoModal = true}>
      <Info height="1rem" style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="View on GitHub" on:click={() => open("https://github.com/Tormak9970/Steam-Art-Manager")} tooltipPosition="auto">
      <GitHub style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="Reload SARM" on:click={AppController.reload}>
      <Refresh style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="Tools" on:click={() => $showToolsModal = true}>
      <Wrench style="height: 12px; width: 12px;" />
    </IconButton>
    <IconButton label="Settings" on:click={() => { $showSettingsModal = true; }}>
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
