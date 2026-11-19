<script lang="ts">
  import { AppController } from "@controllers";
  import { filterGridsBy, steamClientFilterData } from "@stores/AppState";
  import {
    ExperimentalFilterMethods,
    FilterMethods,
    type GameStruct,
  } from "@types";
  import {
    DECK_COMPAT_CATEGORIES,
    FRAME_COMPAT_CATEGORIES,
    MACHINE_COMPAT_CATEGORIES,
    STEAMOS_COMPAT_CATEGORIES,
  } from "../../../lib/constants/SteamCompatCategories";
  import { STEAM_FEATURES_ID_MAP } from "../../../lib/constants/SteamFeatures";

  type Props = {
    game: GameStruct;
  };

  let { game }: Props = $props();

  const collectionOptions: Record<number, string[]> = $derived.by(() => {
    const appCollectionMap: Record<number, string[]> = {};

    for (const collection of $steamClientFilterData?.collections ?? []) {
      for (const appId of collection.apps) {
        if (!appCollectionMap[appId]) {
          appCollectionMap[appId] = [collection.name];
          continue;
        }

        appCollectionMap[appId].push(collection.name);
      }
    }

    return appCollectionMap;
  });

  function formatBoolean(value: boolean | undefined): string {
    if (value) {
      return "Shared";
    } else if (value === false) {
      return "Owned";
    }

    return "Unknown";
  }

  function formatCollections(appid: number): string {
    return (
      collectionOptions[appid]
        ?.filter((category) => category && category !== "")
        .join("<br/>") ?? "None"
    );
  }

  function formatStoreCategories(categories: number[]): string {
    return (
      categories
        ?.map(
          (category) =>
            STEAM_FEATURES_ID_MAP[category.toString()]?.display_name ?? "",
        )
        .filter((category) => category && category !== "")
        .join("<br/>") ?? "None"
    );
  }

  function formatStoreTags(tags: number[]): string {
    return (
      tags
        ?.map((tag) => $steamClientFilterData?.tags[tag] ?? "")
        .filter((category) => category && category !== "")
        .join("<br/>") ?? "None"
    );
  }

  function formatDeckCompat(compat: number | undefined): string {
    return (
      DECK_COMPAT_CATEGORIES.find((cat) => cat.data === compat?.toString())
        ?.label ?? "Unkown"
    );
  }

  function formatFrameCompat(compat: number | undefined): string {
    return (
      FRAME_COMPAT_CATEGORIES.find((cat) => cat.data === compat?.toString())
        ?.label ?? "Unkown"
    );
  }

  function formatMachineCompat(compat: number | undefined): string {
    return (
      MACHINE_COMPAT_CATEGORIES.find((cat) => cat.data === compat?.toString())
        ?.label ?? "Unkown"
    );
  }

  function formatSteamOSCompat(compat: number | undefined): string {
    return (
      STEAMOS_COMPAT_CATEGORIES.find((cat) => cat.data === compat?.toString())
        ?.label ?? "Unkown"
    );
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
      <div
        use:AppController.tippy={{
          content: formatCollections(game.appid),
          placement: "bottom",
          onShow: AppController.onTippyShow,
        }}
      >
        {collectionOptions[game.appid]?.length === 1
          ? "1 Category"
          : `${collectionOptions[game.appid]?.length ?? 0} Categories`}
      </div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.STORE_CATEGORIES}
      <div
        use:AppController.tippy={{
          content: formatStoreCategories(game.storeCategories ?? []),
          placement: "bottom",
          onShow: AppController.onTippyShow,
        }}
      >
        {(game.storeCategories ?? []).length === 1
          ? "1 Category"
          : `${(game.storeCategories ?? []).length} Categories`}
      </div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.STORE_TAGS}
      <div
        use:AppController.tippy={{
          content: formatStoreTags(game.storeTags ?? []),
          placement: "bottom",
          onShow: AppController.onTippyShow,
        }}
      >
        {(game.storeTags ?? []).length === 1
          ? "1 Tag"
          : `${(game.storeTags ?? []).length} Tags`}
      </div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.STEAM_REVIEW_SCORE}
      <div>{formatReviewScore(game.steamReviewScore)}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.DECK_COMPAT_CATEGORY}
      <div>{formatDeckCompat(game.steamDeckCompatCategory)}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.FRAME_COMPAT_CATEGORY}
      <div>{formatFrameCompat(game.steamFrameCompatCategory)}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.MACHINE_COMPAT_CATEGORY}
      <div>{formatMachineCompat(game.steamMachineCompatCategory)}</div>
    {:else if $filterGridsBy === ExperimentalFilterMethods.STEAMOS_COMPAT_CATEGORY}
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
