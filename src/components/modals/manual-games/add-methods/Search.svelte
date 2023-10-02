<script lang="ts">
  import { onMount } from "svelte";
  import { needsSGDBAPIKey, steamGridDBKey } from "../../../../stores/AppState";
  import { ToastController } from "../../../../lib/controllers/ToastController";
  import { SGDB, type SGDBGame } from "../../../../lib/models/SGDB";
  import Button from "../../../interactables/Button.svelte";
  import SearchBar from "../../../interactables/SearchBar.svelte";
  import Table from "../../../layout/Table.svelte";
  import SearchEntry from "./SearchEntry.svelte";
  
  export let onGameSave: (game:GameStruct) => void;

  let notSGDBV3 = true;
  let client: SGDB;
  let searchQuery: string = "";
  let selectedGame: GameStruct;
  let results: GameStruct[] = [];

  let gameInfoCache: { [id: string]: GameStruct } = {};

  /**
   * Function to run when a game is selected.
   * @param game The game to select.
   */
  function onGameSelect(game: GameStruct): void {
    selectedGame = game;
    ToastController.showGenericToast(`Selected ${game.name}`);
  }

  /**
   * Searches SGDB based on the provided query.
   * @param query The query to use.
   */
  async function searchGame(query: string): Promise<void> {
    // TODO: switch to using the appController method?
    const searchRes = await client.searchGame(query);
    const steamGames = searchRes.filter((game: SGDBGame) => game.types.includes("steam"));
    console.log(searchRes);

    const resultsWithInfo: GameStruct[] = [];

    for (const sgdbGame of steamGames) {
      const appid = 0;
      // TODO: look up the steam app id here
      resultsWithInfo.push({
        appid: appid,
        name: sgdbGame.name
      })
    }

    results = resultsWithInfo;
  }

  /**
   * Wrapper function for saving the users selection.
   */
  function saveWrapper(): void {
    ToastController.showSuccessToast(`Added ${selectedGame.name}!`);
    onGameSave({ appid: selectedGame.appid, name: selectedGame.name });
    selectedGame = null;
    results = [];
    searchQuery = "";
  }

  /**
   * Clears any user input.
   */
  function clear(): void {
    ToastController.showGenericToast("Cleared selection.");
    selectedGame = null;
    results = [];
    searchQuery = "";
  }

  onMount(() => {
    if (!$needsSGDBAPIKey) client = new SGDB($steamGridDBKey);
  });
</script>

<div class="search-add">
  {#if notSGDBV3}
    <div class="description">
      <b>Unfortunately, his feature is unavailable until a new version of the SGDB API is released.</b>
    </div>
  {:else if $needsSGDBAPIKey}
    <div class="description">
      <b>Please provide a SteamGridDB API key in settings if you would like to use the game search!</b>
    </div>
  {:else}
    <SearchBar label="Game Search" bind:value={searchQuery} onChange={searchGame} reversed />
    <div class="description">
      Search SteamGridDB for a game with the provided name. (You need to hit enter to apply the search)
    </div>
    <div class="table-cont">
      <Table height="292px" marginLeft="0px">
        <span slot="header">
          <div class="appid">App Id</div>
          <div>Name</div>
        </span>
        <span slot="data">
          {#each results as game (`${game.appid}|${game.name}`)}
            <SearchEntry game={game} isSelected={selectedGame?.appid === game.appid} onSelect={onGameSelect} />
          {/each}
        </span>
      </Table>
    </div>

    <div class="buttons">
      <Button label="Add Selected" onClick={saveWrapper} width="47.5%" />
      <Button label="Clear" onClick={clear} width="47.5%" />
    </div>
  {/if}
</div>

<style>
  .search-add {
    width: 100%;

    display: flex;
    flex-direction: column;
  }

  .description {
    width: calc(100% - 20px);
    margin-top: 7px;
    margin-bottom: 14px;

    font-size: 14px;
  }

  .table-cont {
    width: calc(100% - 7px);
  }

  .appid {
    margin-left: 3px;
    margin-right: 60px;
  }

  .buttons {
    margin-top: 14px;
    margin-bottom: 7px;
    width: calc(100% - 20px);
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }
</style>
