<script lang="ts">
  import { dialog } from "@tauri-apps/api";
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import { AppController } from "../../../lib/controllers/AppController";
  import { LogController } from "../../../lib/controllers/LogController";
  import type { SGDBImage } from "../../../lib/models/SGDB";
  import { dbFilters, gridType, GridTypes, isOnline, needsSGDBAPIKey, selectedGameAppId, selectedGameName, steamGridDBKey, type DBFilters, currentPlatform, selectedSteamGridGameId, steamGridSearchCache, Platforms, selectedResultPage } from "../../../Stores";
  import LoadingSpinner from "../../info/LoadingSpinner.svelte";
  import Button from "../../interactables/Button.svelte";
  import ListTabs from "../../layout/tabs/ListTabs.svelte";
  import HorizontalSpacer from "../../spacers/HorizontalSpacer.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import Grid from "./Grid.svelte";
  import DropDown from "../../interactables/DropDown.svelte";
  import { heights, widths } from "../imageDimensions";
  import Pages from "../../layout/pagination/Pages.svelte";

  let steamGridSearchCacheUnsub: Unsubscriber;
  let selectedPlatformUnsub: Unsubscriber;
  let selectedAppIdUnsub: Unsubscriber;
  let dbFiltersUnsub: Unsubscriber;
  let sgdbPageUnsub: Unsubscriber;
  let gridTypeUnsub: Unsubscriber;
  let onlineUnsub: Unsubscriber;
  let apiKeyUnsub: Unsubscriber;

  const padding = 20;
  let oldSelectedGameId = null;

  function filterGrids(allGrids: SGDBImage[], type: GridTypes, filters: DBFilters): SGDBImage[] {
    const targetFilters = filters[type];
    const gridStyles = Object.keys(targetFilters.styles).filter((style) => targetFilters.styles[style]);
    const dimensions = (type != GridTypes.LOGO && type != GridTypes.ICON) ? Object.keys(targetFilters.dimensions).filter((dimension) => targetFilters.dimensions[dimension]) : [];
    const imageFormats = Object.keys(targetFilters.mimes).filter((imgType) => targetFilters.mimes[imgType]);
    const animationTypes = Object.keys(targetFilters.types).filter((gridType) => targetFilters.types[gridType]);
    const humorAllowed = targetFilters.oneoftag.humor;
    const epilepsyAllowed = targetFilters.oneoftag.epilepsy;
    const nsfwAllowed = targetFilters.oneoftag.nsfw;

    const resGrids = allGrids.filter((grid: SGDBImage) => {
      return gridStyles.includes(grid.style)
        && (dimensions.includes(`${grid.width}x${grid.height}`) || type == GridTypes.LOGO || type == GridTypes.ICON)
        && imageFormats.includes(grid.mime)
        && (grid.isAnimated ? animationTypes.includes("animated") : animationTypes.includes("static"))
        && (grid.humor ? humorAllowed : true)
        && (grid.epilepsy ? epilepsyAllowed : true)
        && (grid.nsfw ? nsfwAllowed : true);
    });

    let query = `"${$gridType == GridTypes.HERO ? "Heroe" : $gridType}s for ${$selectedGameName}"`;
    if (resGrids.length > 0) {
      LogController.log(`Query: ${query}. Result: ${resGrids.length} grids.`);
    } else {
      LogController.log(`Query: ${query}. Result: no grids.`);
    }

    return resGrids;
  }

  let isLoading = false;
  let availableSteamGridGames = [{ label: "None", data: "None"}];
  let grids: SGDBImage[] = [];

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

  async function onDropdownChange(id: string) {
    if ($isOnline && $steamGridDBKey != "" && $selectedGameAppId != null && oldSelectedGameId != id) grids = filterGrids(await AppController.getSteamGridArt($selectedGameAppId, $selectedResultPage, id), $gridType, $dbFilters);
    oldSelectedGameId = id;
  }

  onMount(() => {
    steamGridSearchCacheUnsub = steamGridSearchCache.subscribe((searchCache) => {
      isLoading = true;
      if (($currentPlatform == Platforms.STEAM || $currentPlatform == Platforms.NON_STEAM) && $selectedGameName && searchCache[$selectedGameAppId]) {
        availableSteamGridGames = Object.values(searchCache[$selectedGameAppId]).map((value) => {
          return {
            "label": value.name,
            "data": value.id.toString()
          }
        });
      }
      isLoading = false;
    });

    selectedPlatformUnsub = currentPlatform.subscribe(async (platform) => {
      isLoading = true;
      availableSteamGridGames = [{ label: "None", data: "None"}];
      $selectedGameAppId = null;
      $selectedGameName = null;
      $selectedSteamGridGameId = "None";
      grids = [];
      isLoading = false;
    });
    selectedAppIdUnsub = selectedGameAppId.subscribe(async (id) => {
      isLoading = true;
      if ($isOnline && $steamGridDBKey != "" && id != null) grids = filterGrids(await AppController.getSteamGridArt(id, $selectedResultPage), $gridType, $dbFilters);
      
      if (($currentPlatform == Platforms.STEAM || $currentPlatform == Platforms.NON_STEAM) && $selectedGameName && $steamGridSearchCache[id]) {
        availableSteamGridGames = Object.values($steamGridSearchCache[id]).map((value) => {
          return {
            "label": value.name,
            "data": value.id.toString()
          }
        });
      }

      isLoading = false;
    });
    onlineUnsub = isOnline.subscribe(async (online) => {
      isLoading = true;
      if (online && $steamGridDBKey != "" && $selectedGameAppId != null) grids = filterGrids(await AppController.getSteamGridArt($selectedGameAppId, $selectedResultPage), $gridType, $dbFilters);
      isLoading = false;
    });
    sgdbPageUnsub = selectedResultPage.subscribe(async (page) => {
      isLoading = true;
      if ($isOnline && $steamGridDBKey != "" && $selectedGameAppId != null) grids = filterGrids(await AppController.getSteamGridArt($selectedGameAppId, page, $selectedSteamGridGameId), $gridType, $dbFilters);
      isLoading = false;
    });
    gridTypeUnsub = gridType.subscribe(async (type) => {
      isLoading = true;
      if ($isOnline && $steamGridDBKey != "" && $selectedGameAppId != null) grids = filterGrids(await AppController.getSteamGridArt($selectedGameAppId, $selectedResultPage, $selectedSteamGridGameId), type, $dbFilters);
      isLoading = false;
    });
    apiKeyUnsub = steamGridDBKey.subscribe(async (key) => {
      isLoading = true;
      if ($isOnline && key != "" && $selectedGameAppId != null) {
        grids = filterGrids(await AppController.getSteamGridArt($selectedGameAppId, $selectedResultPage), $gridType, $dbFilters);
      } else {
        grids = [];
      }
      isLoading = false;
    });
    dbFiltersUnsub = dbFilters.subscribe(async (filters) => {
      isLoading = true;
      if ($isOnline && $steamGridDBKey != "" && $selectedGameAppId != null) grids = filterGrids(await AppController.getSteamGridArt($selectedGameAppId, $selectedResultPage, $selectedSteamGridGameId), $gridType, filters);
      isLoading = false;
    });
  });

  onDestroy(() => {
    if (steamGridSearchCacheUnsub) steamGridSearchCacheUnsub();
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
      <DropDown label="Browsing" options={availableSteamGridGames} onChange={onDropdownChange} width={"200px"} bind:value={$selectedSteamGridGameId} />
      <HorizontalSpacer />
      <Button label="Upload Your Own Art!" onClick={prompUserForArt} width="auto" disabled={$selectedGameAppId == null} />
    </div>
    
    <div class="border" />
    <VerticalSpacer />
  </div>

  <div class="content" style="height: calc(100% - 85px);position: relative; z-index: 1;">
    {#if $isOnline}
      {#if !$needsSGDBAPIKey}
        {#if $selectedGameAppId != null}
          <Pages numPages={3} height="calc(100% - 47px)" bind:selected={$selectedResultPage}>
            <div class="grids-cont">
              <VerticalSpacer />
              <VerticalSpacer />
              
              {#if isLoading}
                <div class="loader-container">
                  <LoadingSpinner />
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
                    No results for {$gridType == GridTypes.HERO ? "Heroe" : $gridType}s for "{$selectedGameName}".
                  </div>
                {/if}
              {/if}
              
              <VerticalSpacer />
              <VerticalSpacer />
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
  }

  .border {
    margin-top: 7px;
    border-bottom: 1px solid var(--foreground);
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
</style>