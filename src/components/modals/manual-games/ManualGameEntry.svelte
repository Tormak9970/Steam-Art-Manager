<script lang="ts">
  import { AppController } from "@controllers";
  import { CheckOutlined, CloseOutlined } from "@icons";
  import { appLibraryCache, unfilteredLibraryCache } from "@stores/AppState";
  import type { GameStruct } from "@types";

  export let game: GameStruct;
  export let onRemove: (game: GameStruct) => void;

  $: hasSteamArt = !!$unfilteredLibraryCache[game.appid];
  $: steamArtMsg = hasSteamArt ? "Existing official art" : "No official art";
  $: hasCustomArt = $appLibraryCache[game.appid] != $unfilteredLibraryCache[game.appid];
  $: customArtMsg = hasCustomArt ? "Existing custom art" : "No custom art";
</script>

<div class="selected-game-entry">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="remove-cont" on:click={() => { onRemove(game); }} use:AppController.tippy={{ content: "Remove this game", placement: "left", onShow: AppController.onTippyShow }}>
    <CloseOutlined style="width: 12px; height: 12px;" />
  </div>
  <div class="name">{game.name}</div>
  <div class="steam-art" use:AppController.tippy={{ content: steamArtMsg, placement: "left", onShow: AppController.onTippyShow }}>
    {#if hasSteamArt}
      <CheckOutlined style="width: 12px; height: 12px; fill: var(--success);" />
    {:else}
      <CloseOutlined style="width: 12px; height: 12px; fill: var(--font-color);" />
    {/if}
  </div>
  <div class="custom-art" use:AppController.tippy={{ content: customArtMsg, placement: "left", onShow: AppController.onTippyShow }}>
    {#if hasCustomArt}
      <CheckOutlined style="width: 12px; height: 12px; fill: var(--success);" />
    {:else}
      <CloseOutlined style="width: 12px; height: 12px; fill: var(--font-color);" />
    {/if}
  </div>
</div>

<style>
  .selected-game-entry {
    width: calc(100% - 20px);
    height: 20px;
    
    padding: 3px 7px;

    display: flex;
    align-items: center;

    background-color: var(--foreground);
    border-radius: 0.25rem;
  }

  .remove-cont {
    margin-left: 2px;
    margin-right: 0.25rem;
    width: auto;
    height: 100%;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    fill: var(--warning);
  }

  .remove-cont:hover {
    cursor: pointer;
    fill: var(--warning-hover);
  }

  .name {
    font-size: 12px;
    user-select: none;

    width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    margin-left: 10px;
  }

  .steam-art {
    margin-left: 87px;
    margin-right: 7px;
    
    font-size: 12px;
    user-select: none;

    width: auto;
    height: 100%;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;
  }

  .custom-art {
    margin-left: 27px;
    margin-right: 7px;
    
    font-size: 12px;
    user-select: none;

    width: auto;
    height: 100%;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;
  }
</style>