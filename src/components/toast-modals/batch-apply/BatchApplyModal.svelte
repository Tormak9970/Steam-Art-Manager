<script lang="ts">
  import { GridTypes, Platforms, appLibraryCache, gridType, nonSteamGames, showBatchApplyProgress, steamGames } from "../../../Stores";
  import Button from "../../interactables/Button.svelte";
  import { AppController } from "../../../lib/controllers/AppController";
  import DropDown from "../../interactables/DropDown.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SelectedGameEntry from "./SelectedGameEntry.svelte";
  import { onMount } from "svelte";
  import { ToastController } from "../../../lib/controllers/ToastController";

  export let onClose: () => void;
  
  $: allGames = [...$steamGames, ...$nonSteamGames];

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
  let selectedPlatform = "All";

  let gameFilters = [
    { label: "All", data: "All" },
    { label: "Missing", data: "Missing" }
  ];
  let selectedGamesFilter =  "All";

  let gamesToFilter = [];
  let selectedGames = {};

  function onStateChange(platform: string, gameFilter: string) {
    gamesToFilter = (platform == "All" ? allGames : (platform == Platforms.STEAM ? $steamGames : $nonSteamGames));
    const selectedGameEntries = gamesToFilter.map((game) => {
      return [game.appid, gameFilter == "All" ? true : (!$appLibraryCache[game.appid][$gridType])];
    });

    selectedGames = Object.fromEntries(selectedGameEntries);
  }

  function onEntryChange(appid: number, isChecked: boolean): void {
    selectedGames[appid] = isChecked;
  }

  /**
   * Batch applies grids to all games.
   */
  function batchApply() {
    const selectedGameIds = Object.keys(selectedGames).filter((appid) => !!selectedGames[appid]);
    AppController.batchApplyGrids(selectedGameIds);
    $showBatchApplyProgress = true;
    onClose();
  }

  /**
   * Cancels batch applying grids.
   */
  function cancel() {
    ToastController.showGenericToast("Cancelled Batch Apply.");
    onClose();
  }

  function closeWrapper(e: Event) {
    if (e.currentTarget == e.target) onClose();
  }

  onMount(() => {
    onStateChange(selectedPlatform, selectedGamesFilter);
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="background" on:click={closeWrapper}>
  <div class="modal-body"> <!-- on:click|stopPropagation -->
    <div class="close-btn" on:click={onClose}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
      </svg>
    </div>
    <div class="header">Batch Apply {$gridType != GridTypes.HERO ? $gridType : `${$gridType}e`}s</div>
    <div class="border" />
    <div class="content">
      <div class="info">
        Configure the games you would like to batch apply grids to.
      </div>
      <div class="options">
        <DropDown label="Platforms" options={platforms} bind:value={selectedPlatform} width="100px" onChange={(platform) => { onStateChange(platform, selectedGamesFilter); }} />
        <VerticalSpacer />
        <DropDown label="Filters" options={gameFilters} bind:value={selectedGamesFilter} width="100px" onChange={(gamesFilter) => { onStateChange(selectedPlatform, gamesFilter); }} />
      </div>
      <div class="selected-games">
        <div class="games-header">
          <div class="batch-icon" use:AppController.tippy={{ content: "Checked games will be included", placement: "left", onShow: AppController.onTippyShow }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 12px; width: 12px;">
              <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>
            </svg>
          </div>
          <div>Name</div>
          <div style="margin-left: auto; margin-right: 45px;">Platform</div>
        </div>
        <div class="border" style="margin-top: 3px;"></div>
        <div class="games-list-scroller">
          <div class="games-list">
            {#each gamesToFilter as game}
              <SelectedGameEntry game={game} platform={selectedPlatform != "All" ? selectedPlatform : ($steamGames.some((steamGame) => steamGame.appid == game.appid) ? Platforms.STEAM : Platforms.NON_STEAM)} isChecked={!!selectedGames[game.appid]} onChange={onEntryChange} />
            {/each}
          </div>
        </div>
      </div>
      <div class="buttons">
        <Button label="Apply" onClick={batchApply} width="47.5%" />
        <Button label="Cancel" onClick={cancel} width="47.5%" />
      </div>
    </div>
  </div>
</div>

<style>
  @import "/theme.css";

  .background {
    font-size: 12px;
    z-index: 3;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.6);
    width: 100%;
    height: calc(100% - 30px);
    display: flex;
  }

  .border {
    margin-top: 7px;
    border-bottom: 1px solid var(--foreground);
  }

  .close-btn {
    position: absolute;
    height: 20px;
    width: 20px;
    fill: var(--font-color);

    top: 2px;
    right: 2px;

    background-color: var(--background);
    padding: 3px;
    border-radius: 2px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .close-btn:hover {
    cursor: pointer;
    background-color: var(--background-hover);
  }

  .modal-body {
    margin: auto;
    background-color: var(--background);
    border-radius: 2px;
    border: 1px solid var(--shadow);
    position: relative;

    width: 440px;
  }

  .header {
    text-align: center;
    font-size: 20px;
    margin-top: 4px;
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

  .options {
    margin-top: 7px;
    margin-left: 7px;
  }

  .selected-games {
    margin-top: 7px;
    margin-left: 7px;

    width: calc(100% - 28px);

    height: 400px;
    
    padding: 7px;

    background-color: var(--background-dark);
  }

  .games-header {
    width: 100%;

    display: flex;
    justify-content: flex-start;
  }

  .games-list {
    margin-top: 3px;
    width: 100%;

    overflow: hidden;
  }

  .games-list-scroller {
    margin-top: 3px;
    width: 100%;

    height: calc(100% - 20px);

    overflow: scroll;
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
