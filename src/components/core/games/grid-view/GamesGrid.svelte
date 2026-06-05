<script lang="ts">
  import { GridLoadingSkeleton, VirtualGrid } from "@layout";
  import { currentPlatform, gridImageSize, gridType } from "@stores/AppState";
  import type { GameStruct } from "@types";
  import { GRID_DIMENSIONS } from "@utils";
  import GameEntry from "../GameEntry.svelte";

  export let isLoading: boolean;
  export let games: GameStruct[];

  $: gridDimensions = GRID_DIMENSIONS[$gridImageSize]

  $: imageWidth = gridDimensions.widths[$gridType] + gridDimensions.padding
  $: imageHeight = gridDimensions.heights[$gridType] + gridDimensions.padding + gridDimensions.heightOffset
</script>

<div class="games-grid">
  {#if isLoading}
    <div class="loading-container" style="--img-width: {imageWidth}rem; --img-height: {imageHeight}rem;">
      {#each new Array(100) as _}
        <GridLoadingSkeleton />
      {/each}
    </div>
  {:else}
    {#if games.length > 0}
      <VirtualGrid remItemHeight={imageHeight} remItemWidth={imageWidth} rowGap={15} columnGap={15} items={games} keyFunction={(game) => `${$currentPlatform}|${game.data.appid}|${game.data.name}`} let:entry>
        <GameEntry game={entry} />
      </VirtualGrid>
    {:else}
      <div class="message">
        No {$currentPlatform} games found.
      </div>
    {/if}
  {/if}
</div>

<style>
  .games-grid {
    height: calc(100% - 0.5rem);
    overflow: hidden;
  }

  .loading-container {
    width: 100%;
    display: grid;
    
    grid-template-columns: repeat(auto-fit, var(--img-width));
    row-gap: 1rem;
    column-gap: 1rem;
    grid-auto-flow: row;
    grid-auto-rows: var(--img-height);

    justify-content: center;
  }

  .message {
    width: 100%;
    text-align: center;
    opacity: 0.5;
    padding-top: 2.5rem;
  }
</style>