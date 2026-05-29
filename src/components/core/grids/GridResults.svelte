<script lang="ts">
  import { CacheController } from "@controllers";
  import { scrollShadow } from "@directives";
  import { GridLoadingSkeleton, Paginator } from "@layout";
  import { currentPlatform, dbFilters, gridType, selectedGameAppId, selectedGameName, selectedSteamGridGameId, showCachedGrids, userSelectedGrids, type DBFilters } from "@stores/AppState";
  import { GridTypes, type SGDBImage } from "@types";
  import { SMALL_GRID_DIMENSIONS } from "@utils";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import Grid from "./Grid.svelte";
  
  const padding = 1.25;
  const heightOffset = 1.125;

  export let hasCustomName: boolean;

  let isLoading = true;
  let totalGrids: number = 0;
  const currentPage = writable<number>(0);
  let grids: SGDBImage[] = [];

  $: selectedGameGrids = $userSelectedGrids?.[$selectedGameAppId]?.[$gridType] ?? [];

  console.log(selectedGameGrids)

  /**
   * Handles loading new grids when the user scrolls to the bottom.
   */
  function fetchGrids(gameId:string, page: number, filters: DBFilters) {
    if (gameId !== "None") {
      isLoading = true
      CacheController.fetchGrids($selectedGameAppId, true, gameId, page, filters).then((unfilteredGrids) => {
        totalGrids = unfilteredGrids.total
        grids = unfilteredGrids.images
        isLoading = false
      })
    }
  }

  $: fetchGrids($selectedSteamGridGameId, $currentPage, $dbFilters)

  onMount(() => {
    if ($selectedSteamGridGameId === "None") {
      CacheController.chooseSteamGridGameId($selectedGameAppId, $selectedGameName, $currentPlatform, true, hasCustomName).then((sgdbGameId) => {
        $selectedSteamGridGameId = sgdbGameId;
      });
    }
  });
</script>

<div class="page-container">
  <div class="scroll-wrapper">
    <div class="scroll-container" use:scrollShadow={{ background: "--background-dark"}}>
      {#if isLoading}
        <div class="game-grid" style="--img-width: {SMALL_GRID_DIMENSIONS.widths[$gridType] + padding}rem; --img-height: {SMALL_GRID_DIMENSIONS.heights[$gridType] + padding + heightOffset}rem;">
          {#each new Array(100) as _}
            <GridLoadingSkeleton />
          {/each}
        </div>
      {:else}
        {#if $showCachedGrids}
          {#if selectedGameGrids.length > 0}
            <div class="game-grid" style="--img-width: {SMALL_GRID_DIMENSIONS.widths[$gridType] + padding}rem; --img-height: {SMALL_GRID_DIMENSIONS.heights[$gridType] + padding + heightOffset}rem;">
              {#each selectedGameGrids as grid (`${$selectedSteamGridGameId}|${grid.id}|${$gridType}`)}
                <Grid grid={grid} />
              {/each}
            </div>
          {:else}
            <div class="message">
              No previously selected {$gridType === GridTypes.HERO ? "Heroe" : $gridType}s were found.
            </div>
          {/if}
        {:else}
          {#if grids.length > 0}
            <div class="game-grid" style="--img-width: {SMALL_GRID_DIMENSIONS.widths[$gridType] + padding}rem; --img-height: {SMALL_GRID_DIMENSIONS.heights[$gridType] + padding + heightOffset}rem;">
              {#each grids as grid (`${$selectedSteamGridGameId}|${grid.id}|${$gridType}`)}
                <Grid grid={grid} />
              {/each}
            </div>
          {:else}
            <div class="message">
              No results for {$gridType === GridTypes.HERO ? "Heroe" : $gridType}s were found with your filters.
            </div>
          {/if}
        {/if}
      {/if}
    </div>
  </div>
  <Paginator bind:currentPage={$currentPage} totalResults={totalGrids} resultsPerPage={CacheController.SGDB_GRID_RESULT_LIMIT} disabled={$showCachedGrids} />
</div>

<style>
  .page-container {
    height: 100%;
    width: 100%;
  }

  .scroll-wrapper {
    height: calc(100% - 5rem);
    width: 100%;

    position: relative;
  }
  
  .game-grid {
    width: 100%;
    display: grid;
    
    grid-template-columns: repeat(auto-fit, var(--img-width));
    row-gap: 1rem;
    column-gap: 1rem;
    grid-auto-flow: row;
    grid-auto-rows: var(--img-height);

    justify-content: center;
  }
  
  .scroll-container {
    height: 100%;
    width: 100%;

    overflow: auto;
  }

  .message {
    width: 100%;
    text-align: center;
    opacity: 0.5;
    padding-top: 3.25rem;
  }
</style>