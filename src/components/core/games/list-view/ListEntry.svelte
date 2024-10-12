<script lang="ts">
  import { AppController } from "@controllers";
  import { AllGrids, Ban, Hide, Recycle, Show, Tag } from "@icons";
  import { selectedGameAppId } from "@stores/AppState";
  import type { GameStruct } from "@types";
  import { IMAGE_FADE_OPTIONS, SMALL_GRID_DIMENSIONS } from "@utils";
  import Lazy from "svelte-lazy";

  export let game: GameStruct;
  export let iconPath: string;
  export let showIcon: boolean;

  export let isHidden: boolean;
  export let hasCustomName: boolean;
  export let hasCustomArt: boolean;
  export let canDiscard: boolean;

  export let selectGame: () => void;
  export let toggleHidden: (isHidden: boolean) => void;
  export let showAllGrids: (appId: number) => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="list-entry" class:selected={$selectedGameAppId === game.appid.toString()} on:click={selectGame}>
  <div class="entry-info">
    <div class="icon-container">
      {#if showIcon}
        <Lazy height="{SMALL_GRID_DIMENSIONS.heights.Icon}px" fadeOption={IMAGE_FADE_OPTIONS}>
          <img src="{iconPath}" alt="{game.name}'s icon image" style="max-width: {SMALL_GRID_DIMENSIONS.widths.Icon}px; max-height: {SMALL_GRID_DIMENSIONS.heights.Icon}px; width: auto; height: auto;" draggable="false" />
        </Lazy>
      {:else}
        <div style="text-align: center;">No icon image for game</div>
      {/if}
    </div>
    <div class="name" use:AppController.tippy={{ content: game.name, placement: "right", onShow: AppController.onTippyShow }}>{game.name}</div>
  </div>
  <div class="status">
    <div class="image-control" on:click|stopPropagation={() => showAllGrids(game.appid)} use:AppController.tippy={{ content: "View Grids", placement: "right", onShow: AppController.onTippyShow }}>
      <AllGrids />
    </div>
    <div class="image-control" on:click|stopPropagation={() => toggleHidden(!isHidden)} use:AppController.tippy={{ content: isHidden ? "Unhide" : "Hide", placement: "right", onShow: AppController.onTippyShow }}>
      {#if isHidden}
        <Show />
      {:else}
        <Hide />
      {/if}
    </div>
    {#if hasCustomName}
      <div class="image-control" on:click|stopPropagation={() => { AppController.clearCustomNameForGame(game.appid.toString()); }} use:AppController.tippy={{ content: "Clear Custom Name", placement: "right", onShow: AppController.onTippyShow }}>
        <Tag />
      </div>
    {/if}
    {#if hasCustomArt}
      <div class="image-control" on:click|stopPropagation={() => { AppController.clearCustomArtForGame(game.appid.toString()); }} use:AppController.tippy={{ content: "Clear Art", placement: "right", onShow: AppController.onTippyShow }}>
        <Ban />
      </div>
    {/if}
    {#if canDiscard}
      <div class="image-control" on:click|stopPropagation={() => { AppController.discardChangesForGame(game.appid.toString()); }} use:AppController.tippy={{ content: "Discard Changes", placement: "right", onShow: AppController.onTippyShow }}>
        <Recycle />
      </div>
    {/if}
  </div>
</div>

<style>
  .list-entry {
    background-color: var(--foreground);
    padding: 6px 10px;
    border-radius: 4px;

    font-size: 14px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    position: relative;
    
    cursor: pointer;

    user-select: none;

    transition: background-color 0.2s ease-in-out;

    margin-bottom: 7px;
    margin-right: 7px;

    width: 100%;
  }
  .list-entry:hover { background-color: var(--foreground-hover); }

  .selected { background-color: var(--foreground-light); }
  .selected:hover { background-color: var(--foreground-light-hover); }

  .entry-info {
    display: flex;
    align-items: center;
  }

  .icon-container {
    margin-right: 7px;
    border-radius: 4px;

    height: 32px;
    width: 32px;

    overflow: hidden;
  }

  .name {
    height: 23px;
    line-height: 23px;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    
    text-align: center;
  }

  .status {
    height: 28px;
    min-width: 5px;

    display: flex;
    align-items: center;
  }

  .image-control {
    border-radius: 50%;

    width: 14px;
    height: 14px;

    padding: 5px;

    fill: var(--font-color);

    background-color: var(--background);

    opacity: 0.8;

    display: none;

    z-index: 2;
    
    margin-right: 7px;
  }
  .image-control:hover {
    cursor: pointer;
    opacity: 1;
  }

  .list-entry:hover .image-control { display: flex; }
</style>