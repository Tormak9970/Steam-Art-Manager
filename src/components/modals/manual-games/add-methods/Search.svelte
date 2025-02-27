<script lang="ts">
  import { AppController } from "@controllers";
  import { Button, SearchBar } from "@interactables";
  import { Table } from "@layout";
  import { needsSGDBAPIKey, showErrorSnackbar, showInfoSnackbar } from "@stores/AppState";
  import type { GameStruct, SGDBGame } from "@types";
  import SearchEntry from "./SearchEntry.svelte";
  
  export let onGameSave: (game: GameStruct) => void;

  let searchQuery: string = "";
  let selectedGame: SGDBGame | null;
  let results: SGDBGame[] = [];

  /**
   * Function to run when a game is selected.
   * @param game The game to select.
   */
  function onGameSelect(game: SGDBGame): void {
    selectedGame = game;
  }

  /**
   * Searches SGDB based on the provided query.
   * @param query The query to use.
   */
  async function searchGame(query: string): Promise<void> {
    if (query === "") {
      results = [];
    } else {
      const searchRes = await AppController.searchSGDBForGame(query);
      const steamGames = searchRes.filter((game: SGDBGame) => game.types.includes("steam"));
      results = steamGames;
    }
  }

  /**
   * Wrapper function for saving the users selection.
   */
  async function saveWrapper(): Promise<void> {
    const appid = await AppController.getAppidForSGDBGame(selectedGame!);
    
    if (appid) {
      onGameSave({ appid: parseInt(appid), name: selectedGame!.name });
      $showInfoSnackbar({ message: `Added ${selectedGame!.name}!` });
      selectedGame = null;
      results = [];
      searchQuery = "";
    } else {
      selectedGame = null;
      $showErrorSnackbar({ message: "No appid found for the selected game!" });
    }
  }

  /**
   * Clears any user input.
   */
  function clear(): void {
    $showInfoSnackbar({ message: "Cleared selection." });
    selectedGame = null;
    results = [];
    searchQuery = "";
  }
</script>

<div class="search-add">
  {#if $needsSGDBAPIKey}
    <div class="description">
      <b>Please provide a SteamGridDB API key in settings if you would like to use the game search!</b>
    </div>
  {:else}
    <SearchBar label="Game Search" bind:value={searchQuery} onChange={searchGame} reversed />
    <div class="description">
      Search SteamGridDB for a game with the provided name. (You need to hit enter to apply the search)
    </div>
    <div class="table-cont">
      <Table height="317px">
        <span slot="header">
          <div class="name">Name</div>
        </span>
        <span slot="data" class="entries">
          {#each results as game (game.id)}
            <SearchEntry game={game} isSelected={selectedGame?.id === game.id} onSelect={onGameSelect} />
          {/each}
        </span>
      </Table>
    </div>

    <div class="buttons">
      <Button on:click={clear} width="47.5%">Clear</Button>
      <Button on:click={saveWrapper} disabled={!selectedGame} width="47.5%">Add Selected</Button>
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
    margin-top: 6px;
    margin-bottom: 7px;

    font-size: 14px;
  }

  .table-cont {
    width: calc(100% - 7px);
  }

  .name {
    margin-left: 3px;
  }

  .buttons {
    margin-top: 14px;
    width: calc(100% - 7px);
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }

  .entries {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
</style>
