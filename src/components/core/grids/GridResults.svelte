<script lang="ts">
  import { AppController } from "@controllers";
  import { scrollShadow } from "@directives";
  import { GridLoadingSkeleton, InfiniteScroll } from "@layout";
  import { dbFilters, gridType, hasMorePagesCache, isOnline, loadingSettings, needsSGDBAPIKey, selectedGameAppId, selectedGameName, selectedSteamGridGameId, steamGridDBKey, steamGridSearchCache } from "@stores/AppState";
  import { GridTypes, type SGDBImage } from "@types";
  import { debounce, filterGrids, SMALL_GRID_DIMENSIONS } from "@utils";
  import { onMount } from "svelte";
  import Grid from "./Grid.svelte";
  
  const padding = 20;

  export let hasCustomName: boolean;

  let gridsContainer: HTMLDivElement;

  let isLoading = true;
  let grids: SGDBImage[] = [];

  $: hasMore = $hasMorePagesCache[$selectedSteamGridGameId][$gridType];

  $: searchCache = $steamGridSearchCache[$selectedGameAppId]!;

  /**
   * Handles loading new grids when the user scrolls to the bottom.
   */
  async function handleLoadOnScroll() {
    if ($isOnline && $steamGridDBKey !== "" && !!$selectedGameAppId) {
      const unfilteredGrids = await AppController.getSteamGridArt($selectedGameAppId, $selectedSteamGridGameId, false);
      grids = filterGrids(unfilteredGrids, $gridType, $dbFilters, $selectedGameName);
    }
  }

  async function handleResize(isOverflowing: boolean) {
    if (gridsContainer && !isOverflowing) {
      handleLoadOnScroll();
    }
  }
  const debouncedResize = debounce(handleResize, 500);

  onMount(() => {
    if ($selectedGameAppId) {
      if ($selectedSteamGridGameId === "None") {
        AppController.chooseSteamGridGameId($selectedGameAppId, hasCustomName).then((sgdbGameId) => {
          $selectedSteamGridGameId = sgdbGameId;
        });
      } else {
        handleLoadOnScroll().then(() => {
          isLoading = false;
        });
      }
    }
  });
</script>

<svelte:document on:resize={debouncedResize} />

<div class="scroll-container" use:scrollShadow={{ background: "--background-dark"}}>
  {#if !$loadingSettings}
    {#if $isOnline}
      {#if !$needsSGDBAPIKey}
        {#if !!$selectedGameAppId}
          {#if isLoading}
            <div class="game-grid" style="--img-width: {SMALL_GRID_DIMENSIONS.widths[$gridType] + padding}px; --img-height: {SMALL_GRID_DIMENSIONS.heights[$gridType] + padding + 18}px;">
              {#each new Array(100) as _}
                <GridLoadingSkeleton />
              {/each}
            </div>
          {:else}
            {#if grids.length > 0}
              <div bind:this={gridsContainer} class="game-grid" style="--img-width: {SMALL_GRID_DIMENSIONS.widths[$gridType] + padding}px; --img-height: {SMALL_GRID_DIMENSIONS.heights[$gridType] + padding + 18}px;">
                {#each grids as grid (`${$selectedSteamGridGameId}|${grid.id}|${$gridType}`)}
                  <Grid grid={grid} />
                {/each}
              </div>
            {:else}
              <div class="message">
                No results for {$gridType === GridTypes.HERO ? "Heroe" : $gridType}s for "{searchCache.find((game) => game.id.toString() === $selectedSteamGridGameId)?.name ?? "Unkown"}".
              </div>
            {/if}
          {/if}
        {:else}
          <div class="message">
            Select a game to start managing your art!
          </div>
        {/if}
      {:else}
        <div class="message">
          Please set your API key to use SteamGridDB.
        </div>
      {/if}
    {:else}
      <div class="message">
        You're currently offline. In order to go online and access SteamGridDB, try hitting the "Go Online" button below.
      </div>
    {/if}
  {:else}
    <div class="message">
      Initializing...
    </div>
  {/if}
  <InfiniteScroll
    hasMore={hasMore}
    threshold={100}
    on:loadMore={handleLoadOnScroll}
  />
</div>

<style>
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
  
  .scroll-container {
    height: 100%;
    width: 100%;

    overflow: auto;
  }

  .message {
    width: 100%;
    text-align: center;
    opacity: 0.5;
    padding-top: 40px;
  }
</style>