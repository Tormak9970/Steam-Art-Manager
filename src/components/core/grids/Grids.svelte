<script lang="ts">
  import { dialog } from "@tauri-apps/api";
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import { AppController } from "../../../lib/controllers/AppController";
  import type { SGDBGame, SGDBImage } from "../../../lib/models/SGDB";
  import { dbFilters, gridType, GridTypes, isOnline, needsSGDBAPIKey, selectedGameAppId, selectedGameName, steamGridDBKey, type DBFilters, currentPlatform, selectedSteamGridGameId, steamGridSearchCache, Platforms, selectedResultPage, showLogoPositionModal, appLibraryCache, manualSteamGames } from "../../../Stores";
  import LoadingSpinner from "../../info/LoadingSpinner.svelte";
  import HorizontalSpacer from "../../spacers/HorizontalSpacer.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import Grid from "./Grid.svelte";
  import DropDown from "../../interactables/DropDown.svelte";
  import { heights, widths } from "../imageDimensions";
  import Pages from "../../layout/pagination/Pages.svelte";
  import IconButton from "../../interactables/IconButton.svelte";
  import { filterGrids } from "../../../lib/utils/Utils";
  import Divider from "../Divider.svelte";
  import { scrollShadow } from "../../directives/scrollShadow";
  
  let overflowContainer: HTMLDivElement;
  let scrollTarget: HTMLDivElement;

  let steamGridSearchCacheUnsub: Unsubscriber;
  let manualGamesUnsub: Unsubscriber;
  let selectedPlatformUnsub: Unsubscriber;
  let selectedAppIdUnsub: Unsubscriber;
  let dbFiltersUnsub: Unsubscriber;
  let sgdbPageUnsub: Unsubscriber;
  let gridTypeUnsub: Unsubscriber;
  let onlineUnsub: Unsubscriber;
  let apiKeyUnsub: Unsubscriber;

  const padding = 20;
  let oldSelectedGameId = null;

  /**
   * Filters the grids based on the user's chosen filters.
   * @param allGrids The list of all grids.
   * @param type The selected GridType.
   * @param filters The filters object.
   * @returns The list of filtered grids.
   */
  function filterGridsWrapper(allGrids: SGDBImage[], type: GridTypes, filters: DBFilters): SGDBImage[] {
    return filterGrids(allGrids, type, filters, $selectedGameName);
  }

  let isLoading = false;
  let availableSteamGridGames = [{ label: "None", data: "None"}];
  let steamGridTypes = Object.values(GridTypes).map((gridType) => { return { label: gridType, data: gridType }});
  let grids: SGDBImage[] = [];
  let numPages = 1;

  /**
   * Prompts the user to select their custom game art.
   */
  async function prompUserForArt() {
    const path = await dialog.open({
      title: "Select your game art",
      filters: [
        {
          name: "images",
          extensions: [
            "jpg",
            "png",
            "webp",
            "ico"
          ]
        },
        {
          name: "animated",
          extensions: [
            "gif",
            "webm"
          ]
        }
      ],
      multiple: false
    });
    if (path && path != "") AppController.setCustomArt(path as string);
  }

  /**
   * Refilters the grids when the selected SGDB game changes.
   * @param id The id of the game.
   */
  async function onSgdbGameChange(id: string) {
    if ($isOnline && $steamGridDBKey != "" && $selectedGameAppId != null && oldSelectedGameId != id) {
      grids = filterGridsWrapper(await AppController.getSteamGridArt($selectedGameAppId, $selectedResultPage, id), $gridType, $dbFilters);
      numPages = $steamGridSearchCache[$selectedGameAppId]?.find((game) => game.id.toString() == id)?.numResultPages ?? 3;
    }
    
    oldSelectedGameId = id;
  }
  
  /**
   * Updates the available SGDB games dropdown when related state changes.
   * @param searchCache The SGDB game search cache.
   * @param selectedAppId The selected game's appid.
   */
  function setAvailableSgdbGamesOnStateChange(searchCache: { [appid: number]: SGDBGame[] }, selectedAppId: number): void {
    if (($currentPlatform == Platforms.STEAM || $currentPlatform == Platforms.NON_STEAM) && $selectedGameName && searchCache[selectedAppId]) {
      availableSteamGridGames = Object.values(searchCache[selectedAppId]).map((value) => {
        return {
          "label": value.name,
          "data": value.id.toString()
        }
      });
      
      numPages = searchCache[selectedAppId]?.find((game) => game.id.toString() == $selectedSteamGridGameId)?.numResultPages ?? 3;
    }
  }

function resetGridStores(): void {
  availableSteamGridGames = [{ label: "None", data: "None"}];
  $selectedGameAppId = null;
  $selectedGameName = null;
  $selectedSteamGridGameId = "None";
  grids = [];
}

  /**
   * Filters the grids based when relevant state changes.
   * @param sgdbApiKey The user's SGDB API key.
   * @param online Whether the user is online.
   * @param selectedAppId The selected game's appid.
   * @param selectedGridType The selected gridType.
   * @param resultsPage The results page to show.
   * @param filters The user's selected grid filters.
   */
  async function filterGridsOnStateChange(sgdbApiKey: string, online: boolean, selectedAppId: number, selectedGridType: GridTypes, resultsPage: number, filters: DBFilters): Promise<void> {
    if (online && sgdbApiKey != "" && selectedAppId != null) {
      const unfilteredGrids = await AppController.getSteamGridArt(selectedAppId, resultsPage, $selectedSteamGridGameId);
      grids = filterGridsWrapper(unfilteredGrids, selectedGridType, filters);
    }
  }

  onMount(() => {
    steamGridSearchCacheUnsub = steamGridSearchCache.subscribe((searchCache) => {
      isLoading = true;
      setAvailableSgdbGamesOnStateChange(searchCache, $selectedGameAppId);
      isLoading = false;
    });

    manualGamesUnsub = manualSteamGames.subscribe((games) => {
      if ($selectedGameAppId && !games.find((game) => game.appid == $selectedGameAppId)) {
        isLoading = true;
        resetGridStores();
        isLoading = false;
      }
    });

    selectedPlatformUnsub = currentPlatform.subscribe((platform) => {
      isLoading = true;
      resetGridStores();
      isLoading = false;
    });
    selectedAppIdUnsub = selectedGameAppId.subscribe(async (id) => {
      isLoading = true;
      $selectedSteamGridGameId = "None";
      await filterGridsOnStateChange($steamGridDBKey, $isOnline, id, $gridType, $selectedResultPage, $dbFilters);
      
      setAvailableSgdbGamesOnStateChange($steamGridSearchCache, id);

      isLoading = false;
    });
    onlineUnsub = isOnline.subscribe(async (online) => {
      isLoading = true;
      await filterGridsOnStateChange($steamGridDBKey, online, $selectedGameAppId, $gridType, $selectedResultPage, $dbFilters);
      isLoading = false;
    });
    sgdbPageUnsub = selectedResultPage.subscribe(async (page) => {
      isLoading = true;
      await filterGridsOnStateChange($steamGridDBKey, $isOnline, $selectedGameAppId, $gridType, page, $dbFilters);
      isLoading = false;
    });
    gridTypeUnsub = gridType.subscribe(async (type) => {
      isLoading = true;
      await filterGridsOnStateChange($steamGridDBKey, $isOnline, $selectedGameAppId, type, $selectedResultPage, $dbFilters);
      isLoading = false;
    });
    apiKeyUnsub = steamGridDBKey.subscribe(async (key) => {
      isLoading = true;
      if (key != "" && AppController.sgdbClientInitialized()) {
        await filterGridsOnStateChange(key, $isOnline, $selectedGameAppId, $gridType, $selectedResultPage, $dbFilters);
      } else {
        resetGridStores();
      }
      isLoading = false;
    });
    dbFiltersUnsub = dbFilters.subscribe(async (filters) => {
      isLoading = true;
      await filterGridsOnStateChange($steamGridDBKey, $isOnline, $selectedGameAppId, $gridType, $selectedResultPage, filters);
      isLoading = false;
    });
  });

  onDestroy(() => {
    if (steamGridSearchCacheUnsub) steamGridSearchCacheUnsub();
    if (manualGamesUnsub) manualGamesUnsub();
    if (selectedPlatformUnsub) selectedPlatformUnsub();
    if (selectedAppIdUnsub) selectedAppIdUnsub();
    if (dbFiltersUnsub) dbFiltersUnsub();
    if (gridTypeUnsub) gridTypeUnsub();
    if (onlineUnsub) onlineUnsub();
    if (apiKeyUnsub) apiKeyUnsub();
  });
</script>

<Pane minSize={20}>
  <SectionTitle title="Grids" />

  <div class="content" style="position: relative; z-index: 2; overflow: initial;">
    <div style="margin-left: 6px; display: flex; justify-content: space-between;">
      <DropDown label="Browsing" options={availableSteamGridGames} onChange={onSgdbGameChange} width={"130px"} bind:value={$selectedSteamGridGameId} />

      <DropDown label="Type" options={steamGridTypes} onChange={() => {}} width={"130px"} showTooltip={false} bind:value={$gridType} />
      <HorizontalSpacer />

      <div class="buttons-cont">
        <IconButton label="Set Logo Position" onClick={() => { $showLogoPositionModal = true; }} width="auto" disabled={$selectedGameAppId == null || !$appLibraryCache[$selectedGameAppId]?.Logo}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="height: 14px; width: 14px;">
            <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"/>
          </svg>
        </IconButton>
        <HorizontalSpacer />

        <IconButton label="Upload Your Own Art!" onClick={prompUserForArt} width="auto" disabled={$selectedGameAppId == null}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 12px; width: 12px;">
            <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM385 231c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-71-71V376c0 13.3-10.7 24-24 24s-24-10.7-24-24V193.9l-71 71c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9L239 119c9.4-9.4 24.6-9.4 33.9 0L385 231z"/>
          </svg>
        </IconButton>
      </div>
    </div>
    
    <Divider marginTop={"7px"} />
    <VerticalSpacer />
  </div>

  <div class="content" style="height: calc(100% - 85px);position: relative; z-index: 1;">
    {#if $isOnline}
      {#if !$needsSGDBAPIKey}
        {#if $selectedGameAppId != null}
          <Pages numPages={numPages} height="calc(100% - 47px)" bind:selected={$selectedResultPage}>
            <div class="overflow-shadow-container" bind:this={overflowContainer}>
              <div class="grids-cont" use:scrollShadow={{ target: scrollTarget, container: overflowContainer, heightBump: 0 }}>
                {#if isLoading}
                  <div class="loader-container">
                    <LoadingSpinner />
                  </div>
                {:else}
                  {#if grids.length > 0}
                    <div class="game-grid" style="--img-width: {widths[$gridType] + padding}px; --img-height: {heights[$gridType] + padding + 18}px;" bind:this={scrollTarget}>
                      {#each grids as grid (`${$selectedSteamGridGameId}|${grid.id}|${$gridType}`)}
                        <Grid grid={grid} />
                      {/each}
                    </div>
                  {:else}
                    <div class="message">
                      No results for {$gridType == GridTypes.HERO ? "Heroe" : $gridType}s for "{$selectedGameName}".
                    </div>
                  {/if}
                {/if}
              </div>
            </div>
          </Pages>
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
  </div>
</Pane>

<style>
  .content {
    margin: 0px 6px;
    padding: 0px 6px;
    overflow: auto;
    max-height: calc(100% - 65px);
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

    padding: 14px 0px;
  }

  .message {
    width: 100%;
    text-align: center;
    opacity: 0.5;
    padding-top: 40px;
  }

  .loader-container {
    width: 100%;
    padding-top: 14px;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .buttons-cont {
    display: flex;
  }
</style>