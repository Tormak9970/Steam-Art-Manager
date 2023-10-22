<script lang="ts">
  import VirtualList from "./VirtualList.svelte";
  import GameEntry from "../GameEntry.svelte";
  import EntryLoadingSkeleton from "./EntryLoadingSkeleton.svelte";
  
  import { currentPlatform } from "../../../../stores/AppState";

  export let isLoading: boolean;
  export let games: GameStruct[];

  const itemHeight = 47;
</script>

<div class="games-list">
  {#if isLoading}
    <div class="loading-container">
      {#each new Array(100) as _}
        <EntryLoadingSkeleton />
      {/each}
    </div>
  {:else}
    {#if games.length > 0}
      <VirtualList itemHeight={itemHeight} items={games} keyFunction={(game) => `${$currentPlatform}|${game.data.appid}|${game.data.name}`} let:entry>
        <GameEntry game={entry} />
      </VirtualList>
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
    overflow: hidden;
  }

  .loading-container {
    height: 100%;
    width: 100%;

    overflow: hidden;
  }
  
  .message {
    width: 100%;
    text-align: center;
    opacity: 0.5;
    padding-top: 40px;
  }
</style>