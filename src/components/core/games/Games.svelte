<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import { gridType, hiddenGameIds, showHidden, steamGames } from "../../../Stores";
  import Toggle from "../../interactables/Toggle.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import Game from "./Game.svelte";

  let steamGamesUnsub: Unsubscriber;
  let hiddenGameIdsUnsub: Unsubscriber;
  let showHiddenUnsub: Unsubscriber

  const padding = 20;

  const widths = {
    "Grids": 100,
    "Heros": 353,
    "Logos": 200,
    "Icons": 60,
  };

  const heights = {
    "Grids": 150,
    "Heros": 114,
    "Logos": 134,
    "Icons": 60,
  };

  let games: SteamGame[] = [];

  onMount(() => {
    steamGamesUnsub = steamGames.subscribe((stGames) => {
      games = $showHidden ? stGames : stGames.filter((game) => !$hiddenGameIds.includes(game.appid));
    });
    hiddenGameIdsUnsub = hiddenGameIds.subscribe((ids) => {
      games = $showHidden ? $steamGames : games.filter((game) => !ids.includes(game.appid));
    });
    showHiddenUnsub = showHidden.subscribe((show) => {
      games = show ? $steamGames : games.filter((game) => !$hiddenGameIds.includes(game.appid));
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

  <div class="content" style="margin-left: 12px;">
    <Toggle label="Show hidden" bind:checked={$showHidden}/>
    
    <VerticalSpacer />
  </div>

  <div class="content">
    <VerticalSpacer />
    <VerticalSpacer />

    {#if $steamGames.length == 0}
      <!-- TODO: loading spinner -->
    {:else}
      <div class="game-grid" style="--img-width: {widths[$gridType] + padding}px; --img-height: {heights[$gridType] + padding + 18}px;">
        {#each games as game, i (`${i}|${game.appid}`)}
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
    
    grid-template-columns: repeat(auto-fill, var(--img-width));
    gap: 15px;
    grid-auto-flow: row;
    grid-auto-rows: var(--img-height);
  }
</style>