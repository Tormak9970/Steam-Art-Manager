<script lang="ts">
  import { VirtualList } from "@layout";
  import { currentPlatform } from "@stores/AppState";
  import type { GameStruct } from "@types";
  import GameEntry from "../GameEntry.svelte";
  import EntryLoadingSkeleton from "./EntryLoadingSkeleton.svelte";

  type Props = {
    isLoading: boolean;
    games: GameStruct[];
  };

  let { isLoading, games }: Props = $props();

  const itemHeight = 48;
</script>

<div class="games-list">
  {#if isLoading}
    <div class="loading-container">
      {#each new Array(100) as _}
        <EntryLoadingSkeleton />
      {/each}
    </div>
  {:else if games.length > 0}
    <VirtualList
      {itemHeight}
      items={games}
      keyFunction={(game: { index: number; data: GameStruct }) =>
        `${$currentPlatform}|${game.data.appid}|${game.data.name}`}
    >
      {#snippet entry(data)}
        <GameEntry game={data} />
      {/snippet}
    </VirtualList>
  {:else}
    <div class="message">
      No {$currentPlatform} games found.
    </div>
  {/if}
</div>

<style>
  .games-list {
    height: calc(100% - 0.5rem);
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
    padding-top: 2.5rem;
  }
</style>
