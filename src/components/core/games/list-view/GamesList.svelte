<script lang="ts">
  import VirtualList from "./VirtualList.svelte";
  import GameEntry from "../GameEntry.svelte";
  
  import { currentPlatform } from "../../../../stores/AppState";

  export let isLoading: boolean;
  export let games: GameStruct[];

  const itemHeight = 48;
  let start: number;
	let end: number;
</script>

<div class="games-list">
  {#if isLoading}
    <!-- <div class="game-grid" style="--img-width: {widths[$gridType] + padding}px; --img-height: {heights[$gridType] + padding + 18}px;">
      {#each new Array(100) as _}
        <GridLoadingSkeleton />
      {/each}
    </div> -->
    <!-- TODO: show loading skeletons for list entries here -->
  {:else}
    {#if games.length > 0}
      <VirtualList itemHeight={itemHeight} items={games} bind:start bind:end let:item>
        <GameEntry game={item} />
      </VirtualList>
      <!-- <p>showing items {start}-{end}</p> -->
    {:else}
      <div class="message">
        No {$currentPlatform} games found.
      </div>
    {/if}
  {/if}
</div>

<style>
  .games-list {
    height: 100%;
  }
  
  .message {
    width: 100%;
    text-align: center;
    opacity: 0.5;
    padding-top: 40px;
  }
</style>