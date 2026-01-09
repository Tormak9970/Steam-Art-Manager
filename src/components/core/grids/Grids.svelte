<script lang="ts">
  import { AppController } from "@controllers";
  import { Check, Edit, Options, Position, Upload } from "@icons";
  import { DropDown, IconButton, Menu } from "@interactables";
  import { currentPlatform, customGameNames, dbFilters, gridsSize, gridType, isOnline, manualSteamGames, nonSteamGames, selectedGameAppId, selectedGameName, selectedSteamGridGameId, showCachedGrids, steamGames, steamGridDBKey, steamGridSearchCache } from "@stores/AppState";
  import { showLogoPositionModal } from "@stores/Modals";
  import * as dialog from "@tauri-apps/plugin-dialog";
  import { GridTypes, type SGDBGame } from "@types";
  import { debounce } from "@utils";
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import Divider from "../Divider.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import GridResults from "./GridResults.svelte";

  let windowWidth: number;

  let selectedAppIdUnsub: Unsubscriber;
  let steamGridSearchCacheUnsub: Unsubscriber;
  let manualGamesUnsub: Unsubscriber;
  let customGameNamesUnsub: Unsubscriber;
  let selectedPlatformUnsub: Unsubscriber;
  let apiKeyUnsub: Unsubscriber;

  let availableSteamGridGames = [ { label: "None", data: "None" } ];
  let steamGridTypes = Object.values(GridTypes).map((gridType) => { return { label: gridType, data: gridType }});
  let hasCustomName = $selectedGameAppId !== "" ? !!$customGameNames[$selectedGameAppId] : false;
  $: originalName = ($steamGames.find((game) => game.appid.toString() === $selectedGameAppId) ?? $nonSteamGames.find((game) => game.appid.toString() === $selectedGameAppId))?.name;

  $: menuOptions = [
      { label: "Set Logo Position", icon: Position, onClick: () => { $showLogoPositionModal = true; } },
      { label: "Upload Local Art", icon: Upload, onClick: prompUserForArt },
      { label: "Show Selected Grids", icon: $showCachedGrids ? Check : undefined, onClick: () => { $showCachedGrids = !$showCachedGrids; } }
    ]

  /**
   * Handles when the user changes the custom game name
   */
  async function handleCustomNameInput(): Promise<void> {
    const res = await AppController.getIdForSearchQuery($selectedGameName);

    if (res) {
      if ($customGameNames[$selectedGameAppId] && res.name === originalName) {
        delete $customGameNames[$selectedGameAppId];
      } else {
        $customGameNames[$selectedGameAppId] = res.name;
      }

      $customGameNames = { ...$customGameNames };
    }
  }

  /**
   * Prompts the user to select their custom game art.
   */
  async function prompUserForArt(): Promise<void> {
    const file = await dialog.open({
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
    if (file && file !== "") AppController.setCustomArt(file);
  }
  
  /**
   * Updates the available SGDB games dropdown when related state changes.
   * @param searchCache The SGDB game search cache.
   * @param selectedAppId The selected game's appid.
   */
  function setAvailableSgdbGamesOnStateChange(searchCache: { [appid: string]: SGDBGame[] }, selectedAppId: string): void {
    if ($selectedGameName && searchCache[selectedAppId]) {
      availableSteamGridGames = Object.values(searchCache[selectedAppId]).map((value) => {
        return {
          "label": value.name,
          "data": value.id.toString()
        }
      });
    }
  }

  /**
   * Resets the grid related stores.
   */
  function resetGridStores(): void {
    availableSteamGridGames = [ { label: "None", data: "None" } ];
    $selectedGameAppId = "";
    $selectedSteamGridGameId = "None";
  }

  const debouncedWidthUpdate = debounce(() => windowWidth = window.innerWidth, 50);

  onMount(() => {
    steamGridSearchCacheUnsub = steamGridSearchCache.subscribe((searchCache) => {
      setAvailableSgdbGamesOnStateChange(searchCache, $selectedGameAppId);
    });

    manualGamesUnsub = manualSteamGames.subscribe((games) => {
      if ($selectedGameAppId !== "" && !games.find((game) => game.appid.toString() === $selectedGameAppId)) resetGridStores();
    });

    customGameNamesUnsub = customGameNames.subscribe(async (customNames) => {
      hasCustomName = !customNames[$selectedGameAppId];
      delete $steamGridSearchCache[$selectedGameAppId];
      availableSteamGridGames = [ { label: "None", data: "None" } ];
      $selectedSteamGridGameId = "None";
    });

    selectedAppIdUnsub = selectedGameAppId.subscribe(() => {
      availableSteamGridGames = [ { label: "None", data: "None" } ];
      $selectedSteamGridGameId = "None";
    });

    selectedPlatformUnsub = currentPlatform.subscribe((platform) => {
      resetGridStores();
    });
    apiKeyUnsub = steamGridDBKey.subscribe(async (key) => {
      if (key === "" || !AppController.sgdbClientInitialized()) resetGridStores();
    });
  });

  onDestroy(() => {
    if (selectedAppIdUnsub) selectedAppIdUnsub();
    if (steamGridSearchCacheUnsub) steamGridSearchCacheUnsub();
    if (manualGamesUnsub) manualGamesUnsub();
    if (customGameNamesUnsub) customGameNamesUnsub();
    if (selectedPlatformUnsub) selectedPlatformUnsub();
    if (apiKeyUnsub) apiKeyUnsub();
  });
</script>

<svelte:window on:resize={debouncedWidthUpdate} />

<Pane minSize={20} size={$gridsSize}>
  <div class="inner">
    <SectionTitle title="Grids" />

    <div class="content" style="position: relative; z-index: 2; overflow: initial;">
      <div class="inputs">
        <div class="controls">
          {#if !windowWidth || windowWidth >= 1265}
            <DropDown label="Browsing" options={availableSteamGridGames} width={"130px"} bind:value={$selectedSteamGridGameId} />
          {:else}
            <DropDown options={availableSteamGridGames} width={"200px"} bind:value={$selectedSteamGridGameId} />
          {/if}
          <IconButton label="Customize Search" on:click={handleCustomNameInput} tooltipPosition={"top"} disabled={$selectedGameAppId === ""}>
            <Edit style="height: 0.875rem; width: 0.875rem;" />
          </IconButton>
        </div>

        {#if !windowWidth || windowWidth >= 1265}
          <DropDown label="Type" options={steamGridTypes} width={"130px"} showTooltip={false} bind:value={$gridType} />
        {:else}
          <DropDown options={steamGridTypes} width={"130px"} showTooltip={false} bind:value={$gridType} />
        {/if}

        <div class="buttons-cont">
          <Menu label="Grid Options" options={menuOptions} disabled={$selectedGameAppId === ""}>
            <Options style="height: 1rem; width: 1rem;" />
          </Menu>
        </div>
      </div>
      
      <Divider />
    </div>

    <div class="content" style="height: calc(100% - 85px); position: relative; z-index: 1;">
      {#key `${$isOnline}|${$gridType}|${$selectedGameAppId}|${$selectedSteamGridGameId}|${JSON.stringify($dbFilters[$gridType])}|${$selectedGameName}`}
        <GridResults hasCustomName={hasCustomName} />
      {/key}
    </div>
  </div>
</Pane>

<style>
  .inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .content {
    padding: 0px 0.375rem;
  }

  .inputs {
    display: flex;
    justify-content: space-between;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
  }

  .buttons-cont {
    display: flex;
    gap: 0.5rem;
  }
</style>