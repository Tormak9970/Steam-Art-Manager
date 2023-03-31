<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import { gridType, hiddenGameIds, showHidden, steamGames } from "../../../Stores";
  import LoadingSpinner from "../../info/LoadingSpinner.svelte";
  import SearchBar from "../../interactables/SearchBar.svelte";
  import Toggle from "../../interactables/Toggle.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import Game from "./Game.svelte";

  let steamGamesUnsub: Unsubscriber;
  let hiddenGameIdsUnsub: Unsubscriber;
  let showHiddenUnsub: Unsubscriber

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
  let games: SteamGame[] = [];

  const filterSteamGames = (allGames: SteamGame[], hiddenIds: number[], hidden: boolean) => (hidden ? allGames : allGames.filter((game) => !hiddenIds.includes(game.appid))).filter((game) => game.name.toLowerCase().includes(searchQuery));

  function onSearchChange(query: string) {
    searchQuery = query.toLowerCase();
    games = filterSteamGames($steamGames, $hiddenGameIds, $showHidden);
  }

  onMount(() => {
    steamGamesUnsub = steamGames.subscribe((stGames) => {
      games = filterSteamGames(stGames, $hiddenGameIds, $showHidden);
    });
    hiddenGameIdsUnsub = hiddenGameIds.subscribe((ids) => {
      games = filterSteamGames($steamGames, ids, $showHidden);
    });
    showHiddenUnsub = showHidden.subscribe((show) => {
      games = filterSteamGames($steamGames, $hiddenGameIds, show);
    });
  });

  onDestroy(() => {
    if (steamGamesUnsub) steamGamesUnsub();
    if (hiddenGameIdsUnsub) hiddenGameIdsUnsub();
    if (showHiddenUnsub) showHiddenUnsub();
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

  <div class="content">
    <VerticalSpacer />
    <VerticalSpacer />

    {#if $steamGames.length == 0}
      <div class="loader-container">
        <LoadingSpinner />
      </div>
    {:else}
      <div class="game-grid" style="--img-width: {widths[$gridType] + padding}px; --img-height: {heights[$gridType] + padding + 18}px;">
        {#each games as game (`${game.appid}`)}
          <Game game={game} widths={widths} heights={heights} />
        {/each}
      </div>
    {/if}
    
    <VerticalSpacer />
    <VerticalSpacer />
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

  .loader-container {
    width: 100%;
    padding-top: 14px;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>