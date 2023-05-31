<script lang="ts">
  import { ToastController } from "../../../../lib/controllers/ToastController";
  import type { SGDBGame } from "../../../../lib/models/SGDB";
  import Button from "../../../interactables/Button.svelte";
  import SearchBar from "../../../interactables/SearchBar.svelte";
  import Table from "../../../layout/Table.svelte";
  import VerticalSpacer from "../../../spacers/VerticalSpacer.svelte";
  
  export let onGameSave: (game:GameStruct) => void;

  let selectedGame: SGDBGame;
  let results: SGDBGame[] = [];

  function searchGame(querey: string): void {

  }

  function saveWrapper(): void {
    ToastController.showSuccessToast(`Added ${selectedGame.name}!`);
    const appId = 0; //TODO get app id.
    onGameSave({ appid: appId, name: selectedGame.name });
    selectedGame = null;
    results = [];
  }

  function clear(): void {
    ToastController.showGenericToast(`Cleared selection.`);
    selectedGame = null;
    results = [];
  }
</script>

<div class="search-add">
  <SearchBar label="Game Search" onChange={searchGame} reversed />
  <div class="description">
    Search SteamGridDB for a game with the provided name.
  </div>
  <VerticalSpacer />
  <div class="table-cont">
    <Table height="301px" marginLeft="0px">
      <span slot="header">
        <div class="appid">App Id</div>
        <div class="name">Game Name</div>
      </span>
      <span slot="data">

      </span>
    </Table>
  </div>

  <div class="buttons">
    <Button label="Add Selected" onClick={saveWrapper} width="47.5%" />
    <Button label="Clear" onClick={clear} width="47.5%" />
  </div>
</div>

<style>
  @import "/theme.css";

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

  .buttons {
    margin-top: 14px;
    margin-bottom: 7px;
    width: calc(100% - 20px);
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }
</style>
