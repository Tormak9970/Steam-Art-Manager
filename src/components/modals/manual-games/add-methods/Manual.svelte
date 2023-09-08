<script lang="ts">
  import { ToastController } from "../../../../lib/controllers/ToastController";
  import Button from "../../../interactables/Button.svelte";
  import NumberInput from "../../../interactables/NumberInput.svelte";
  import TextInput from "../../../interactables/TextInput.svelte";
  import Spacer from "../../../layout/Spacer.svelte";
  
  export let onGameSave: (game:GameStruct) => void;

  let gameName: string = "";
  let appId: number = 0;

  function saveWrapper(): void {
    ToastController.showSuccessToast(`Added ${gameName}!`);
    onGameSave({ appid: appId, name: gameName });
    gameName = "";
    appId = 0;
  }

  function clear(): void {
    ToastController.showGenericToast(`Cleared info.`);
    gameName = "";
    appId = 0;
  }
</script>

<div class="manual-add">
  <TextInput label={"Game Name"} placeholder={"The name of the game"} bind:value={gameName} onChange={() => {}} />
  <div class="description">
    The name of the game you're adding. Try to be as accurate as possible.
  </div>
  <Spacer orientation="VERTICAL" />
  <NumberInput label={"App Id"} bind:value={appId} onChange={() => {}} />
  <div class="description">
    The appid of the game. You can find this by going to the game's steam page, and looking at the number in the url, or looking up "what is the steam appid for GAME_NAME".
  </div>

  <div class="buttons">
    <Button label="Add Game" onClick={saveWrapper} width="47.5%" disabled={gameName == "" || appId == 0} />
    <Button label="Clear" onClick={clear} width="47.5%" />
  </div>
</div>

<style>
  .manual-add {
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

  .buttons {
    margin-top: 14px;
    margin-bottom: 7px;
    width: calc(100% - 20px);
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }
</style>
