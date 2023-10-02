<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import { Platforms, currentPlatform, gridType, hiddenGameIds, loadingGames, manualSteamGames, nonSteamGames, showHidden, steamGames } from "../../../stores/AppState";
  import SearchBar from "../../interactables/SearchBar.svelte";
  import Toggle from "../../interactables/Toggle.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import Game from "./Game.svelte";
  import ListTabs from "../../layout/tabs/ListTabs.svelte";
  import { heights, widths } from "../imageDimensions";
  import Divider from "../Divider.svelte";
  import GridLoadingSkeleton from "../../layout/GridLoadingSkeleton.svelte";
  import Spacer from "../../layout/Spacer.svelte";
  import PaddedScrollContainer from "../../layout/PaddedScrollContainer.svelte";

  let steamGamesUnsub: Unsubscriber;
  let manualSteamGamesUnsub: Unsubscriber;
  let nonSteamGamesUnsub: Unsubscriber;
  let hiddenGameIdsUnsub: Unsubscriber;
  let showHiddenUnsub: Unsubscriber
  let selectedPlatformUnsub: Unsubscriber;

  let isLoading = true;

  const padding = 20;

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

    return selectedGames.filter((game) => game.name.toLowerCase().includes(searchQuery));
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

<Pane minSize={20}>
  <SectionTitle title="Games" />

  <div class="content">
    <div style="margin-left: 6px; display: flex; justify-content: space-between;">
      <Toggle label="Show hidden" bind:value={$showHidden}/>
      <SearchBar label="Search Library" onChange={onSearchChange} interval={800} bind:setSearchFocus={setSearchFocus} />
    </div>
    
    <Divider marginTop={"7px"} />
    <Spacer orientation="VERTICAL" />
  </div>

  <div class="content" style="height: calc(100% - 85px);">
    <ListTabs tabs={Object.values(Platforms)} height="calc(100% - 45px)" bind:selected={$currentPlatform}>
      <PaddedScrollContainer height={"calc(100% - 7px)"} width={"100%"} background={"transparent"} loading={isLoading || $loadingGames} marginTop="0px">
        {#if isLoading || $loadingGames}
          <div class="game-grid" style="--img-width: {widths[$gridType] + padding}px; --img-height: {heights[$gridType] + padding + 18}px;">
            {#each new Array(100) as _}
              <GridLoadingSkeleton />
            {/each}
          </div>
        {:else}
          {#if games.length > 0}
            <div class="game-grid" style="--img-width: {widths[$gridType] + padding}px; --img-height: {heights[$gridType] + padding + 18}px;">
              {#each games as game (`${$currentPlatform}|${game.appid}|${game.name}`)}
                <Game game={game} />
              {/each}
            </div>
          {:else}
            <div class="message">
              No {$currentPlatform} games found.
            </div>
          {/if}
        {/if}
      </PaddedScrollContainer>
    </ListTabs>
  </div>
</Pane>

<style>
  :root {
    --img-width: 100px;
    --img-height: 150px;
  }
  .content {
    padding: 0px 6px;
    max-height: calc(100% - 65px)
  }

  .game-grid {
    width: 100%;
    display: grid;
    
    grid-template-columns: repeat(auto-fit, var(--img-width));
    row-gap: 15px;
    column-gap: 15px;
    grid-auto-flow: row;
    grid-auto-rows: var(--img-height);

    justify-content: center;
  }

  .message {
    width: 100%;
    text-align: center;
    opacity: 0.5;
    padding-top: 40px;
  }
</style>