<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import { Platforms, currentPlatform, gridType, hiddenGameIds, loadingGames, nonSteamGames, selectedGameAppId, selectedGameName, selectedSteamGridGame, showHidden, steamGames } from "../../../Stores";
  import LoadingSpinner from "../../info/LoadingSpinner.svelte";
  import SearchBar from "../../interactables/SearchBar.svelte";
  import Toggle from "../../interactables/Toggle.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import Game from "./Game.svelte";
  import ListTabs from "../../layout/tabs/ListTabs.svelte";

  let steamGamesUnsub: Unsubscriber;
  let nonSteamGamesUnsub: Unsubscriber;
  let hiddenGameIdsUnsub: Unsubscriber;
  let showHiddenUnsub: Unsubscriber
  let selectedPlatformUnsub: Unsubscriber;

  let isLoading = true;

  const padding = 20;

  const widths = {
    "Capsule": 100,
    "Wide Capsule": 200,
    "Hero": 353,
    "Logo": 200,
    "Icon": 60,
  };

  const heights = {
    "Capsule": 150,
    "Wide Capsule": 133,
    "Hero": 114,
    "Logo": 134,
    "Icon": 60,
  };

  let searchQuery = "";
  let games: GameStruct[] = [];

  function getGamesForPlatform(platform: Platforms): GameStruct[] {
    switch (platform) {
      case Platforms.STEAM:
        return $steamGames;
      case Platforms.NON_STEAM:
        return $nonSteamGames;
    }
  }

  const filterSteamGames = (platform: Platforms, hiddenIds: number[], showHidden: boolean) => {
    let allGames = getGamesForPlatform(platform);
    let selectedGames: GameStruct[] = [];

    if (showHidden) {
      selectedGames = allGames;
    } else {
      selectedGames = allGames.filter((game) => !hiddenIds.includes(game.appid));
    }

    return selectedGames.filter((game) => game.name.toLowerCase().includes(searchQuery));
  }

  function onSearchChange(query: string) {
    searchQuery = query.toLowerCase();
    games = filterSteamGames($currentPlatform, $hiddenGameIds, $showHidden);
  }

  onMount(() => {
    steamGamesUnsub = steamGames.subscribe(() => {
      isLoading = true;
      if ($currentPlatform == Platforms.STEAM) games = filterSteamGames($currentPlatform, $hiddenGameIds, $showHidden);
      isLoading = false;
    });
    nonSteamGamesUnsub = nonSteamGames.subscribe(() => {
      isLoading = true;
      if ($currentPlatform == Platforms.NON_STEAM) games = filterSteamGames($currentPlatform, $hiddenGameIds, $showHidden);
      isLoading = false;
    });
    hiddenGameIdsUnsub = hiddenGameIds.subscribe((ids) => {
      isLoading = true;
      games = filterSteamGames($currentPlatform, ids, $showHidden);
      isLoading = false;
    });
    showHiddenUnsub = showHidden.subscribe((show) => {
      isLoading = true;
      games = filterSteamGames($currentPlatform, $hiddenGameIds, show);
      isLoading = false;
    });
    selectedPlatformUnsub = currentPlatform.subscribe((platform) => {
      isLoading = true;
      games = filterSteamGames(platform, $hiddenGameIds, $showHidden);
      isLoading = false;
    });
  });

  onDestroy(() => {
    if (steamGamesUnsub) steamGamesUnsub();
    if (nonSteamGamesUnsub) nonSteamGamesUnsub();
    if (hiddenGameIdsUnsub) hiddenGameIdsUnsub();
    if (showHiddenUnsub) showHiddenUnsub();
    if (selectedPlatformUnsub) selectedPlatformUnsub();
  });
</script>

<Pane minSize={20}>
  <SectionTitle title="Games" />

  <div class="content">
    <div style="margin-left: 6px; display: flex; justify-content: space-between;">
      <Toggle label="Show hidden" bind:checked={$showHidden}/>
      <SearchBar label="Search Library" onChange={onSearchChange} interval={800} />
    </div>
    
    <div class="border" />
    <VerticalSpacer />
  </div>

  <div class="content" style="height: calc(100% - 85px);">
    <ListTabs tabs={Object.values(Platforms)} height="calc(100% - 45px)" bind:selected={$currentPlatform}>
      <div class="grids-cont">
        <VerticalSpacer />
        <VerticalSpacer />
        
        {#if isLoading || $loadingGames}
          <div class="loader-container">
            <LoadingSpinner />
          </div>
        {:else}
          {#if games.length > 0}
            <div class="game-grid" style="--img-width: {widths[$gridType] + padding}px; --img-height: {heights[$gridType] + padding + 18}px;">
              {#each games as game (`${$currentPlatform}|${game.appid}|${game.name}`)}
                <Game game={game} widths={widths} heights={heights} />
              {/each}
            </div>
          {:else}
            <div class="message">
              No {$currentPlatform} games found.
            </div>
          {/if}
        {/if}
        
        <VerticalSpacer />
        <VerticalSpacer />
      </div>
    </ListTabs>
  </div>
</Pane>

<style>
  :root {
    --img-width: 100px;
    --img-height: 150px;
  }
  .content {
    margin: 0px 6px;
    padding: 0px 6px;
    overflow: auto;
    max-height: calc(100% - 65px)
  }

  .grids-cont {
    height: 100%;
    width: 100%;
    overflow: auto;
  }

  .game-grid {
    width: 100%;
    display: grid;
    
    grid-template-columns: repeat(auto-fit, var(--img-width));
    row-gap: 15px;
    column-gap: 30px;
    grid-auto-flow: row;
    grid-auto-rows: var(--img-height);

    justify-content: center;
  }

  .border {
    margin-top: 7px;
    border-bottom: 1px solid var(--foreground);
  }

  .message {
    width: 100%;
    text-align: center;
    opacity: 0.1;
    padding-top: 40px;
  }

  .loader-container {
    width: 100%;
    padding-top: 14px;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>