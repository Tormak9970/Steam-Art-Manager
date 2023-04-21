<script lang="ts">
  import Lazy from "svelte-lazy";
  import { AppController } from "../../../lib/controllers/AppController";
  
  import type { SGDBImage } from "../../../lib/models/SGDB";

  import { dowloadingGridId, gridType } from "../../../Stores";
  import LoadingSpinner from "../../info/LoadingSpinner.svelte";

  export let grid: SGDBImage;
  export let widths: any;
  export let heights: any;

  function selectGame() {
    AppController.setSteamGridArt(grid.id, grid.url);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="grid" on:click={selectGame}>
  <div class="loading-overlay" class:selected={$dowloadingGridId == grid.id}>
    <LoadingSpinner width="40px" height="40px" />
  </div>
  <div class="image-control show-view" on:click={() => { AppController.viewSteamGridImage(grid); }} use:AppController.tippy={{ content: "View Grid", placement: "right", onShow: AppController.onTippyShow}}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
      <path d="M344 0H488c13.3 0 24 10.7 24 24V168c0 9.7-5.8 18.5-14.8 22.2s-19.3 1.7-26.2-5.2l-39-39-87 87c-9.4 9.4-24.6 9.4-33.9 0l-32-32c-9.4-9.4-9.4-24.6 0-33.9l87-87L327 41c-6.9-6.9-8.9-17.2-5.2-26.2S334.3 0 344 0zM168 512H24c-13.3 0-24-10.7-24-24V344c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2l39 39 87-87c9.4-9.4 24.6-9.4 33.9 0l32 32c9.4 9.4 9.4 24.6 0 33.9l-87 87 39 39c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8z"/>
    </svg>
  </div>
  <div class="img" style="height: {heights[$gridType]}px;">
    <Lazy height="{heights[$gridType]}px" fadeOption={{delay: 500, duration: 1000}}>
      <img src="{grid.url.toString()}" alt="{grid.author}'s {$gridType} image" style="max-width: {widths[$gridType]}px; max-height: {heights[$gridType]}px; width: auto; height: auto;" />
    </Lazy>
  </div>
  <div class="author">By {grid.author.name}</div>
</div>

<style>
  @import "/theme.css";

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

    transition: transform 0.2s ease-in-out, background-color 0.15s ease-in-out;
  }
  .grid:hover {
    background-color: var(--foreground-hover);
    transform: scale(1.1);
  }

  .img {
    display: flex;
    flex-direction: column;
    justify-content: center;
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

  .image-control {
    position: absolute;

    border-radius: 50%;

    width: 14px;
    height: 14px;

    padding: 5px;

    left: 2px;

    fill: var(--font-color);

    background-color: var(--background);

    opacity: 0.8;

    display: none;
  }
  .image-control:hover {
    cursor: pointer;
    opacity: 1;
  }

  .show-view { top: 2px; }
  .grid:hover > .image-control { display: flex; }
</style>