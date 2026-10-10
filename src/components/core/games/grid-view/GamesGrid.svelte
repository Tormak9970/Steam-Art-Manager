<script lang="ts">
  import { GridLoadingSkeleton, VirtualGrid } from "@layout";
  import { currentPlatform, gridImageSize, gridType } from "@stores/AppState";
  import type { GameStruct } from "@types";
  import { GRID_DIMENSIONS } from "@utils";
  import GameEntry from "../GameEntry.svelte";

  type Props = {
    isLoading: boolean;
    games: GameStruct[];
  };

  let { isLoading, games }: Props = $props();

  let gridDimensions = $derived(GRID_DIMENSIONS[$gridImageSize]);

  let imageWidth = $derived(
    gridDimensions.widths[$gridType] + gridDimensions.padding,
  );
  let imageHeight = $derived(
    gridDimensions.heights[$gridType] +
      gridDimensions.padding +
      gridDimensions.heightOffset,
  );
</script>

<div class="games-grid">
  {#if isLoading}
    <div
      class="loading-container"
      style="--img-width: {imageWidth}rem; --img-height: {imageHeight}rem;"
    >
      {#each new Array(100) as _}
        <GridLoadingSkeleton />
      {/each}
    </div>
  {:else if games.length > 0}
    <VirtualGrid
      remItemHeight={imageHeight}
      remItemWidth={imageWidth}
      rowGap={15}
      columnGap={15}
      items={games}
      keyFunction={(game: { index: number; data: GameStruct }) =>
        `${$currentPlatform}|${game.data.appid}|${game.data.name}`}
    >
      {#snippet entry(data)}
        <GameEntry game={data} />
      {/snippet}
    </VirtualGrid>
  {:else}
    <div class="message">
      No {$currentPlatform} games found.
    </div>
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
