<script lang="ts">
  import { tauri } from "@tauri-apps/api"
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";

  import { SettingsManager } from "../../../lib/utils/SettingsManager";
  import { GridTypes, Platforms, appLibraryCache, currentPlatform, customGameNames, gridType, hiddenGameIds, originalAppLibraryCache, originalLogoPositions, selectedGameAppId, selectedGameName, steamLogoPositions, unfilteredLibraryCache } from "../../../stores/AppState";
  import { renderGamesInList } from "../../../stores/AppState";
  import ListEntry from "./list-view/ListEntry.svelte";
  import GridEntry from "./grid-view/GridEntry.svelte";

  export let game: GameStruct;

  let gridTypeUnsub: Unsubscriber;
  let libraryCacheUnsub: Unsubscriber;

  let showImage = true;
  let imagePath = "";
  let showIcon = true;
  let iconPath = "";
  $: isHidden = $hiddenGameIds.includes(game.appid);
  $: originalLogoPos = $originalLogoPositions[game.appid]?.logoPosition;
  $: steamLogoPos = $steamLogoPositions[game.appid]?.logoPosition;
  $: canDiscard = (($currentPlatform === Platforms.STEAM && $appLibraryCache[game.appid]) ? $appLibraryCache[game.appid][$gridType] !== $originalAppLibraryCache[game.appid][$gridType] : false)
                  || (steamLogoPos ? (steamLogoPos.nHeightPct !== originalLogoPos?.nHeightPct || steamLogoPos.nWidthPct !== originalLogoPos?.nWidthPct || steamLogoPos.pinnedPosition !== originalLogoPos?.pinnedPosition) : false);
  $: hasCustomArt = ($currentPlatform === Platforms.STEAM && $unfilteredLibraryCache[game.appid]) ? $appLibraryCache[game.appid][$gridType] !== $unfilteredLibraryCache[game.appid][$gridType] : false;
  $: hasCustomName = !!$customGameNames[game.appid];


  /**
   * Selects this game.
   */
  function selectGame(): void {
    $selectedGameName = $customGameNames[game.appid] ?? game.name;
    $selectedGameAppId = game.appid;
  }

  /**
   * Hides/unhides this game.
   */
  function toggleHidden(isHidden: boolean): void {
    const tmp = $hiddenGameIds;
    
    if (isHidden) {
      tmp.push(game.appid);

      if ($selectedGameAppId === game.appid) {
        $selectedGameAppId = null;
        $selectedGameName = null;
      }
    } else {
      const tmp = $hiddenGameIds;
      tmp.splice($hiddenGameIds.indexOf(game.appid), 1);
    }
    
    $hiddenGameIds = [ ...tmp ];
    SettingsManager.updateSetting("hiddenGameIds", $hiddenGameIds);
  }

  /**
   * Handles updating this game's image path when state changes.
   * @param libraryCache The library cache object.
   * @param type The selected grid type.
   */
  function updateOnStateChange(libraryCache: { [appid: string]: LibraryCacheEntry}, type: GridTypes): void {
    if (libraryCache[game.appid]) {
      if (libraryCache[game.appid][type]) {
        showImage = true;
        if (libraryCache[game.appid][type] === "REMOVE") {
          imagePath = tauri.convertFileSrc($unfilteredLibraryCache[game.appid][type]);
          iconPath = tauri.convertFileSrc($unfilteredLibraryCache[game.appid].Icon);
        } else {
          imagePath = tauri.convertFileSrc(libraryCache[game.appid][type]);
          iconPath = tauri.convertFileSrc(libraryCache[game.appid].Icon);
        }
      }  else {
        showImage = false;
      }

      showIcon = !!libraryCache[game.appid].Icon;
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
  />
{/if}