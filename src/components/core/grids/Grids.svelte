<script lang="ts">
  import { dialog } from "@tauri-apps/api";
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import { AppController } from "../../../lib/controllers/AppController";
  import type { SGDBGame, SGDBImage } from "../../../lib/models/SGDB";
  import { dbFilters, gridType, GridTypes, isOnline, needsSGDBAPIKey, selectedGameAppId, selectedGameName, steamGridDBKey, type DBFilters, currentPlatform, selectedSteamGridGameId, steamGridSearchCache, Platforms, selectedResultPage, appLibraryCache, manualSteamGames, customGameNames, steamGames, nonSteamGames, gridsSize } from "../../../stores/AppState";
  import SectionTitle from "../SectionTitle.svelte";
  import Grid from "./Grid.svelte";
  import DropDown from "../../interactables/DropDown.svelte";
  import { heights, widths } from "../imageDimensions";
  import Pages from "../../layout/pagination/Pages.svelte";
  import IconButton from "../../interactables/IconButton.svelte";
  import { debounce, filterGrids } from "../../../lib/utils/Utils";
  import Divider from "../Divider.svelte";
  import { showLogoPositionModal } from "../../../stores/Modals";
  import GridLoadingSkeleton from "../../layout/GridLoadingSkeleton.svelte";
  import { SettingsManager } from "../../../lib/utils/SettingsManager";
  import Spacer from "../../layout/Spacer.svelte";
  import PaddedScrollContainer from "../../layout/PaddedScrollContainer.svelte";

  let windowWidth: number;
  let skipUpdate = false;

  let steamGridSearchCacheUnsub: Unsubscriber;
  let manualGamesUnsub: Unsubscriber;
  let customGameNamesUnsub: Unsubscriber;
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
  let availableSteamGridGames = [ { label: "None", data: "None" } ];
  let steamGridTypes = Object.values(GridTypes).map((gridType) => { return { label: gridType, data: gridType }});
  let grids: SGDBImage[] = [];
  let numPages = 1;
  let hasCustomName = !!$customGameNames[$selectedGameAppId];
  $: originalName = ($steamGames.find((game) => game.appid === $selectedGameAppId) ?? $nonSteamGames.find((game) => game.appid === $selectedGameAppId))?.name;


  /**
   * Handles when the user changes the custom game name
   */
  async function handleCustomNameInput(): Promise<void> {
    const res = await AppController.getIdForSearchQuery($selectedGameName);

    if (res) {
      if ($customGameNames[$selectedGameAppId] && res.name === originalName) {
        delete $customGameNames[$selectedGameAppId];
      } else {
        skipUpdate = true;
        $customGameNames[$selectedGameAppId] = res.name;
      }

      $customGameNames = { ...$customGameNames };
      await SettingsManager.updateSetting("customGameNames", $customGameNames);
    }
  }

  /**
   * Prompts the user to select their custom game art.
   */
  async function prompUserForArt(): Promise<void> {
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
    if (path && path !== "") AppController.setCustomArt(path as string);
  }

  /**
   * Refilters the grids when the selected SGDB game changes.
   * @param id The id of the game.
   */
  async function onSgdbGameChange(id: string): Promise<void> {
    if ($isOnline && $steamGridDBKey !== "" && !!$selectedGameAppId && oldSelectedGameId !== id) {
      grids = filterGridsWrapper(await AppController.getSteamGridArt($selectedGameAppId, $selectedResultPage, id, false), $gridType, $dbFilters);
      numPages = $steamGridSearchCache[$selectedGameAppId]?.find((game) => game.id.toString() === id)?.numResultPages ?? 3;
    }
    
    oldSelectedGameId = id;
  }
  
  /**
   * Updates the available SGDB games dropdown when related state changes.
   * @param searchCache The SGDB game search cache.
   * @param selectedAppId The selected game's appid.
   */
  function setAvailableSgdbGamesOnStateChange(searchCache: { [appid: number]: SGDBGame[] }, selectedAppId: number): void {
    if (($currentPlatform === Platforms.STEAM || $currentPlatform === Platforms.NON_STEAM) && $selectedGameName && searchCache[selectedAppId]) {
      availableSteamGridGames = Object.values(searchCache[selectedAppId]).map((value) => {
        return {
          "label": value.name,
          "data": value.id.toString()
        }
      });
      
      numPages = searchCache[selectedAppId]?.find((game) => game.id.toString() === $selectedSteamGridGameId)?.numResultPages ?? 3;
    }
  }

  /**
   * Resets the grid related stores.
   */
  function resetGridStores(): void {
    availableSteamGridGames = [ { label: "None", data: "None" } ];
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
   * @param selectedSGDBId The selected steamGridGameId.
   * @param isCustomName Whether the app name is custom or not.
   */
  async function filterGridsOnStateChange(sgdbApiKey: string, online: boolean, selectedAppId: number, selectedGridType: GridTypes, resultsPage: number, filters: DBFilters, selectedSGDBId: string | null, isCustomName: boolean = false): Promise<void> {
    if (online && sgdbApiKey !== "" && !!$selectedGameAppId) {
      const unfilteredGrids = await AppController.getSteamGridArt(selectedAppId, resultsPage, selectedSGDBId, isCustomName);
      grids = filterGridsWrapper(unfilteredGrids, selectedGridType, filters);
    }
  }

  const debouncedWidthUpdate = debounce(() => windowWidth = window.innerWidth, 50);

  onMount(() => {
    steamGridSearchCacheUnsub = steamGridSearchCache.subscribe((searchCache) => {
      isLoading = true;
      setAvailableSgdbGamesOnStateChange(searchCache, $selectedGameAppId);
      isLoading = false;
    });

    manualGamesUnsub = manualSteamGames.subscribe((games) => {
      if ($selectedGameAppId && !games.find((game) => game.appid === $selectedGameAppId)) {
        isLoading = true;
        resetGridStores();
        isLoading = false;
      }
    });

    customGameNamesUnsub = customGameNames.subscribe(async (customNames) => {
      if (!skipUpdate) {
        if (customNames[$selectedGameAppId] && !hasCustomName) {
          hasCustomName = true;
          $selectedGameName = customNames[$selectedGameAppId];
          delete $steamGridSearchCache[$selectedGameAppId];
          await filterGridsOnStateChange($steamGridDBKey, $isOnline, $selectedGameAppId, $gridType, $selectedResultPage, $dbFilters, null, true);
        } else if (!customNames[$selectedGameAppId] && hasCustomName) {
          hasCustomName = false;
          $selectedGameName = originalName;
          delete $steamGridSearchCache[$selectedGameAppId];
          await filterGridsOnStateChange($steamGridDBKey, $isOnline, $selectedGameAppId, $gridType, $selectedResultPage, $dbFilters, null, true);
        }
      } else {
        skipUpdate = false;
      }
    });

    selectedPlatformUnsub = currentPlatform.subscribe((platform) => {
      isLoading = true;
      resetGridStores();
      isLoading = false;
    });
    selectedAppIdUnsub = selectedGameAppId.subscribe(async (id) => {
      isLoading = true;
      hasCustomName = !!$customGameNames[$selectedGameAppId];
      await filterGridsOnStateChange($steamGridDBKey, $isOnline, id, $gridType, $selectedResultPage, $dbFilters, null, hasCustomName);

      isLoading = false;
    });
    onlineUnsub = isOnline.subscribe(async (online) => {
      isLoading = true;
      await filterGridsOnStateChange($steamGridDBKey, online, $selectedGameAppId, $gridType, $selectedResultPage, $dbFilters, $selectedSteamGridGameId, hasCustomName);
      isLoading = false;
    });
    sgdbPageUnsub = selectedResultPage.subscribe(async (page) => {
      isLoading = true;
      await filterGridsOnStateChange($steamGridDBKey, $isOnline, $selectedGameAppId, $gridType, page, $dbFilters, $selectedSteamGridGameId, hasCustomName);
      isLoading = false;
    });
    gridTypeUnsub = gridType.subscribe(async (type) => {
      isLoading = true;
      await filterGridsOnStateChange($steamGridDBKey, $isOnline, $selectedGameAppId, type, $selectedResultPage, $dbFilters, $selectedSteamGridGameId, hasCustomName);
      isLoading = false;
    });
    apiKeyUnsub = steamGridDBKey.subscribe(async (key) => {
      isLoading = true;
      if (key !== "" && AppController.sgdbClientInitialized()) {
        await filterGridsOnStateChange(key, $isOnline, $selectedGameAppId, $gridType, $selectedResultPage, $dbFilters, $selectedSteamGridGameId, hasCustomName);
      } else {
        resetGridStores();
      }
      isLoading = false;
    });
    dbFiltersUnsub = dbFilters.subscribe(async (filters) => {
      isLoading = true;
      await filterGridsOnStateChange($steamGridDBKey, $isOnline, $selectedGameAppId, $gridType, $selectedResultPage, filters, $selectedSteamGridGameId, hasCustomName);
      isLoading = false;
    });
  });

  onDestroy(() => {
    if (steamGridSearchCacheUnsub) steamGridSearchCacheUnsub();
    if (manualGamesUnsub) manualGamesUnsub();
    if (customGameNamesUnsub) customGameNamesUnsub();
    if (selectedPlatformUnsub) selectedPlatformUnsub();
    if (selectedAppIdUnsub) selectedAppIdUnsub();
    if (dbFiltersUnsub) dbFiltersUnsub();
    if (gridTypeUnsub) gridTypeUnsub();
    if (onlineUnsub) onlineUnsub();
    if (apiKeyUnsub) apiKeyUnsub();
  });
</script>

<svelte:window on:resize={debouncedWidthUpdate} />

<Pane minSize={20} size={$gridsSize}>
  <div class="inner">
    <SectionTitle title="Grids" />

    <div class="content" style="position: relative; z-index: 2; overflow: initial;">
      <div style="margin-left: 6px; display: flex; justify-content: space-between;">
        <div style="display: flex;">
          {#if !windowWidth || windowWidth >= 1265}
            <DropDown label="Browsing" options={availableSteamGridGames} onChange={onSgdbGameChange} width={"130px"} bind:value={$selectedSteamGridGameId} />
          {:else}
            <DropDown options={availableSteamGridGames} onChange={onSgdbGameChange} width={"200px"} bind:value={$selectedSteamGridGameId} />
          {/if}
          <Spacer orientation="HORIZONTAL" />
          <IconButton label="Customize Search" onClick={handleCustomNameInput} tooltipPosition={"top"} disabled={!$selectedGameAppId} height="24px" width="24px">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 14px; width: 14px;">
              <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/>
            </svg>
          </IconButton>
        </div>

        {#if !windowWidth || windowWidth >= 1265}
          <DropDown label="Type" options={steamGridTypes} onChange={() => {}} width={"130px"} showTooltip={false} bind:value={$gridType} />
        {:else}
          <DropDown options={steamGridTypes} onChange={() => {}} width={"130px"} showTooltip={false} bind:value={$gridType} />
        {/if}
        <Spacer orientation="HORIZONTAL" />

        <div class="buttons-cont">
          <IconButton label="Set Logo Position" onClick={() => { $showLogoPositionModal = true; }} width="auto" disabled={!$selectedGameAppId || !$appLibraryCache[$selectedGameAppId]?.Logo}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="height: 14px; width: 14px;">
              <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path d="M160 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V64zM32 320c-17.7 0-32 14.3-32 32s14.3 32 32 32H96v64c0 17.7 14.3 32 32 32s32-14.3 32-32V352c0-17.7-14.3-32-32-32H32zM352 64c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H352V64zM320 320c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32V384h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320z"/>
            </svg>
          </IconButton>
          <Spacer orientation="HORIZONTAL" />

          <IconButton label="Upload Your Own Art!" onClick={prompUserForArt} width="auto" disabled={!$selectedGameAppId}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 12px; width: 12px;">
              <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM385 231c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-71-71V376c0 13.3-10.7 24-24 24s-24-10.7-24-24V193.9l-71 71c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9L239 119c9.4-9.4 24.6-9.4 33.9 0L385 231z"/>
            </svg>
          </IconButton>
        </div>
      </div>
      
      <Divider marginTop={"7px"} />
      <Spacer orientation="VERTICAL" />
    </div>

    <div class="content" style="height: calc(100% - 85px);position: relative; z-index: 1;">
      {#if $isOnline}
        {#if !$needsSGDBAPIKey}
          {#if !!$selectedGameAppId}
            <Pages numPages={numPages} height="calc(100% - 47px)" bind:selected={$selectedResultPage}>
              <PaddedScrollContainer height={"calc(100% - 7px)"} width={"100%"} background={"transparent"} loading={isLoading} marginTop="0px">
                {#if isLoading}
                  <div class="game-grid" style="--img-width: {widths[$gridType] + padding}px; --img-height: {heights[$gridType] + padding + 18}px;">
                    {#each new Array(100) as _}
                      <GridLoadingSkeleton />
                    {/each}
                  </div>
                {:else}
                  {#if grids.length > 0}
                    <div class="game-grid" style="--img-width: {widths[$gridType] + padding}px; --img-height: {heights[$gridType] + padding + 18}px;">
                      {#each grids as grid (`${$selectedSteamGridGameId}|${grid.id}|${$gridType}`)}
                        <Grid grid={grid} />
                      {/each}
                    </div>
                  {:else}
                    <div class="message">
                      No results for {$gridType === GridTypes.HERO ? "Heroe" : $gridType}s for "{$selectedGameName}".
                    </div>
                  {/if}
                {/if}
              </PaddedScrollContainer>
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
  </div>
</Pane>

<style>
  .inner {
    margin-right: 1px;
    height: 100%;
  }

  .content {
    padding: 0px 6px;
    max-height: calc(100% - 65px);
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

  .buttons-cont {
    display: flex;
  }
</style>