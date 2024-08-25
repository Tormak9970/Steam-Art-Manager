<script lang="ts">
  import { open } from "@tauri-apps/plugin-shell";
  import MarkDownIt from "markdown-it";

  import { AppController } from "@controllers";
  import { Button } from "@interactables";
  import { GridTypes, gridType, manualSteamGames, nonSteamGames, selectedGameAppId, steamGames } from "@stores/AppState";
  import { gridModalInfo, showGridModal } from "@stores/Modals";
  import { PREVIEW_GRID_DIMENSIONS } from "@utils";
  import Lazy from "svelte-lazy";
  import ModalBody from "./modal-utils/ModalBody.svelte";


  $: definedModalInfo = $gridModalInfo!;

  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showGridModal = false;
		$gridModalInfo = null;
  }

  const mdIt = new MarkDownIt({
    html: true,
    linkify: true
  });
  
  $: games = [ ...$steamGames, ...$manualSteamGames, ...$nonSteamGames ];

  /**
   * Apply the grid being previewed.
   */
  function applyGrid(): void {
    AppController.setSteamGridArt(definedModalInfo.id, definedModalInfo.url);
  }

  /**
   * Handles click events to redirect to the browser.
   * @param e The click event.
   */
  function clickListener(e: Event): void {
    const origin = (e.target as Element).closest("a");
  
    if (origin) {
      e.preventDefault();
      const href = origin.href;
      open(href);
    }
  }
</script>

<ModalBody title={`${games.find((game) => game.appid === $selectedGameAppId)?.name} - ${$gridType} #${$gridModalInfo?.id}`} onClose={onClose}>
  <div class="content {$gridType.split(" ").join("-").toLowerCase()}">
    <div class="img-cont" style="max-width: {PREVIEW_GRID_DIMENSIONS.widths[$gridType]}px; max-height: {PREVIEW_GRID_DIMENSIONS.heights[$gridType]}px; width: {definedModalInfo.width}px; height: {definedModalInfo.height}px;">
      <div class="img" class:logo-background={$gridType === GridTypes.LOGO} class:icon-background={$gridType === GridTypes.ICON} style="max-height: {PREVIEW_GRID_DIMENSIONS.heights[$gridType]}px;">
        <Lazy height="{PREVIEW_GRID_DIMENSIONS.heights[$gridType]}px" fadeOption={{ delay: 500, duration: 1000 }}>
          <img src="{$gridType === GridTypes.ICON ? $gridModalInfo?.thumb?.toString() : $gridModalInfo?.url?.toString()}" alt="{$gridModalInfo?.author?.name}'s {$gridType} image" style="max-width: {PREVIEW_GRID_DIMENSIONS.widths[$gridType]}px; max-height: {PREVIEW_GRID_DIMENSIONS.heights[$gridType]}px; width: auto; height: auto;" />
        </Lazy>
      </div>
    </div>
    <div class="info">
      <div class="info-cont">
        <div class="author">
          <div class="pfp">
            <img src="{$gridModalInfo?.author?.avatar?.toString()}" alt="{$gridModalInfo?.author?.name}'s profile picture" />
          </div>
          <div class="name">{$gridModalInfo?.author?.name}</div>
        </div>
        <div class="label-small">Style: {$gridModalInfo?.style}</div>
        <div class="label-small">Dimensions: {$gridModalInfo?.width}x{$gridModalInfo?.height}</div>
        {#if $gridModalInfo?.notes}
          <div class="label">Notes:</div>
          <div class="border" />
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="notes" on:click={clickListener}>{@html mdIt.render($gridModalInfo?.notes)}</div>
        {:else}
          <div class="border" />
        {/if}
      </div>
      <div class="buttons">
        <Button label="Apply" onClick={applyGrid} width="100%" />
      </div>
    </div>
  </div>
</ModalBody>

<style>
  .border {
    margin-top: 7px;
    border-bottom: 1px solid var(--foreground);
  }

  .capsule {
    display: flex;
    flex-direction: row;
    height: calc(100% - 38px);
  }
  .capsule .info {
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 4px;
    margin-right: 10px;
    min-width: 200px;
    min-height: calc(100% - 20px);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .capsule .info > .info-cont {
    min-width: 200px;

    display: flex;
    flex-direction: column;
  }

  .wide-capsule .info, .hero .info, .logo .info {
    margin-bottom: 10px;
    margin-left: 14px;
    margin-right: 10px;
    min-width: 200px;
    min-height: calc(100% - 20px);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .icon {
    display: flex;
    flex-direction: row;
    height: calc(100% - 38px);
    max-width: 550px;
  }
  .icon .info {
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 4px;
    margin-right: 10px;
    min-width: 200px;
    min-height: calc(100% - 20px);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .icon .info > .info-cont {
    min-width: 200px;

    display: flex;
    flex-direction: column;
  }

  .img-cont { padding: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; }

  .img-cont > .img {
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .logo-background {
    border-radius: 8px;
    background-color: #a3a3a3;
    background-image: linear-gradient(140deg, #adadad 0%, #727272 50%, #535353 75%);
    padding: 5px;
  }

  .icon-background {
    border-radius: 8px;
    background-color: #a3a3a3;
    background-image: linear-gradient(140deg, #adadad 0%, #727272 50%, #535353 75%);
    padding: 5px;
    height: 256px;
    width: 256px;
  }

  .author {
    display: flex;
    align-items: center;
    margin-bottom: 7px;
  }

  .author > .name {
    margin-left: 7px;
    font-size: 16px;
  }

  .author > .pfp > img {
    max-width: 20px;
    max-height: 20px;
    width: auto;
    height: auto;
  }

  .label {
    margin-top: 7px;
    font-size: 16px;
  }
  .label-small { font-size: 14px; }

  .notes {
    margin-top: 7px;
    font-size: 14px;
  }

  .buttons {
    margin-top: 14px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
