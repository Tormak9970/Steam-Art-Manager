<script lang="ts">
  import { AppController } from "../../../lib/controllers/AppController";
  import type { SGDBImage } from "../../../lib/models/SGDB";
  import { dbFilters, gridType, GridTypes, isOnline, needsSGDBAPIKey, selectedGameAppId, selectedGameName, steamGridDBKey, type DBFilters, selectedSteamGridGameId, customGameNames, steamGames, nonSteamGames, lastPageCache, hasMorePagesCache } from "../../../stores/AppState";
  import Grid from "./Grid.svelte";
  import { filterGrids, getHasMorePages, getPageNumberForGame } from "../../../lib/utils/Utils";
  import GridLoadingSkeleton from "../../layout/GridLoadingSkeleton.svelte";
  import PaddedScrollContainer from "../../layout/PaddedScrollContainer.svelte";
  import { SMALL_GRID_DIMENSIONS } from "../../../lib/utils/ImageConstants";
  import InfiniteScroll from "../../layout/pagination/InfiniteScroll.svelte";
  import { onMount } from "svelte";
  
  const padding = 20;

  let isLoading = true;
  export let hasCustomName: boolean;

  let hasMorePages = getHasMorePages($selectedSteamGridGameId, $gridType);
  let grids: SGDBImage[] = [];

  /**
   * Filters the grids based when relevant state changes.
   * @param resultsPage The results page to show.
   * @param isCustomName Whether the app name is custom or not.
   */
  async function filterGridsOnStateChange(resultsPage: number, isCustomName: boolean = false): Promise<void> {
    if ($isOnline && $steamGridDBKey !== "" && !!$selectedGameAppId) {
      const unfilteredGrids = await AppController.getSteamGridArt($selectedGameAppId, resultsPage, $selectedSteamGridGameId, isCustomName);
      grids = filterGrids(unfilteredGrids, $gridType, $dbFilters, $selectedGameName);
    }
  }

  /**
   * Handles loading new grids when the user scrolls to the bottom.
   */
  async function handleLoadOnScroll() {
    const lastPageLoaded = getPageNumberForGame($selectedSteamGridGameId, $gridType);
    const oldGridsLength = grids.length;
    await filterGridsOnStateChange(lastPageLoaded + 1, hasCustomName);
    
    if (oldGridsLength !== grids.length) {
      lastPageCache[parseInt($selectedSteamGridGameId)][$gridType] = lastPageLoaded + 1;
    } else {
      hasMorePagesCache[parseInt($selectedSteamGridGameId)][$gridType] = false;
      hasMorePages = false;
    }
  }

  onMount(() => {
    console.log("mounting grid results...");
    filterGridsOnStateChange(getPageNumberForGame($selectedSteamGridGameId, $gridType), hasCustomName).then(() => {
      isLoading = false;
    });
  });
</script>

<PaddedScrollContainer height={"calc(100% - 7px)"} width={"100%"} background={"transparent"} loading={isLoading} marginTop="0px">
  {#if isLoading}
    <div class="game-grid" style="--img-width: {SMALL_GRID_DIMENSIONS.widths[$gridType] + padding}px; --img-height: {SMALL_GRID_DIMENSIONS.heights[$gridType] + padding + 18}px;">
      {#each new Array(100) as _}
        <GridLoadingSkeleton />
      {/each}
    </div>
  {:else}
    {#if $isOnline}
      {#if !$needsSGDBAPIKey}
        {#if !!$selectedGameAppId}
          {#if grids.length > 0}
            <div class="game-grid" style="--img-width: {SMALL_GRID_DIMENSIONS.widths[$gridType] + padding}px; --img-height: {SMALL_GRID_DIMENSIONS.heights[$gridType] + padding + 18}px;">
              {#each grids as grid (`${$selectedSteamGridGameId}|${grid.id}|${$gridType}`)}
                <Grid grid={grid} />
              {/each}
            </div>
          {:else}
            <div class="message">
              No results for {$gridType === GridTypes.HERO ? "Heroe" : $gridType}s for "{$selectedGameName}".
            </div>
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
  {/if}
  <InfiniteScroll
    hasMore={hasMorePages}
    threshold={100}
    on:loadMore={handleLoadOnScroll}
  />
</PaddedScrollContainer>

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

  .message {
    width: 100%;
    text-align: center;
    opacity: 0.5;
    padding-top: 40px;
  }
</style>