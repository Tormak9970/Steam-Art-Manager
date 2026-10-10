<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";

  import {
    Platforms,
    appLibraryCache,
    currentPlatform,
    customGameNames,
    gridType,
    hiddenGameIds,
    originalAppLibraryCache,
    originalLogoPositions,
    renderGamesInList,
    selectedGameAppId,
    steamLogoPositions,
    unfilteredLibraryCache,
  } from "@stores/AppState";
  import { currentGridsAppid, showCurrentGridsModal } from "@stores/Modals";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { GridTypes, type GameStruct, type LibraryCacheEntry } from "@types";
  import GridEntry from "./grid-view/GridEntry.svelte";
  import ListEntry from "./list-view/ListEntry.svelte";

  type Props = {
    game: GameStruct;
  };

  let { game }: Props = $props();

  let gridTypeUnsub: Unsubscriber;
  let libraryCacheUnsub: Unsubscriber;

  let showImage = $state(true);
  let imagePath = $state("");
  let showIcon = $state(true);
  let iconPath = $state("");

  let isHidden = $derived($hiddenGameIds.includes(game.appid));
  let originalLogoPos = $derived(
    $originalLogoPositions[game.appid]?.logoPosition,
  );
  let steamLogoPos = $derived($steamLogoPositions[game.appid]?.logoPosition);

  let hasCustomArt = $derived(
    $currentPlatform === Platforms.STEAM && $unfilteredLibraryCache[game.appid]
      ? $appLibraryCache[game.appid][$gridType] !==
          $unfilteredLibraryCache[game.appid][$gridType]
      : false,
  );
  let hasCustomName = $derived(!!$customGameNames[game.appid]);

  let gridChanged = $derived(
    $currentPlatform === Platforms.STEAM && $appLibraryCache[game.appid]
      ? (!!$appLibraryCache[game.appid] &&
          !$originalAppLibraryCache[game.appid]) ||
          $appLibraryCache[game.appid][$gridType] !==
            $originalAppLibraryCache[game.appid][$gridType]
      : false,
  );
  let logoPosChanged = $derived(
    steamLogoPos
      ? steamLogoPos.nHeightPct !== originalLogoPos?.nHeightPct ||
          steamLogoPos.nWidthPct !== originalLogoPos?.nWidthPct ||
          steamLogoPos.pinnedPosition !== originalLogoPos?.pinnedPosition
      : false,
  );
  let canDiscard = $derived(gridChanged || logoPosChanged);

  /**
   * Selects this game.
   */
  function selectGame(): void {
    $selectedGameAppId = game.appid.toString();
  }

  /**
   * Hides/unhides this game.
   */
  function toggleHidden(shouldHide: boolean): void {
    const tmp = $hiddenGameIds;

    if (shouldHide) {
      tmp.push(game.appid);

      if ($selectedGameAppId === game.appid.toString()) {
        $selectedGameAppId = "";
      }
    } else {
      tmp.splice($hiddenGameIds.indexOf(game.appid), 1);
    }

    $hiddenGameIds = [...tmp];
  }

  /**
   * Shows the all grids modal for the current game.
   * @param appid The appid of the chosen game.
   */
  function showAllGrids(appid: number): void {
    $currentGridsAppid = appid.toString();
    $showCurrentGridsModal = true;
  }

  /**
   * Handles updating this game's image path when state changes.
   * @param libraryCache The library cache object.
   * @param type The selected grid type.
   */
  function updateOnStateChange(
    libraryCache: { [appid: string]: LibraryCacheEntry },
    type: GridTypes,
  ): void {
    if (libraryCache[game.appid]) {
      const filteredCache = libraryCache[game.appid.toString()][type];

      if (!filteredCache) {
        showImage = false;
        return;
      }

      showImage = true;
      const unfiltered = $unfilteredLibraryCache[game.appid.toString()];
      const unfilteredCache = unfiltered ? unfiltered[type] : null;
      const unfilteredCacheIcon = unfiltered ? unfiltered.Icon : null;
      const filteredCacheIcon = libraryCache[game.appid.toString()].Icon;

      if (filteredCache === "REMOVE") {
        imagePath = unfilteredCache ? convertFileSrc(unfilteredCache) : "";
        iconPath = unfilteredCacheIcon
          ? convertFileSrc(unfilteredCacheIcon)
          : "";
      } else {
        imagePath = convertFileSrc(filteredCache);
        iconPath = filteredCacheIcon ? convertFileSrc(filteredCacheIcon) : "";
      }

      showIcon = !!libraryCache[game.appid].Icon;
    } else {
      imagePath = "";
      iconPath = "";
    }
  }

  onMount(() => {
    gridTypeUnsub = gridType.subscribe((type) => {
      updateOnStateChange($appLibraryCache, type);
    });
    libraryCacheUnsub = appLibraryCache.subscribe((cache) => {
      updateOnStateChange(cache, $gridType);
    });
  });

  onDestroy(() => {
    if (gridTypeUnsub) gridTypeUnsub();
    if (libraryCacheUnsub) libraryCacheUnsub();
  });
</script>

{#if $renderGamesInList}
  <ListEntry
    {game}
    {iconPath}
    {showIcon}
    {isHidden}
    {hasCustomName}
    {hasCustomArt}
    {canDiscard}
    {selectGame}
    {toggleHidden}
    {showAllGrids}
  />
{:else}
  <GridEntry
    {game}
    {imagePath}
    {showImage}
    {isHidden}
    {hasCustomName}
    {hasCustomArt}
    {canDiscard}
    {selectGame}
    {toggleHidden}
    {showAllGrids}
  />
{/if}
