<script lang="ts">
  import { sortGridsBy } from "@stores/AppState";
  import {
    ExperimentalSortMethods,
    SortMethods,
    type GameStruct,
  } from "@types";

  type Props = {
    game: GameStruct;
  };

  let { game }: Props = $props();

  function formatDate(date: number | undefined): string {
    if (date) {
      console.log(date);
      const asDate = new Date(0);
      asDate.setUTCSeconds(date);

      return asDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
    }

    return "Unkown";
  }

  function formatTime(time: number | undefined): string {
    if (time) {
      const hours = time / 60;

      if (hours > 2) {
        return `${hours.toFixed(1)} hours`;
      }

      const minutes = Math.round(time);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
    }

    return "Never Played";
  }

  function formatReviewScore(score: number | undefined): string {
    if (score) {
      return `${score}%`;
    }

    return "Unkown";
  }
</script>

{#if $sortGridsBy !== SortMethods.ALPHABETICAL}
  <div class="sort-info">
    {#if $sortGridsBy === SortMethods.LAST_PLAYED}
      <div>{formatDate(game.lastPlayed)}</div>
    {:else if $sortGridsBy === SortMethods.PLAYTIME}
      <div>{formatTime(game.playtime)}</div>
    {:else if $sortGridsBy === ExperimentalSortMethods.PURCHASE_DATE}
      <div>{formatDate(game.purchaseDate)}</div>
    {:else if $sortGridsBy === ExperimentalSortMethods.RELEASE_DATE}
      <div>{formatDate(game.releaseDate)}</div>
    {:else if $sortGridsBy === ExperimentalSortMethods.STEAM_REVIEW_SCORE}
      <div>{formatReviewScore(game.steamReviewScore)}</div>
    {/if}
  </div>
{/if}

<style>
  .sort-info {
    width: 100%;
    height: 1rem;
    line-height: 1rem;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;

    text-align: center;
  }
</style>
