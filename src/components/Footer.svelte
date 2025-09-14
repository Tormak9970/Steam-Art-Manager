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
    <div style="margin-left: 0.5rem; text-align: center;">v{APP_VERSION}</div>
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
      <Info style="height: 0.75rem; width: 0.75rem;" />
    </IconButton>
    <IconButton label="View on GitHub" on:click={() => open("https://github.com/Tormak9970/Steam-Art-Manager")} tooltipPosition="auto">
      <GitHub style="height: 0.75rem; width: 0.75rem;" />
    </IconButton>
    <IconButton label="Reload SARM" on:click={AppController.reload}>
      <Refresh style="height: 0.75rem; width: 0.75rem;" />
    </IconButton>
    <IconButton label="Tools" on:click={() => $showToolsModal = true}>
      <Wrench style="height: 0.75rem; width: 0.75rem;" />
    </IconButton>
    <IconButton label="Settings" on:click={() => { $showSettingsModal = true; }}>
      <Cog style="height: 0.75rem; width: 0.75rem;" />
    </IconButton>
  </div>
</div>

<style>
  .footer {
    height: 2rem;
    width: 100%;

    background: var(--background);
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .info {
    display: flex;
    align-items: center;
    font-size: 0.75rem;
    opacity: 0.5;
  }
  .btns {
    display: flex;
    padding-right: 0.25rem;

    gap: 0.25rem;
  }
</style>
