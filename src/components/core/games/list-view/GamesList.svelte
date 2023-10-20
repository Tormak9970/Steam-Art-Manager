<script lang="ts">
  import VirtualList from "@sveltejs/svelte-virtual-list";
  import { currentPlatform } from "../../../../stores/AppState";

  export let isLoading: boolean;
  export let games: GameStruct[];

  const items = [
    // these can be any values you like
    { name: "one", number: 1 },
    { name: "two", number: 2 },
    { name: "three", number: 3 },
    // ...
    { name: "six thousand and ninety-two", number: 6092 }
  ];

  const itemHeight = 40;
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
      <VirtualList itemHeight={itemHeight} items={items} bind:start bind:end let:item>
        <!-- <ListItem {...item}/> -->
      </VirtualList>
      <p>showing items {start}-{end}</p>
    {:else}
      <div class="message">
        No {$currentPlatform} games found.
      </div>
    {/if}
  {/if}
</div>

<style>

</style>