<script lang="ts">
  import { Platforms, appLibraryCache, gridType, hiddenGameIds } from "../../../../stores/AppState";
  import { AppController } from "../../../../lib/controllers/AppController";
  import DropDown from "../../../interactables/DropDown.svelte";
  import SelectedGameEntry from "./SelectedGameEntry.svelte";
  import { onMount } from "svelte";
  import Toggle from "../../../interactables/Toggle.svelte";
  import Table from "../../../layout/Table.svelte";
  import Spacer from "../../../layout/Spacer.svelte";
  
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

  let gamesToFilter = [];
  let selectedGames = {};
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
    <Spacer orientation="VERTICAL" />
    <Toggle label="Include Hidden" bind:value={includeHidden} onChange={(showHidden) => { onStateChange(selectedPlatform, selectedGamesFilter, showHidden); }} />
    <Spacer orientation="VERTICAL" />
  </div>
  <Table>
    <span slot="header">
      <div class="batch-icon" use:AppController.tippy={{ content: "Checked games will be included", placement: "left", onShow: AppController.onTippyShow }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 12px; width: 12px;">
          <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>
        </svg>
      </div>
      <div>Name</div>
      <div style="margin-left: auto; margin-right: 57px;">Platform</div>
    </span>
    <span slot="data">
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
    margin-left: 7px;
  }
</style>
