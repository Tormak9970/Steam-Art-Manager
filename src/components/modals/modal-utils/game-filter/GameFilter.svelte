<script lang="ts">
  import { AppController } from "@controllers";
  import { Info } from "@icons";
  import { DropDown, Toggle } from "@interactables";
  import { Table } from "@layout";
  import { Platforms, appLibraryCache, gridType, hiddenGameIds } from "@stores/AppState";
  import type { GameStruct } from "@types";
  import { onMount } from "svelte";
  import SelectedGameEntry from "./SelectedGameEntry.svelte";
  
  export let selectedGameIds: string[];
  export let showFilters = true;
  export let showPlatforms = true;
  export let steamGames: GameStruct[];
  export let nonSteamGames: GameStruct[] = [];
  export let selectedPlatform = "All";
  export let selectedGamesFilter =  "All";
  export let noGamesMessage = "No games matched the selected filters.";
  
  $: allGames = [ ...steamGames, ...nonSteamGames ];

  let platforms: { label: string, data: string}[] = Object.values(Platforms).map((platform) => {
    return {
      label: platform,
      data: platform
    }
  });
  platforms.unshift({
    label: "All",
    data: "All"
  });

  let gameFilters = [
    { label: "All", data: "All" },
    { label: "Missing", data: "Missing" }
  ];

  let gamesToFilter: GameStruct[] = [];
  let selectedGames: Record<string, boolean> = {};
  let includeHidden = false;

  /**
   * Function to run when any state changes.
   * @param platform The chosen platform.
   * @param gameFilter The type of filtering to use.
   * @param showHidden Whether to include hidden games or not.
   */
  function onStateChange(platform: string, gameFilter: string, showHidden: boolean): void {
    gamesToFilter = (platform === "All" ? allGames : (platform === Platforms.STEAM ? steamGames : nonSteamGames)).filter((game) => !showHidden ? !$hiddenGameIds.includes(game.appid) : true);
    const selectedGameEntries = gamesToFilter.map((game) => {
      return [ game.appid, gameFilter === "All" ? true : (!$appLibraryCache[game.appid][$gridType]) ];
    });

    selectedGames = Object.fromEntries(selectedGameEntries);
    
    selectedGameIds = Object.keys(selectedGames).filter((appid) => !!selectedGames[appid]);
  }

  /**
   * Function to run on entry change.
   * @param appid The appid of the changed entry.
   * @param isChecked Whether or not it is checked.
   */
  function onEntryChange(appid: number, isChecked: boolean): void {
    selectedGames[appid] = isChecked;
    selectedGameIds = Object.keys(selectedGames).filter((appid) => !!selectedGames[appid]);
  }

  onMount(() => {
    onStateChange(selectedPlatform, selectedGamesFilter, includeHidden);
  });
</script>

<div class="game-filter">
  <div class="options">
    <div class="dropdowns">
      {#if showPlatforms}
        <DropDown label="Platforms" options={platforms} bind:value={selectedPlatform} width="100px" onChange={(platform) => { onStateChange(platform, selectedGamesFilter, includeHidden); }} showTooltip={false} />
      {/if}
      {#if showFilters}
        <DropDown label="Filters" options={gameFilters} bind:value={selectedGamesFilter} width="100px" onChange={(gamesFilter) => { onStateChange(selectedPlatform, gamesFilter, includeHidden); }} showTooltip={false} />
      {/if}
    </div>
    <Toggle label="Include Hidden" bind:value={includeHidden} on:change={(e) => { onStateChange(selectedPlatform, selectedGamesFilter, e.detail.value); }} />
  </div>
  <Table>
    <span slot="header">
      <div class="batch-icon" use:AppController.tippy={{ content: "Checked games will be included", placement: "left", onShow: AppController.onTippyShow }}>
        <Info style="height: 12px; width: 12px;" />
      </div>
      <div>Name</div>
      <div style="margin-left: auto; margin-right: 57px;">Platform</div>
    </span>
    <span slot="data" class="entries">
      {#each gamesToFilter as game, i (`${game.appid}|${i}`)}
        <SelectedGameEntry game={game} platform={selectedPlatform !== "All" ? selectedPlatform : (steamGames.some((steamGame) => steamGame.appid === game.appid) ? Platforms.STEAM : Platforms.NON_STEAM)} isChecked={!!selectedGames[game.appid]} onChange={onEntryChange} />
      {:else}
          <div>{noGamesMessage}</div>
      {/each}
    </span>
  </Table>
</div>

<style>
  .batch-icon {
    fill: var(--font-color);
    margin-left: 9px;
    margin-right: 14px;

    cursor: pointer;
  }

  .dropdowns {
    width: 98%;
    
    display: flex;
    justify-content: space-between;
  }

  .options {
    margin-top: 7px;

    width: 100%;

    display: flex;
    flex-direction: column;

    gap: 7px;
  }

  .entries {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
</style>
