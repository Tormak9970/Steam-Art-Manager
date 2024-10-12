<script lang="ts">
  import { AppController } from "@controllers";
  import { Edit, Position, Upload } from "@icons";
  import { DropDown, IconButton } from "@interactables";
  import { appLibraryCache, currentPlatform, customGameNames, dbFilters, gridsSize, gridType, isOnline, manualSteamGames, nonSteamGames, Platforms, selectedGameAppId, selectedGameName, selectedSteamGridGameId, steamGames, steamGridDBKey, steamGridSearchCache } from "@stores/AppState";
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
    if (file && file.path && file.path !== "") AppController.setCustomArt(file.path as string);
  }
  
  /**
   * Updates the available SGDB games dropdown when related state changes.
   * @param searchCache The SGDB game search cache.
   * @param selectedAppId The selected game's appid.
   */
  function setAvailableSgdbGamesOnStateChange(searchCache: { [appid: string]: SGDBGame[] }, selectedAppId: string): void {
    if (($currentPlatform === Platforms.STEAM || $currentPlatform === Platforms.NON_STEAM) && $selectedGameName && searchCache[selectedAppId]) {
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
            <Edit style="height: 14px; width: 14px;" />
          </IconButton>
        </div>

        {#if !windowWidth || windowWidth >= 1265}
          <DropDown label="Type" options={steamGridTypes} width={"130px"} showTooltip={false} bind:value={$gridType} />
        {:else}
          <DropDown options={steamGridTypes} width={"130px"} showTooltip={false} bind:value={$gridType} />
        {/if}

        <div class="buttons-cont">
          <IconButton label="Set Logo Position" on:click={() => { $showLogoPositionModal = true; }} width="auto" disabled={$selectedGameAppId === "" || !$appLibraryCache[$selectedGameAppId]?.Logo}>
            <Position style="height: 14px; width: 14px;" />
          </IconButton>

          <IconButton label="Upload Local Art" on:click={prompUserForArt} width="auto" disabled={$selectedGameAppId === ""}>
            <Upload style="height: 12px; width: 12px;" />
          </IconButton>
        </div>
      </div>
      
      <Divider marginTop={"6px"} />
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
    margin-right: 1px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .content {
    padding: 0px 6px;
    max-height: calc(100% - 65px);
  }

  .inputs {
    display: flex;
    justify-content: space-between;
  }

  .controls {
    display: flex;
    gap: 7px;
  }

  .buttons-cont {
    display: flex;
    gap: 7px;
  }
</style>