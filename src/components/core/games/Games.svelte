<script lang="ts">
  import { GridView, ListView } from "@icons";
  import { IconToggle, SearchBar, Toggle } from "@interactables";
  import { ListTabs } from "@layout";
  import { Platforms, currentPlatform, gamesSize, hiddenGameIds, loadingGames, manualSteamGames, nonSteamGames, renderGamesInList, showHidden, steamGames } from "@stores/AppState";
  import type { GameStruct } from "@types";
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import Divider from "../Divider.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import GamesGrid from "./grid-view/GamesGrid.svelte";
  import GamesList from "./list-view/GamesList.svelte";

  let steamGamesUnsub: Unsubscriber;
  let manualSteamGamesUnsub: Unsubscriber;
  let nonSteamGamesUnsub: Unsubscriber;
  let hiddenGameIdsUnsub: Unsubscriber;
  let showHiddenUnsub: Unsubscriber
  let selectedPlatformUnsub: Unsubscriber;

  let isLoading = true;

  let searchQuery = "";
  let games: GameStruct[] = [];

  let setSearchFocus: () => void;

  /**
   * Overwrites the default search function.
   * @param e The keyboard event.
   */
  function overwriteCtrlF(e: Event): void {
    if ((e as KeyboardEvent).ctrlKey && (e as KeyboardEvent).key === "f") {
      e.preventDefault();
      setSearchFocus();
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
  function getGamesForPlatform(platform: Platforms, sGames: GameStruct[], manualSGames: GameStruct[], nonSGames: GameStruct[]): GameStruct[] {
    switch (platform) {
      case Platforms.STEAM:
        return [ ...sGames, ...manualSGames ];
      case Platforms.NON_STEAM:
        return nonSGames;
    }
  }

  /**
   * Filters the games for the current platform based on if they are hidden, and the current searchQuery.
   * @param platform The platform to get games form.
   * @param hiddenIds The list of hidden appids.
   * @param showHidden Whether or not to show hidden games.
   * @param sGames The list of steam games.
   * @param manualSGames The list of manually added steam games.
   * @param nonSGames The list of non steam games.
   * @returns The list of filtered games.
   */
  function filterGames(platform: Platforms, hiddenIds: number[], showHidden: boolean, sGames: GameStruct[], manualSGames: GameStruct[], nonSGames: GameStruct[]): GameStruct[] {
    let allGames = getGamesForPlatform(platform, sGames, manualSGames, nonSGames);
    let selectedGames: GameStruct[] = [];

    if (showHidden) {
      selectedGames = allGames;
    } else {
      selectedGames = allGames.filter((game) => !hiddenIds.includes(game.appid));
    }

    return selectedGames.filter((game) => game.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  /**
   * Updates the game list based on the provided search query.
   * @param query The search query.
   */
  function onSearchChange(query: string): void {
    searchQuery = query.toLowerCase();
    games = filterGames($currentPlatform, $hiddenGameIds, $showHidden, $steamGames, $manualSteamGames, $nonSteamGames);
  }

  onMount(() => {
    steamGamesUnsub = steamGames.subscribe((newGames) => {
      isLoading = true;
      if ($currentPlatform === Platforms.STEAM) games = filterGames($currentPlatform, $hiddenGameIds, $showHidden, newGames, $manualSteamGames, $nonSteamGames);
      isLoading = false;
    });
    manualSteamGamesUnsub = manualSteamGames.subscribe((newGames) => {
      isLoading = true;
      if ($currentPlatform === Platforms.STEAM) games = filterGames($currentPlatform, $hiddenGameIds, $showHidden, $steamGames, newGames, $nonSteamGames);
      isLoading = false;
    });
    nonSteamGamesUnsub = nonSteamGames.subscribe((newGames) => {
      isLoading = true;
      if ($currentPlatform === Platforms.NON_STEAM) games = filterGames($currentPlatform, $hiddenGameIds, $showHidden, $steamGames, $manualSteamGames, newGames);
      isLoading = false;
    });
    hiddenGameIdsUnsub = hiddenGameIds.subscribe((ids) => {
      isLoading = true;
      games = filterGames($currentPlatform, ids, $showHidden, $steamGames, $manualSteamGames, $nonSteamGames);
      isLoading = false;
    });
    showHiddenUnsub = showHidden.subscribe((show) => {
      isLoading = true;
      games = filterGames($currentPlatform, $hiddenGameIds, show, $steamGames, $manualSteamGames, $nonSteamGames);
      isLoading = false;
    });
    selectedPlatformUnsub = currentPlatform.subscribe((platform) => {
      isLoading = true;
      games = filterGames(platform, $hiddenGameIds, $showHidden, $steamGames, $manualSteamGames, $nonSteamGames);
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
  });
</script>

<svelte:window on:keydown={overwriteCtrlF} />

<Pane minSize={20} size={$gamesSize}>
  <div class="inner">
    <SectionTitle title="Games" />

    <div class="content">
      <div class="inputs">
        <div class="controls">
          <IconToggle leftTooltip="Grid View" rightTooltip="List View" bind:value={$renderGamesInList}>
            <span slot="left">
              <GridView />
            </span>
            <span slot="right">
              <ListView />
            </span>
          </IconToggle>
          <Toggle label="Show hidden" bind:value={$showHidden}/>
        </div>
        <SearchBar label="Search Library" onChange={onSearchChange} interval={800} bind:setSearchFocus={setSearchFocus} />
      </div>
      
      <Divider />
    </div>

    <div class="content" style="height: calc(100% - 5.375rem);">
      <ListTabs tabs={Object.values(Platforms)} height="calc(100% - 2.875rem)" bind:selected={$currentPlatform}>
        {#if $renderGamesInList}
          <GamesList isLoading={isLoading || $loadingGames} games={games} />
        {:else}
          <GamesGrid isLoading={isLoading || $loadingGames} games={games} />
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

  .controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>