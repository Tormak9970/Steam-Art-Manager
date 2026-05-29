<script lang="ts">
  import { Button, NumberInput, TextInput } from "@interactables";
  import { showInfoSnackbar } from "@stores/AppState";
  import type { GameStruct } from "@types";
  
  export let onGameSave: (game: GameStruct) => void;

  let gameName: string = "";
  let appId: number = 0;

  /**
   * Wrapper function for saving the manual game.
   */
  function saveWrapper(): void {
    $showInfoSnackbar({ message: `Added ${gameName}!` });
    onGameSave({ appid: appId, type: "Game", installed: true, name: gameName });
    gameName = "";
    appId = 0;
  }

  /**
   * Clears any user input.
   */
  function clear(): void {
    $showInfoSnackbar({ message: "Cleared info." });
    gameName = "";
    appId = 0;
  }
</script>

<div class="manual-add">
  <TextInput placeholder={"Game Name"} bind:value={gameName} />
  <div class="description">
    The name of the game you're adding. Try to be as accurate as possible.
  </div>
  <NumberInput label={"App Id"} bind:value={appId} />
  <div class="description">
    The appid of the game. You can find this by going to the game's steam page, and looking at the number in the url, or looking up "what is the steam appid for GAME_NAME".
  </div>

  <div class="buttons">
    <Button on:click={clear} width="48.5%">Clear</Button>
    <Button on:click={saveWrapper} width="48.5%" disabled={gameName === "" || appId === 0}>Add Game</Button>
  </div>
</div>

<style>
  .manual-add {
    width: 100%;

    display: flex;
    flex-direction: column;
  }

  .description {
    width: calc(100% - 1.75rem);
    margin-top: 0.5rem;
    margin-bottom: 1.25rem;

    font-size: 0.875rem;

    background-color: var(--background-dark);
    border-radius: 0.25rem;

    padding: 0.5rem;
  }

  .buttons {
    margin-top: 0.875rem;
    width: calc(100% - 1.25rem);
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }
</style>
