<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";

  import { convertFileSrc } from "@tauri-apps/api/core";
  import type { GameStruct, GridTypes, LibraryCacheEntry } from "@types";
  import { Platforms, appLibraryCache, currentPlatform, customGameNames, gridType, hiddenGameIds, originalAppLibraryCache, renderGamesInList, selectedGameAppId, unfilteredLibraryCache } from "../../../stores/AppState";
  import { currentGridsAppid, showCurrentGridsModal } from "../../../stores/Modals";
  import GridEntry from "./grid-view/GridEntry.svelte";
  import ListEntry from "./list-view/ListEntry.svelte";

  export let game: GameStruct;

  let gridTypeUnsub: Unsubscriber;
  let libraryCacheUnsub: Unsubscriber;

  let showImage = true;
  let imagePath = "";
  let showIcon = true;
  let iconPath = "";
  $: isHidden = $hiddenGameIds.includes(game.appid);
  
  $: hasCustomArt = ($currentPlatform === Platforms.STEAM && $unfilteredLibraryCache[game.appid]) ? $appLibraryCache[game.appid][$gridType] !== $unfilteredLibraryCache[game.appid][$gridType] : false;
  $: hasCustomName = !!$customGameNames[game.appid];

  $: gridChanged = ($currentPlatform === Platforms.STEAM && $appLibraryCache[game.appid]) ?
    (!!$appLibraryCache[game.appid] && !$originalAppLibraryCache[game.appid]) || ($appLibraryCache[game.appid][$gridType] !== $originalAppLibraryCache[game.appid][$gridType]) :
    false;
  $: canDiscard = gridChanged;

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
    
    $hiddenGameIds = [ ...tmp ];
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
  function updateOnStateChange(libraryCache: { [appid: string]: LibraryCacheEntry}, type: GridTypes): void {
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
        iconPath = unfilteredCacheIcon ? convertFileSrc(unfilteredCacheIcon) : "";
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
    game={game}
    iconPath={iconPath}
    showIcon={showIcon}

    isHidden={isHidden}
    hasCustomName={hasCustomName}
    hasCustomArt={hasCustomArt}
    canDiscard={canDiscard}

    selectGame={selectGame}
    toggleHidden={toggleHidden}
    showAllGrids={showAllGrids}
  />
{:else}
  <GridEntry
    game={game}
    imagePath={imagePath}
    showImage={showImage}

    isHidden={isHidden}
    hasCustomName={hasCustomName}
    hasCustomArt={hasCustomArt}
    canDiscard={canDiscard}

    selectGame={selectGame}
    toggleHidden={toggleHidden}
    showAllGrids={showAllGrids}
  />
{/if}