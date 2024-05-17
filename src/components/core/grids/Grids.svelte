<script lang="ts">
  import { dialog } from "@tauri-apps/api";
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import { AppController } from "../../../lib/controllers/AppController";
  import type { SGDBGame } from "../../../lib/models/SGDB";
  import { dbFilters, gridType, GridTypes, isOnline, selectedGameAppId, selectedGameName, steamGridDBKey, currentPlatform, selectedSteamGridGameId, steamGridSearchCache, Platforms, appLibraryCache, manualSteamGames, customGameNames, gridsSize, steamGames, nonSteamGames } from "../../../stores/AppState";
  import SectionTitle from "../SectionTitle.svelte";
  import DropDown from "../../interactables/DropDown.svelte";
  import IconButton from "../../interactables/IconButton.svelte";
  import { debounce } from "../../../lib/utils/Utils";
  import Divider from "../Divider.svelte";
  import { showLogoPositionModal } from "../../../stores/Modals";
  import Spacer from "../../layout/Spacer.svelte";
  import GridResults from "./GridResults.svelte";

  let windowWidth: number;
  let skipUpdate = false;

  let selectedAppIdUnsub: Unsubscriber;
  let steamGridSearchCacheUnsub: Unsubscriber;
  let manualGamesUnsub: Unsubscriber;
  let customGameNamesUnsub: Unsubscriber;
  let selectedPlatformUnsub: Unsubscriber;
  let apiKeyUnsub: Unsubscriber;

  let isLoading = false;
  let availableSteamGridGames = [ { label: "None", data: "None" } ];
  let steamGridTypes = Object.values(GridTypes).map((gridType) => { return { label: gridType, data: gridType }});
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
  }

  const debouncedWidthUpdate = debounce(() => windowWidth = window.innerWidth, 50);

  onMount(() => {
    steamGridSearchCacheUnsub = steamGridSearchCache.subscribe((searchCache) => {
      setAvailableSgdbGamesOnStateChange(searchCache, $selectedGameAppId);
    });

    manualGamesUnsub = manualSteamGames.subscribe((games) => {
      if ($selectedGameAppId && !games.find((game) => game.appid === $selectedGameAppId)) resetGridStores();
    });

    customGameNamesUnsub = customGameNames.subscribe(async (customNames) => {
      if (!skipUpdate) {
        if (customNames[$selectedGameAppId] && !hasCustomName) {
          hasCustomName = true;
          $selectedGameName = customNames[$selectedGameAppId];
          delete $steamGridSearchCache[$selectedGameAppId];
        } else if (!customNames[$selectedGameAppId] && hasCustomName) {
          hasCustomName = false;
          $selectedGameName = originalName;
          delete $steamGridSearchCache[$selectedGameAppId];
        }
      } else {
        skipUpdate = false;
      }
    });

    selectedAppIdUnsub = selectedGameAppId.subscribe(() => {
      availableSteamGridGames = [ { label: "None", data: "None" } ];
      $selectedSteamGridGameId = "None";
    })

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
      <div style="margin-left: 6px; display: flex; justify-content: space-between;">
        <div style="display: flex;">
          {#if !windowWidth || windowWidth >= 1265}
            <DropDown label="Browsing" options={availableSteamGridGames} width={"130px"} bind:value={$selectedSteamGridGameId} />
          {:else}
            <DropDown options={availableSteamGridGames} width={"200px"} bind:value={$selectedSteamGridGameId} />
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
          <DropDown label="Type" options={steamGridTypes} width={"130px"} showTooltip={false} bind:value={$gridType} />
        {:else}
          <DropDown options={steamGridTypes} width={"130px"} showTooltip={false} bind:value={$gridType} />
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

          <IconButton label="Upload Local Art" onClick={prompUserForArt} width="auto" disabled={!$selectedGameAppId}>
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
  }

  .content {
    padding: 0px 6px;
    max-height: calc(100% - 65px);
  }

  .buttons-cont {
    display: flex;
  }
</style>