<script lang="ts">
  import {
    Check,
    Filter,
    GridView,
    ListView,
    Options,
    Ruler,
    Sort,
  } from "@icons";
  import { IconToggle, Menu } from "@interactables";
  import { ListTabs } from "@layout";
  import { GRID_IMAGE_SIZES } from "@models";
  import {
    Platforms,
    appLibraryCache,
    appTypes,
    currentPlatform,
    filterGridsBy,
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
    useCEFInjection,
  } from "@stores/AppState";
  import {
    ExperimentalFilterMethods,
    ExperimentalSortMethods,
    FilterMethods,
    SortMethods,
    type GameStruct,
    type GridTypes,
  } from "@types";
  import { filterGames, sortGames } from "@utils";
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import { type Unsubscriber } from "svelte/store";
  import Divider from "../Divider.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import FilterInput from "./FilterInput.svelte";
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
  let filterGridsByUnsub: Unsubscriber;

  let isLoading = $state(true);

  let searchQuery = $state("");
  let games: GameStruct[] = $state([]);

  const filterOptions = $derived([
    {
      label: "Name",
      icon: $filterGridsBy === FilterMethods.NAME ? Check : undefined,
      onClick: () => {
        $filterGridsBy = FilterMethods.NAME;
      },
    },
    {
      label: "App ID",
      icon: $filterGridsBy === FilterMethods.APP_ID ? Check : undefined,
      onClick: () => {
        $filterGridsBy = FilterMethods.APP_ID;
      },
    },
    ...($useCEFInjection
      ? [
          {
            label: "Collections",
            icon:
              $filterGridsBy === ExperimentalFilterMethods.COLLECTIONS
                ? Check
                : undefined,
            onClick: () => {
              $filterGridsBy = ExperimentalFilterMethods.COLLECTIONS;
            },
          },
          {
            label: "Store Categories",
            icon:
              $filterGridsBy === ExperimentalFilterMethods.STORE_CATEGORIES
                ? Check
                : undefined,
            onClick: () => {
              $filterGridsBy = ExperimentalFilterMethods.STORE_CATEGORIES;
            },
          },
          {
            label: "Store Tags",
            icon:
              $filterGridsBy === ExperimentalFilterMethods.STORE_TAGS
                ? Check
                : undefined,
            onClick: () => {
              $filterGridsBy = ExperimentalFilterMethods.STORE_TAGS;
            },
          },
          {
            label: "Steam Review Score",
            icon:
              $filterGridsBy === ExperimentalFilterMethods.STEAM_REVIEW_SCORE
                ? Check
                : undefined,
            onClick: () => {
              $filterGridsBy = ExperimentalFilterMethods.STEAM_REVIEW_SCORE;
            },
          },
          {
            label: "Deck Compat Category",
            icon:
              $filterGridsBy === ExperimentalFilterMethods.DECK_COMPAT_CATEGORY
                ? Check
                : undefined,
            onClick: () => {
              $filterGridsBy = ExperimentalFilterMethods.DECK_COMPAT_CATEGORY;
            },
          },
          {
            label: "Frame Compat Category",
            icon:
              $filterGridsBy === ExperimentalFilterMethods.FRAME_COMPAT_CATEGORY
                ? Check
                : undefined,
            onClick: () => {
              $filterGridsBy = ExperimentalFilterMethods.FRAME_COMPAT_CATEGORY;
            },
          },
          {
            label: "Machine Compat Category",
            icon:
              $filterGridsBy ===
              ExperimentalFilterMethods.MACHINE_COMPAT_CATEGORY
                ? Check
                : undefined,
            onClick: () => {
              $filterGridsBy =
                ExperimentalFilterMethods.MACHINE_COMPAT_CATEGORY;
            },
          },
          {
            label: "SteamOS Compat Category",
            icon:
              $filterGridsBy ===
              ExperimentalFilterMethods.STEAMOS_COMPAT_CATEGORY
                ? Check
                : undefined,
            onClick: () => {
              $filterGridsBy =
                ExperimentalFilterMethods.STEAMOS_COMPAT_CATEGORY;
            },
          },
          {
            label: "Is Family Sharing",
            icon:
              $filterGridsBy === ExperimentalFilterMethods.IS_FAMILY_SHARING
                ? Check
                : undefined,
            onClick: () => {
              $filterGridsBy = ExperimentalFilterMethods.IS_FAMILY_SHARING;
            },
          },
        ]
      : []),
  ]);

  const gameRestrictionMenu = $derived([
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

  const gameSortMenu = $derived([
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
    ...($useCEFInjection
      ? [
          {
            label: "Purchase Date",
            icon:
              $sortGridsBy === ExperimentalSortMethods.PURCHASE_DATE
                ? Check
                : undefined,
            onClick: () => {
              $sortGridsBy = ExperimentalSortMethods.PURCHASE_DATE;
            },
          },
          {
            label: "Release Date",
            icon:
              $sortGridsBy === ExperimentalSortMethods.RELEASE_DATE
                ? Check
                : undefined,
            onClick: () => {
              $sortGridsBy = ExperimentalSortMethods.RELEASE_DATE;
            },
          },
          {
            label: "Review Score",
            icon:
              $sortGridsBy === ExperimentalSortMethods.STEAM_REVIEW_SCORE
                ? Check
                : undefined,
            onClick: () => {
              $sortGridsBy = ExperimentalSortMethods.STEAM_REVIEW_SCORE;
            },
          },
        ]
      : []),
  ]);

  const gridSizeMenu = $derived(
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
    sortBy?: SortMethods | ExperimentalSortMethods;
    filterBy?: FilterMethods | ExperimentalFilterMethods;
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
  function restrictGames(props: FilterProps): GameStruct[] {
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
      filterBy = $filterGridsBy,
    } = props;

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

    const appTypeGames = selectedGames.filter((game) =>
      selectedAppTypes.includes(game.type.toLowerCase()),
    );

    const filteredGames = filterGames(appTypeGames, filterBy, searchQuery);

    return sortGames(filteredGames, sortBy);
  }

  /**
   * Updates the game list based on the provided search query.
   * @param query The search query.
   */
  function onSearchChange(query: string): void {
    searchQuery = query.toLowerCase();
    games = restrictGames({});
  }

  onMount(() => {
    steamGamesUnsub = steamGames.subscribe((newGames) => {
      isLoading = true;
      if ($currentPlatform === Platforms.STEAM) {
        games = restrictGames({
          sGames: newGames,
        });
      }
      isLoading = false;
    });
    manualSteamGamesUnsub = manualSteamGames.subscribe((newGames) => {
      isLoading = true;
      if ($currentPlatform === Platforms.STEAM) {
        games = restrictGames({
          manualSGames: newGames,
        });
      }
      isLoading = false;
    });
    nonSteamGamesUnsub = nonSteamGames.subscribe((newGames) => {
      isLoading = true;
      if ($currentPlatform === Platforms.NON_STEAM) {
        games = restrictGames({
          nonSGames: newGames,
        });
      }
      isLoading = false;
    });
    hiddenGameIdsUnsub = hiddenGameIds.subscribe((ids) => {
      isLoading = true;
      games = restrictGames({
        hiddenIds: ids,
      });
      isLoading = false;
    });
    showHiddenUnsub = showHidden.subscribe((show) => {
      isLoading = true;
      games = restrictGames({
        showHiddenGames: show,
      });
      isLoading = false;
    });
    selectedPlatformUnsub = currentPlatform.subscribe((platform) => {
      isLoading = true;
      games = restrictGames({
        platform,
      });
      isLoading = false;
    });
    onlyShowMissingUnsub = onlyShowMissing.subscribe((missing) => {
      isLoading = true;
      games = restrictGames({
        onlyShowMissingGames: missing,
      });
      isLoading = false;
    });
    onlyShowInstalledUnsub = onlyShowInstalled.subscribe((installed) => {
      isLoading = true;
      games = restrictGames({
        onlyInstalledGames: installed,
      });
      isLoading = false;
    });
    gridTypeUnsub = gridType.subscribe((type) => {
      isLoading = true;
      games = restrictGames({
        currentGridType: type,
      });
      isLoading = false;
    });
    appTypeUnsub = appTypes.subscribe((types) => {
      isLoading = true;
      games = restrictGames({
        selectedAppTypes: types,
      });
      isLoading = false;
    });
    sortGridsByUnsub = sortGridsBy.subscribe((sortMethod) => {
      isLoading = true;
      games = restrictGames({
        sortBy: sortMethod,
      });
      isLoading = false;
    });
    filterGridsByUnsub = filterGridsBy.subscribe((filterMethod) => {
      isLoading = true;
      searchQuery = "";
      games = restrictGames({
        filterBy: filterMethod,
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
    if (filterGridsByUnsub) filterGridsByUnsub();
  });
</script>

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
          <FilterInput onChange={onSearchChange} bind:value={searchQuery} />
          <Menu label="Grid Size" options={gridSizeMenu}>
            <Ruler style="height: 1rem; width: 1rem;" />
          </Menu>
          <Menu label="Filters" options={filterOptions}>
            <Filter style="height: 1rem; width: 1rem;" />
          </Menu>
          <Menu label="Sorting" options={gameSortMenu}>
            <Sort style="height: 1rem; width: 1rem;" />
          </Menu>
          <Menu label="Restrict Games" options={gameRestrictionMenu}>
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
