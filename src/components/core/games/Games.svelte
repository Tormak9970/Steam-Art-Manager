<script lang="ts">
  import { onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import { gridType, hiddenGames, steamGames } from "../../../Stores";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import Game from "./Game.svelte";

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

  let gameIds = [];
  let hiddenIds = [];

  onMount(() => {
    steamGames.subscribe((games) => {
      gameIds = Object.keys(games);
    });
    hiddenGames.subscribe((games) => {
      hiddenIds = Object.keys(games);
    });
  });
</script>

<Pane minSize={20}>
  <SectionTitle title="Games" />

  <div class="content">
    {#if $steamGames.length == 0}
      <!-- TODO: loading spinner -->
    {:else}
      <div class="game-grid" style="--img-width: {widths[$gridType] + padding}px; --img-height: {heights[$gridType] + padding + 18}px;">
        {#each gameIds.filter((id) => !hiddenIds.includes(id)) as appid}
          <Game game={$steamGames[appid]} widths={widths} heights={heights} />
        {/each}
      </div>
    {/if}
    
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
    overflow: auto;
    max-height: calc(100% - 45px)
  }

  .game-grid {
    width: 100%;
    display: grid;
    
    grid-template-columns: repeat(auto-fill, var(--img-width));
    gap: 10px;
    grid-auto-flow: row;
    grid-auto-rows: var(--img-height);
  }
</style>