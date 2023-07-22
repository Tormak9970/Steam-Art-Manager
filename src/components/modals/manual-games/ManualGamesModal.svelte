<script lang="ts">
  import Button from "../../interactables/Button.svelte";
  import { AppController } from "../../../lib/controllers/AppController";
  import DropDown from "../../interactables/DropDown.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import ManualGameEntry from "./ManualGameEntry.svelte";
  import { ToastController } from "../../../lib/controllers/ToastController";
  import Search from "./add-methods/Search.svelte";
  import Manual from "./add-methods/Manual.svelte";
  import Table from "../../layout/Table.svelte";
  import { appLibraryCache, manualSteamGames, originalAppLibraryCache, steamGames } from "../../../Stores";
    import { LogController } from "../../../lib/controllers/LogController";
    import { SettingsManager } from "../../../lib/utils/SettingsManager";
    import ModalBody from "../modal-utils/ModalBody.svelte";

  export let onClose: () => void;
  
  let canSave = false;

  const originalManualGames = $manualSteamGames;
  let tempManualGames: GameStruct[] = JSON.parse(JSON.stringify(originalManualGames));

  let addMethods = [
    { label: "Manual", data: "manual" },
    { label: "Search", data: "search" }
  ];
  let selectedAddMethod =  "manual";

  /**
   * Adds a game to the new manual games list.
   * @param game The new game to add.
   */
  function addNewGame(game: GameStruct): void {
    if ($steamGames.find((sGame) => sGame.appid == game.appid) || tempManualGames.find((tGame) => tGame.appid == game.appid)) {
      ToastController.showWarningToast(`Game with that appid already exists! Can't have duplicates.`);
    } else {
      LogController.log(`Added manually added game ${game.name}.`);
      tempManualGames.push(game);
      tempManualGames = [...tempManualGames];
      canSave = JSON.parse(JSON.stringify(originalManualGames)) != JSON.parse(JSON.stringify(tempManualGames));
    }
  }

  /**
   * Removes a game from the new manual games list.
   * @param game The game to remove.
   */
  function removeHandler(game: GameStruct): void {
    LogController.log(`Removed manually added game ${game.name}.`);
    const index = tempManualGames.findIndex((g) => g.appid == game.appid);
    tempManualGames.splice(index, 1);
    tempManualGames = [...tempManualGames];
    canSave = JSON.parse(JSON.stringify(originalManualGames)) != JSON.parse(JSON.stringify(tempManualGames));
  }

  /**
   * Adds all of the provided games.
   */
  async function saveChanges() {
    manualSteamGames.set(JSON.parse(JSON.stringify(tempManualGames)));

    const originalAppLibCache = $originalAppLibraryCache;
    const appLibCache = $appLibraryCache;

    for (const game of tempManualGames) {
      if (!originalAppLibCache[game.appid]) originalAppLibCache[game.appid] = { "Capsule": "", "Wide Capsule": "", "Hero": "", "Logo": "", "Icon": "" };
      if (!appLibCache[game.appid]) appLibCache[game.appid] = { "Capsule": "", "Wide Capsule": "", "Hero": "", "Logo": "", "Icon": "" };
    }

    originalAppLibraryCache.set(JSON.parse(JSON.stringify(originalAppLibCache)));
    appLibraryCache.set(JSON.parse(JSON.stringify(appLibCache)));

    SettingsManager.updateSetting("manualSteamGames", tempManualGames);
    LogController.log(`Saved ${tempManualGames.length} manually added games.`);
    ToastController.showSuccessToast(`Saved ${tempManualGames.length} manually added games.`);

    onClose();
  }

  /**
   * Cancels adding games.
   */
  function cancel() {
    ToastController.showGenericToast("Cancelled manual games.");
    onClose();
  }
</script>

<ModalBody title={"Manage Manual Games"} onClose={onClose}>
  <div class="content">
    <div class="left">
      <div class="info">
        Add any Steam games that SARM isn't picking up. These will be automatically loaded each time you use SARM.
      </div>
      <VerticalSpacer />
      <div class="section-label" style="margin-left: 10px;">Your Manual Games</div>
      <Table>
        <span slot="header">
          <div class="batch-icon" use:AppController.tippy={{ content: "Current Manual Games", placement: "top", onShow: AppController.onTippyShow }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 12px; width: 12px;">
              <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>
            </svg>
          </div>
          <div>Name</div>
          <div class="exist-art-icon" use:AppController.tippy={{ content: "Has official art on this PC", placement: "top", onShow: AppController.onTippyShow }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" style="height: 12px; width: 12px;">
              <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path d="M496 256c0 137-111.2 248-248.4 248-113.8 0-209.6-76.3-239-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 39.2 0 71.9-32.4 70.2-73.5l84.5-60.2c52.1 1.3 95.8-40.9 95.8-93.5 0-51.6-42-93.5-93.7-93.5s-93.7 42-93.7 93.5v1.2L176.6 279c-15.5-.9-30.7 3.4-43.5 12.1L0 236.1C10.2 108.4 117.1 8 247.6 8 384.8 8 496 119 496 256zM155.7 384.3l-30.5-12.6a52.79 52.79 0 0 0 27.2 25.8c26.9 11.2 57.8-1.6 69-28.4 5.4-13 5.5-27.3.1-40.3-5.4-13-15.5-23.2-28.5-28.6-12.9-5.4-26.7-5.2-38.9-.6l31.5 13c19.8 8.2 29.2 30.9 20.9 50.7-8.3 19.9-31 29.2-50.8 21zm173.8-129.9c-34.4 0-62.4-28-62.4-62.3s28-62.3 62.4-62.3 62.4 28 62.4 62.3-27.9 62.3-62.4 62.3zm.1-15.6c25.9 0 46.9-21 46.9-46.8 0-25.9-21-46.8-46.9-46.8s-46.9 21-46.9 46.8c.1 25.8 21.1 46.8 46.9 46.8z"/>
            </svg>
          </div>
          <div class="exist-art-icon" style="margin-left: 18px; margin-right: 34px;" use:AppController.tippy={{ content: "Has custom art on this PC", placement: "top", onShow: AppController.onTippyShow }}>
            <svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 50 24" style="height: 12px; width: 16px;">
              <path fill="#305b79" d="M0 0h41v18H0V0z"/>
              <path fill="#4787b4" d="M3 2h41v18H3V2z"/>
              <path fill="#5fb4f0" d="M6 4h41v18H6V4z"/>
              <path fill="#3a6e92" d="M9 6h41v18H9V6z"/>
            </svg>
          </div>
        </span>
        <span slot="data">
          {#each tempManualGames as game}
            <ManualGameEntry game={game} onRemove={removeHandler} />
          {/each}
        </span>
      </Table>
      <div class="buttons">
        <Button label="Save Changes" onClick={saveChanges} width="47.5%" disabled={!canSave} />
        <Button label="Cancel" onClick={cancel} width="47.5%" />
      </div>
    </div>
    <div class="right">
      <div class="options">
        <div class="dropdown-cont">
          <div style="margin-right: 7px;">Method for Adding Games:</div>
          <DropDown options={addMethods} bind:value={selectedAddMethod} width="100px" onChange={() => {}} showTooltip={false} />
        </div>
        <VerticalSpacer />
      </div>
      <div class="section-label">Game Info</div>
      <div class="border" style="margin-right: 20px; width: calc(100% - 20px);" />
      <VerticalSpacer />
      {#if selectedAddMethod == "search"}
        <Search onGameSave={addNewGame} />
      {:else if selectedAddMethod == "manual"}
        <Manual onGameSave={addNewGame} />
      {/if}
    </div>
  </div>
</ModalBody>

<style>
  .border {
    margin-top: 7px;
    border-bottom: 1px solid var(--foreground);
  }

  .content {
    width: 100%;
    display: flex;
  }

  .left {
    margin-right: 10px;
    width: 430px;
  }

  .right {
    margin-left: 10px;
    width: 430px;
  }

  .info {
    margin-top: 7px;
    margin-left: 7px;
    font-size: 14px;
  }

  .batch-icon {
    fill: var(--font-color);
    margin-left: 9px;
    margin-right: 14px;

    cursor: pointer;
  }
  .exist-art-icon {
    fill: var(--font-color);
    margin-left: auto;
    margin-right: 14px;

    cursor: pointer;
  }

  .dropdown-cont {
    width: 85%;
    
    display: flex;

    font-size: 14px;
    align-items: center;
  }

  .options {
    margin-top: 7px;
  }

  .section-label {
    margin-top: 8px;
    font-size: 20px;
  }

  .buttons {
    margin-top: 14px;
    margin-bottom: 7px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
