<script lang="ts">
  import { dialog } from "@tauri-apps/api";
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import { AppController } from "../../../lib/controllers/AppController";
  import type { SGDBImage } from "../../../lib/models/SGDB";
  import { dbFilters, gridType, GridTypes, isOnline, needsAPIKey, selectedGameAppId, steamGridDBKey, type DBFilters } from "../../../Stores";
  import Button from "../../interactables/Button.svelte";
  import ListTabs from "../../layout/tabs/ListTabs.svelte";
  import HorizontalSpacer from "../../spacers/HorizontalSpacer.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import Grid from "./Grid.svelte";

  let selectedAppIdUnsub: Unsubscriber;
  let dbFiltersUnsub: Unsubscriber;
  let gridTypeUnsub: Unsubscriber;
  let onlineUnsub: Unsubscriber;
  let apiKeyUnsub: Unsubscriber;

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

  function filterGrids(allGrids: SGDBImage[], type: GridTypes, filters: DBFilters): SGDBImage[] {
    const targetFilters = filters[type];
    const gridStyles = Object.keys(targetFilters.styles).filter((style) => targetFilters.styles[style]);
    const dimensions = type != GridTypes.LOGO ? Object.keys(targetFilters.dimensions).filter((dimension) => targetFilters.dimensions[dimension]) : [];
    const imageFormats = Object.keys(targetFilters.mimes).filter((imgType) => targetFilters.mimes[imgType]);
    const animationTypes = Object.keys(targetFilters.types).filter((gridType) => targetFilters.types[gridType]);
    const epilepsyAllowed = targetFilters.oneoftag.epilepsy;
    const nsfwAllowed = targetFilters.oneoftag.nsfw;

    return allGrids.filter((grid: SGDBImage) => {
      return gridStyles.includes(grid.style)
        && dimensions.includes(`${grid.width}x${grid.height}`)
        && imageFormats.includes(grid.mime)
        && (grid.epilepsy ? epilepsyAllowed : true)
        && (grid.nsfw ? nsfwAllowed : true);
    });
  }

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

  onMount(() => {
    selectedAppIdUnsub = selectedGameAppId.subscribe(async (id) => {
      if ($isOnline && $steamGridDBKey != "" && id != null) grids = filterGrids(await AppController.getSteamGridArt(id), $gridType, $dbFilters);
    });
    onlineUnsub = isOnline.subscribe(async (online) => {
      if (online && $steamGridDBKey != "" && $selectedGameAppId != null) grids = filterGrids(await AppController.getSteamGridArt($selectedGameAppId), $gridType, $dbFilters);
    });
    gridTypeUnsub = gridType.subscribe(async (type) => {
      console.log(type);
      if ($isOnline && $steamGridDBKey != "" && $selectedGameAppId != null) grids = filterGrids(await AppController.getSteamGridArt($selectedGameAppId), type, $dbFilters);
    });
    apiKeyUnsub = steamGridDBKey.subscribe(async (key) => {
      if ($isOnline && key != "" && $selectedGameAppId != null) grids = filterGrids(await AppController.getSteamGridArt($selectedGameAppId), $gridType, $dbFilters);
    });
    dbFiltersUnsub = dbFilters.subscribe(async (filters) => {
      if ($isOnline && $steamGridDBKey != "" && $selectedGameAppId != null) grids = filterGrids(await AppController.getSteamGridArt($selectedGameAppId), $gridType, filters);
    });
  });

  onDestroy(() => {
    if (selectedAppIdUnsub) selectedAppIdUnsub();
    if (dbFiltersUnsub) dbFiltersUnsub();
    if (gridTypeUnsub) gridTypeUnsub();
    if (onlineUnsub) onlineUnsub();
    if (apiKeyUnsub) apiKeyUnsub();
  });
</script>

<Pane minSize={20}>
  <SectionTitle title="Grids" />

  <div class="content">
    <div style="margin-left: 6px; display: flex; justify-content: space-between;">
      <HorizontalSpacer />
      <Button label="Upload Your Own Art!" onClick={prompUserForArt} width="auto" disabled={$selectedGameAppId == null} />
    </div>
    
    <div class="border" />
    <VerticalSpacer />
  </div>

  <div class="content" style="height: calc(100% - 85px);">
    {#if $isOnline}
      {#if !$needsAPIKey}
        {#if $selectedGameAppId != null}
          <ListTabs tabs={Object.values(GridTypes)} height="calc(100% - 45px)" bind:selected={$gridType}>
            <div class="grids-cont">
              <VerticalSpacer />
              <VerticalSpacer />
              
              <div class="game-grid" style="--img-width: {widths[$gridType] + padding}px; --img-height: {heights[$gridType] + padding + 18}px;">
                {#each grids as grid (`${grid.id}|${$gridType}`)}
                  <Grid grid={grid} widths={widths} heights={heights} />
                {/each}
              </div>
              
              <VerticalSpacer />
              <VerticalSpacer />
            </div>
          </ListTabs>
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
    opacity: 0.1;
    padding-top: 40px;
  }
</style>