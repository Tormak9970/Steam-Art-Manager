<script lang="ts">
  import { Check, GridView, ListView, Options, Ruler, Sort } from "@icons";
  import { IconToggle, Menu, SearchBar } from "@interactables";
  import { ListTabs } from "@layout";
  import { GRID_IMAGE_SIZES } from "@models";
  import {
    Platforms,
    appLibraryCache,
    appTypes,
    currentPlatform,
    gamesSize,
    gridImageSize,
    gridType,
    hiddenGameIds,
    loadingGames,
    manualSteamGames,
    nonSteamGames,
    onlyShowInstalled,
    onlyShowMissing,
    renderGamesInList,
    showHidden,
    sortGridsBy,
    steamGames,
  } from "@stores/AppState";
  import { SortMethods, type GameStruct, type GridTypes } from "@types";
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import { type Unsubscriber } from "svelte/store";
  import { sortGames } from "../../../lib/utils/SortMethods";
  import Divider from "../Divider.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import GamesGrid from "./grid-view/GamesGrid.svelte";
  import GamesList from "./list-view/GamesList.svelte";

  let steamGamesUnsub: Unsubscriber;
  let manualSteamGamesUnsub: Unsubscriber;
  let nonSteamGamesUnsub: Unsubscriber;
  let hiddenGameIdsUnsub: Unsubscriber;
  let showHiddenUnsub: Unsubscriber;
  let selectedPlatformUnsub: Unsubscriber;
  let onlyShowMissingUnsub: Unsubscriber;
  let onlyShowInstalledUnsub: Unsubscriber;
  let gridTypeUnsub: Unsubscriber;
  let appTypeUnsub: Unsubscriber;
  let sortGridsByUnsub: Unsubscriber;

  let isLoading = $state(true);

  let searchQuery = $state("");
  let games: GameStruct[] = $state([]);

  let searchComponent: SearchBar | undefined = $state();

  let gameFilterMenu = $derived([
    {
      label: "Show Hidden",
      icon: $showHidden ? Check : undefined,
      onClick: () => {
        $showHidden = !$showHidden;
      },
    },
    {
      label: "Missing Grids Only",
      icon: $onlyShowMissing ? Check : undefined,
      onClick: () => {
        $onlyShowMissing = !$onlyShowMissing;
      },
    },
    {
      label: "Installed Only",
      icon: $onlyShowInstalled ? Check : undefined,
      onClick: () => {
        $onlyShowInstalled = !$onlyShowInstalled;
      },
    },
  ]);

  let gameSortMenu = $derived([
    {
      label: "Alphabetical",
      icon: $sortGridsBy === SortMethods.ALPHABETICAL ? Check : undefined,
      onClick: () => {
        $sortGridsBy = SortMethods.ALPHABETICAL;
      },
    },
    {
      label: "Last Played",
      icon: $sortGridsBy === SortMethods.LAST_PLAYED ? Check : undefined,
      onClick: () => {
        $sortGridsBy = SortMethods.LAST_PLAYED;
      },
    },
    ...($currentPlatform === Platforms.STEAM
      ? [
          {
            label: "Playtime",
            icon: $sortGridsBy === SortMethods.PLAYTIME ? Check : undefined,
            onClick: () => {
              $sortGridsBy = SortMethods.PLAYTIME;
            },
          },
        ]
      : []),
  ]);

  let gridSizeMenu = $derived(
    GRID_IMAGE_SIZES.map((size) => {
      return {
        label: size.label,
        icon: $gridImageSize === size.data ? Check : undefined,
        onClick: () => {
          $gridImageSize = size.data;
        },
      };
    }),
  );

  /**
   * Overwrites the default search function.
   * @param e The keyboard event.
   */
  function overwriteCtrlF(e: Event): void {
    if ((e as KeyboardEvent).ctrlKey && (e as KeyboardEvent).key === "f") {
      e.preventDefault();
      searchComponent!.setSearchFocus();
    }
  }

  /**
   * Gets the games based on the provided platform.
   * @param platform The platform to get games for.
   * @returns The list of games for the provided platform.
   * @param sGames The list of steam games.
   * @param manualSGames The list of manually added steam games.
   * @param nonSGames The list of non steam games.
   */
  function getGamesForPlatform(
    platform: Platforms,
    sGames: GameStruct[],
    manualSGames: GameStruct[],
    nonSGames: GameStruct[],
  ): GameStruct[] {
    switch (platform) {
      case Platforms.STEAM:
        return [...sGames, ...manualSGames];
      case Platforms.NON_STEAM:
        return nonSGames;
    }
  }

  type FilterProps = {
    platform?: Platforms;
    hiddenIds?: number[];
    showHiddenGames?: boolean;
    sGames?: GameStruct[];
    manualSGames?: GameStruct[];
    nonSGames?: GameStruct[];
    onlyShowMissingGames?: boolean;
    onlyInstalledGames?: boolean;
    currentGridType?: GridTypes;
    selectedAppTypes?: string[];
    sortBy?: SortMethods;
  };

  /**
   * Filters the games for the current platform based on if they are hidden, and the current searchQuery.
   * @param platform The platform to get games form.
   * @param hiddenIds The list of hidden appids.
   * @param showHidden Whether or not to show hidden games.
   * @param sGames The list of steam games.
   * @param manualSGames The list of manually added steam games.
   * @param nonSGames The list of non steam games.
   * @param onlyShowMissing Whether games should be limited to those missing grids.
   * @param onlyInstalled Whether games should be limited to those installed.
   * @param gridType The current gridType.
   * @returns The list of filtered games.
   */
  function filterGames(props: FilterProps): GameStruct[] {
    const {
      platform = $currentPlatform,
      hiddenIds = $hiddenGameIds,
      showHiddenGames = $showHidden,
      sGames = $steamGames,
      manualSGames = $manualSteamGames,
      nonSGames = $nonSteamGames,
      onlyShowMissingGames = $onlyShowMissing,
      onlyInstalledGames = $onlyShowInstalled,
      currentGridType = $gridType,
      selectedAppTypes = $appTypes,
      sortBy = $sortGridsBy,
    } = props;

    console.log("sGames:", sGames);

    let allGames = getGamesForPlatform(
      platform,
      sGames,
      manualSGames,
      nonSGames,
    );
    let selectedGames: GameStruct[] = [];

    if (showHiddenGames) {
      selectedGames = allGames;
    } else {
      selectedGames = allGames.filter(
        (game) => !hiddenIds.includes(game.appid),
      );
    }

    if (onlyShowMissingGames) {
      selectedGames = selectedGames.filter((game) => {
        return !$appLibraryCache[game.appid][currentGridType];
      });
    }

    if (onlyInstalledGames) {
      selectedGames = selectedGames.filter((game) => {
        return game.installed;
      });
    }

    const filteredGames = selectedGames.filter(
      (game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        selectedAppTypes.includes(game.type.toLowerCase()),
    );

    return sortGames(filteredGames, sortBy);
  }

  /**
   * Updates the game list based on the provided search query.
   * @param query The search query.
   */
  function onSearchChange(query: string): void {
    searchQuery = query.toLowerCase();
    games = filterGames({});
  }

  onMount(() => {
    steamGamesUnsub = steamGames.subscribe((newGames) => {
      isLoading = true;
      if ($currentPlatform === Platforms.STEAM) {
        games = filterGames({
          sGames: newGames,
        });
      }
      isLoading = false;
    });
    manualSteamGamesUnsub = manualSteamGames.subscribe((newGames) => {
      isLoading = true;
      if ($currentPlatform === Platforms.STEAM) {
        games = filterGames({
          manualSGames: newGames,
        });
      }
      isLoading = false;
    });
    nonSteamGamesUnsub = nonSteamGames.subscribe((newGames) => {
      isLoading = true;
      if ($currentPlatform === Platforms.NON_STEAM) {
        games = filterGames({
          nonSGames: newGames,
        });
      }
      isLoading = false;
    });
    hiddenGameIdsUnsub = hiddenGameIds.subscribe((ids) => {
      isLoading = true;
      games = filterGames({
        hiddenIds: ids,
      });
      isLoading = false;
    });
    showHiddenUnsub = showHidden.subscribe((show) => {
      isLoading = true;
      games = filterGames({
        showHiddenGames: show,
      });
      isLoading = false;
    });
    selectedPlatformUnsub = currentPlatform.subscribe((platform) => {
      isLoading = true;
      games = filterGames({
        platform,
      });
      isLoading = false;
    });
    onlyShowMissingUnsub = onlyShowMissing.subscribe((missing) => {
      isLoading = true;
      games = filterGames({
        onlyShowMissingGames: missing,
      });
      isLoading = false;
    });
    onlyShowInstalledUnsub = onlyShowInstalled.subscribe((installed) => {
      isLoading = true;
      games = filterGames({
        onlyInstalledGames: installed,
      });
      isLoading = false;
    });
    gridTypeUnsub = gridType.subscribe((type) => {
      isLoading = true;
      games = filterGames({
        currentGridType: type,
      });
      isLoading = false;
    });
    appTypeUnsub = appTypes.subscribe((types) => {
      isLoading = true;
      games = filterGames({
        selectedAppTypes: types,
      });
      isLoading = false;
    });
    sortGridsByUnsub = sortGridsBy.subscribe((sortMethod) => {
      isLoading = true;
      games = filterGames({
        sortBy: sortMethod,
      });
      isLoading = false;
    });
  });

  onDestroy(() => {
    if (steamGamesUnsub) steamGamesUnsub();
    if (manualSteamGamesUnsub) manualSteamGamesUnsub();
    if (nonSteamGamesUnsub) nonSteamGamesUnsub();
    if (hiddenGameIdsUnsub) hiddenGameIdsUnsub();
    if (showHiddenUnsub) showHiddenUnsub();
    if (selectedPlatformUnsub) selectedPlatformUnsub();
    if (onlyShowMissingUnsub) onlyShowMissingUnsub();
    if (onlyShowInstalledUnsub) onlyShowInstalledUnsub();
    if (gridTypeUnsub) gridTypeUnsub();
    if (appTypeUnsub) appTypeUnsub();
    if (sortGridsByUnsub) sortGridsByUnsub();
  });
</script>

<svelte:window on:keydown={overwriteCtrlF} />

<Pane minSize={20} size={$gamesSize}>
  <div class="inner">
    <SectionTitle title="Games" />

    <div class="content">
      <div class="inputs">
        <div class="controls">
          <IconToggle
            leftTooltip="Grid View"
            rightTooltip="List View"
            bind:value={$renderGamesInList}
          >
            {#snippet left()}
              <GridView />
            {/snippet}
            {#snippet right()}
              <ListView />
            {/snippet}
          </IconToggle>
        </div>
        <div class="left-cont">
          <SearchBar
            label="Search Library"
            onChange={onSearchChange}
            interval={800}
            bind:this={searchComponent}
          />
          <Menu label="Grid Size" options={gridSizeMenu}>
            <Ruler style="height: 1rem; width: 1rem;" />
          </Menu>
          <Menu label="Sorting" options={gameSortMenu}>
            <Sort style="height: 1rem; width: 1rem;" />
          </Menu>
          <Menu label="Filters" options={gameFilterMenu}>
            <Options style="height: 1rem; width: 1rem;" />
          </Menu>
        </div>
      </div>

      <Divider />
    </div>

    <div class="content" style="height: calc(100% - 5.375rem);">
      <ListTabs
        tabs={Object.values(Platforms)}
        height="calc(100% - 2.875rem)"
        bind:selected={$currentPlatform}
      >
        {#if $renderGamesInList}
          <GamesList isLoading={isLoading || $loadingGames} {games} />
        {:else}
          <GamesGrid isLoading={isLoading || $loadingGames} {games} />
        {/if}
      </ListTabs>
    </div>
  </div>
</Pane>

<style>
  :root {
    --img-width: 6.25rem;
    --img-height: 9.375rem;
  }

  .content {
    padding: 0 0.375rem;
  }

  .inner {
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .inputs {
    display: flex;
    justify-content: space-between;
  }

  .left-cont {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
