<script lang="ts">
  import { AppController } from "@controllers";
  import { Edit, Expand, Film, Share } from "@icons";
  import { LoadingSpinner } from "@layout";
  import { dowloadingGridId, gridType } from "@stores/AppState";
  import { open } from "@tauri-apps/plugin-shell";
  import type { SGDBImage } from "@types";
  import { throttle } from "@utils";
  import GridImage from "../GridImage.svelte";

  export let grid: SGDBImage;

  let imagePath = grid.thumb.toString();
  const onSelect = throttle(() => { AppController.setSteamGridArt(grid); }, 500, true);

  /**
   * Sets this grid to be the current grid for the selected game.
   */
  function selectGame(): void {
    onSelect();
  }

  /**
   * Opens the SteamGridDB page for this grid.
   */
  function viewOnSteamGridDB() {
    open(`https://www.steamgriddb.com/grid/${grid.id}`);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="grid" on:click={selectGame}>
  <div class="loading-overlay" class:selected={$dowloadingGridId === grid.id.toString()}>
    <LoadingSpinner width="40px" height="40px" />
  </div>
  <div class="button-container">
    <div class="image-control" on:click|stopPropagation={() => { AppController.viewSteamGridImage(grid); }} use:AppController.tippy={{ content: "View Grid", placement: "right", onShow: AppController.onTippyShow }}>
      <Expand />
    </div>
    <div class="image-control" on:click|stopPropagation={viewOnSteamGridDB} use:AppController.tippy={{ content: "View on SGDB", placement: "right", onShow: AppController.onTippyShow }}>
      <Share />
    </div>
    {#if grid?.notes}
      <div class="image-control non-interactable" use:AppController.tippy={{ content: "Notes", placement: "right", onShow: AppController.onTippyShow }}>
        <Edit />
      </div>
    {/if}
    {#if grid?.isAnimated}
      <div class="image-control non-interactable" use:AppController.tippy={{ content: "Animated", placement: "right", onShow: AppController.onTippyShow }}>
        <Film />
      </div>
    {/if}
  </div>
  <GridImage imagePath={imagePath} altText="{grid.author.name}'s {$gridType} image" missingMessage="Failed to load" isVideo={grid.isAnimated} />
  <div class="author">By {grid.author.name}</div>
</div>

<style>
  .grid {
    background-color: var(--foreground);
    padding: 10px;
    padding-bottom: 5px;
    border-radius: 4px;

    font-size: 14px;

    display: flex;
    flex-direction: column;
    align-items: center;

    position: relative;
    
    cursor: pointer;

    user-select: none;

    transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out;
  }
  .grid:hover {
    background-color: var(--foreground-hover);
  }

  .author {
    width: 100%;
    height: 23px;
    line-height: 23px;

    font-size: 12px;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    
    text-align: center;
  }

  .loading-overlay {
    display: none;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    border-radius: 4px;

    background-color: rgba(0, 0, 0, 0.7);

    justify-content: center;
    align-items: center;
  }

  .selected {
    display: flex;
  }

  .button-container {
    position: absolute;

    top: 2px;
    left: 2px;
    
    width: 14px;

    z-index: 2;

    flex-direction: column;
    gap: 5px;

    display: none;
  }

  .image-control {
    border-radius: 50%;

    width: 14px;
    height: 14px;

    padding: 5px;

    fill: var(--font-color);

    background-color: var(--background);

    opacity: 0.8;
  }
  .image-control:hover {
    cursor: pointer;
    opacity: 1;
  }

  .grid:hover > .button-container { display: flex; }

  .non-interactable,
  .non-interactable:hover {
    cursor: default; opacity: 0.8;
  }
</style>