<script lang="ts">
  import { filterGridsBy } from "@stores/AppState";
  import {
    ExperimentalFilterMethods,
    FilterMethods,
    type GameStruct,
  } from "@types";

  type Props = {
    game: GameStruct;
  };

  let { game }: Props = $props();

  function formatBoolean(value: boolean | undefined): string {
    if (value) {
      return "Yes";
    } else if (value === false) {
      return "No";
    }

    return "Unknown";
  }

  function formatCollections(appid: number | undefined): string {
    return "Unknown";
  }

  function formatStoreCategories(appid: number | undefined): string {
    return "Unknown";
  }

  function formatStoreTags(appid: number | undefined): string {
    return "Unknown";
  }

  function formatDeckCompat(comptat: number | undefined): string {
    return "Unknown";
  }

  function formatFrameCompat(comptat: number | undefined): string {
    return "Unknown";
  }

  function formatMachineCompat(comptat: number | undefined): string {
    return "Unknown";
  }

  function formatSteamOSCompat(comptat: number | undefined): string {
    return "Unknown";
  }

  function formatReviewScore(score: number | undefined): string {
    if (score) {
      return `${score}%`;
    }

    return "Unknown";
  }
</script>

{#if $filterGridsBy !== FilterMethods.NAME}
  <div class="filter-info">
    {#if $filterGridsBy === FilterMethods.APP_ID}
      <div>{game.appid}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.COLLECTIONS}
      <!-- TODO: need to show a tooltip listing all collections -->
      <div>{formatCollections(game.appid)}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.STORE_CATEGORIES}
      <!-- TODO: need to show a tooltip listing all categories -->
      <div>{formatStoreCategories(game.storeCategories)}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.STORE_TAGS}
      <!-- TODO: need to show a tooltip listing all tags -->
      <div>{formatStoreTags(game.storeTags)}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.STEAM_REVIEW_SCORE}
      <div>{formatReviewScore(game.steamReviewScore)}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.DECK_COMPAT_CATGEORY}
      <div>{formatDeckCompat(game.steamDeckCompatCategory)}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.FRAME_COMPAT_CATGEORY}
      <div>{formatFrameCompat(game.steamFrameCompatCategory)}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.MACHINE_COMPAT_CATGEORY}
      <div>{formatMachineCompat(game.steamMachineCompatCategory)}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.STEAMOS_COMPAT_CATGEORY}
      <div>{formatSteamOSCompat(game.steamOSCompatCategory)}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.IS_FAMILY_SHARING}
      <div>{formatBoolean(game.isFamilySharing)}</div>
    {/if}
  </div>
{/if}

<style>
  .filter-info {
    width: 100%;
    height: 1rem;
    line-height: 1rem;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;

    text-align: center;
  }
</style>
