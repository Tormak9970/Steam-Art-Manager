<script lang="ts">
  import { AppController, LogController, ToastController } from "@controllers";
  import { Info, SGDBLogo, Steam } from "@icons";
  import { Button, DropDown } from "@interactables";
  import { Table } from "@layout";
  import { appLibraryCache, manualSteamGames, originalAppLibraryCache, selectedManualGamesAddMethod, steamGames } from "@stores/AppState";
  import { showManualGamesModal } from "@stores/Modals";
  import type { GameStruct } from "@types";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import Manual from "./add-methods/Manual.svelte";
  import Search from "./add-methods/Search.svelte";
  import ManualGameEntry from "./ManualGameEntry.svelte";

  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showManualGamesModal = false;
  }
  
  let open = true;
  let canSave = false;

  const originalManualGames = $manualSteamGames;
  let tempManualGames: GameStruct[] = structuredClone(originalManualGames);

  let addMethods = [
    { label: "Manual", data: "manual" },
    { label: "Search", data: "search" }
  ];

  /**
   * Adds a game to the new manual games list.
   * @param game The new game to add.
   */
  function addNewGame(game: GameStruct): void {
    if ($steamGames.find((sGame) => sGame.appid === game.appid) || tempManualGames.find((tGame) => tGame.appid === game.appid)) {
      ToastController.showWarningToast("Game with that appid already exists! Can't have duplicates.");
    } else {
      LogController.log(`Added manually added game ${game.name}.`);
      tempManualGames.push(game);
      tempManualGames = [ ...tempManualGames ];
      canSave = structuredClone(originalManualGames) !== structuredClone(tempManualGames);
    }
  }

  /**
   * Removes a game from the new manual games list.
   * @param game The game to remove.
   */
  function removeHandler(game: GameStruct): void {
    LogController.log(`Removed manually added game ${game.name}.`);
    const index = tempManualGames.findIndex((g) => g.appid === game.appid);
    tempManualGames.splice(index, 1);
    tempManualGames = [ ...tempManualGames ];
    canSave = structuredClone(originalManualGames) !== structuredClone(tempManualGames);
  }

  /**
   * Adds all of the provided games.
   */
  async function saveChanges() {
    $manualSteamGames = structuredClone(tempManualGames);

    const originalAppLibCache = $originalAppLibraryCache;
    const appLibCache = $appLibraryCache;

    for (const game of tempManualGames) {
      if (!originalAppLibCache[game.appid]) originalAppLibCache[game.appid] = { "Capsule": "", "Wide Capsule": "", "Hero": "", "Logo": "", "Icon": "" };
      if (!appLibCache[game.appid]) appLibCache[game.appid] = { "Capsule": "", "Wide Capsule": "", "Hero": "", "Logo": "", "Icon": "" };
    }

    originalAppLibraryCache.set(structuredClone(originalAppLibCache));
    appLibraryCache.set(structuredClone(appLibCache));

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

<ModalBody title={"Manage Manual Games"} open={open} on:close={() => open = false} on:closeEnd={onClose}>
  <div class="content">
    <div class="left">
      <div class="info">
        Add any Steam games that SARM isn't picking up. These will be automatically loaded each time you use SARM.
      </div>
      <div class="section-label">Your Manual Games</div>
      <Table>
        <span slot="header">
          <div class="batch-icon" use:AppController.tippy={{ content: "Current Manual Games", placement: "top", onShow: AppController.onTippyShow }}>
            <Info style="height: 12px; width: 12px;" />
          </div>
          <div>Name</div>
          <div class="exist-art-icon" use:AppController.tippy={{ content: "Has official art on this PC", placement: "top", onShow: AppController.onTippyShow }}>
            <Steam style="height: 12px; width: 12px;" />
          </div>
          <div class="exist-art-icon" style="margin-left: 18px; margin-right: 34px;" use:AppController.tippy={{ content: "Has custom art on this PC", placement: "top", onShow: AppController.onTippyShow }}>
            <SGDBLogo style="height: 12px; width: 16px;" />
          </div>
        </span>
        <span slot="data">
          {#each tempManualGames as game}
            <ManualGameEntry game={game} onRemove={removeHandler} />
          {/each}
        </span>
      </Table>
      <div class="buttons">
        <Button on:click={cancel} width="47.5%">Cancel</Button>
        <Button on:click={saveChanges} width="47.5%" disabled={!canSave}>Save Changes</Button>
      </div>
    </div>
    <div class="right">
      <div class="options">
        <div class="dropdown-cont">
          <div style="margin-right: 7px;">Method for Adding Games:</div>
          <DropDown options={addMethods} bind:value={$selectedManualGamesAddMethod} width="100px" showTooltip={false} />
        </div>
      </div>
      <div class="section-label">Game Info</div>
      <div class="border" style="margin-right: 20px; margin-bottom: 7px; width: calc(100% - 20px);" />
      {#if $selectedManualGamesAddMethod === "search"}
        <Search onGameSave={addNewGame} />
      {:else if $selectedManualGamesAddMethod === "manual"}
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
    margin-bottom: 7px;
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

    margin-bottom: 7px;
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
    width: 100%;
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }
</style>
