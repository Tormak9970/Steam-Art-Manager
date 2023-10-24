<script lang="ts">
  import GridLoadingSkeleton from "../../../layout/GridLoadingSkeleton.svelte";
  import GameEntry from "../GameEntry.svelte";
  
  import { currentPlatform, gridType } from "../../../../stores/AppState";
  import { heights, widths } from "../../imageDimensions";
  import VirtualGrid from "../../../layout/VirtualGrid.svelte";

  export let isLoading: boolean;
  export let games: GameStruct[];

  const padding = 20;
</script>

<div class="games-grid">
  {#if isLoading}
    <div class="loading-container" style="--img-width: {widths[$gridType] + padding}px; --img-height: {heights[$gridType] + padding + 18}px;">
      {#each new Array(100) as _}
        <GridLoadingSkeleton />
      {/each}
    </div>
  {:else}
    {#if games.length > 0}
      <VirtualGrid itemHeight={heights[$gridType] + padding + 18} itemWidth={widths[$gridType] + padding} rowGap={15} columnGap={15} items={games} keyFunction={(game) => `${$currentPlatform}|${game.data.appid}|${game.data.name}`} let:entry>
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
    height: calc(100% - 7px);
    overflow: hidden;
  }

  .loading-container {
    width: 100%;
    display: grid;
    
    grid-template-columns: repeat(auto-fit, var(--img-width));
    row-gap: 15px;
    column-gap: 15px;
    grid-auto-flow: row;
    grid-auto-rows: var(--img-height);

    justify-content: center;
  }

  .message {
    width: 100%;
    text-align: center;
    opacity: 0.5;
    padding-top: 40px;
  }
</style>