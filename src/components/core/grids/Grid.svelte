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
  <div class="loading-overlay" class:showing={$dowloadingGridId == grid.id}>
    <LoadingSpinner width="40px" height="40px" />
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
    background-color: var(--foreground-hover);
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

    transition: transform 0.2s ease-in-out;
  }
  .grid:hover {
    background-color: var(--foreground-light);
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

  .showing {
    display: flex;
  }
</style>