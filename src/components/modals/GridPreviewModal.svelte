<script lang="ts">
  import MarkDownIt from "markdown-it";

  import { AppController } from "@controllers";
  import { Button } from "@interactables";
  import { gridType, manualSteamGames, nonSteamGames, selectedGameAppId, steamGames } from "@stores/AppState";
  import { gridModalInfo, showGridModal } from "@stores/Modals";
  import { GridTypes } from "@types";
  import { PREVIEW_GRID_DIMENSIONS } from "@utils";
  import Lazy from "svelte-lazy";
  import ModalBody from "./modal-utils/ModalBody.svelte";

  let modalOpen = true;
  $: definedModalInfo = $gridModalInfo!;
  console.log("definedModalInfo:", $gridModalInfo)

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
    AppController.setSteamGridArt(definedModalInfo);
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

<ModalBody title={`${games.find((game) => game.appid.toString() === $selectedGameAppId)?.name} #${$gridModalInfo?.id}`} open={modalOpen} on:close={() => modalOpen = false} on:closeEnd={onClose}>
  <div class="content {$gridType.split(" ").join("-").toLowerCase()}">
    <div class="img-cont" style="max-width: {PREVIEW_GRID_DIMENSIONS.widths[$gridType]}rem; max-height: {PREVIEW_GRID_DIMENSIONS.heights[$gridType]}rem; width: {definedModalInfo.width || 256}rem; height: {definedModalInfo.height || 256}rem;">
      <div class="img" class:logo-background={$gridType === GridTypes.LOGO} class:icon-background={$gridType === GridTypes.ICON} style="max-height: {PREVIEW_GRID_DIMENSIONS.heights[$gridType]}rem;">
        <Lazy height="{PREVIEW_GRID_DIMENSIONS.heights[$gridType]}rem" fadeOption={{ delay: 500, duration: 1000 }}>
          <img
            src="{$gridType === GridTypes.ICON ? $gridModalInfo?.thumb?.toString() : $gridModalInfo?.url?.toString()}"
            alt="{$gridModalInfo?.author?.name}'s {$gridType} image"
            style="max-width: {PREVIEW_GRID_DIMENSIONS.widths[$gridType]}rem; max-height: {PREVIEW_GRID_DIMENSIONS.heights[$gridType]}rem; width: auto; height: auto;"
          />
        </Lazy>
      </div>
    </div>
    <div class="info">
      <div>
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
        <Button on:click={applyGrid} width="100%">Apply</Button>
      </div>
    </div>
  </div>
</ModalBody>

<style>
  .border {
    margin-top: 0.5rem;
    border-bottom: 0.0625rem solid var(--foreground);
  }

  .capsule {
    display: flex;
    flex-direction: row;
    height: calc(100% - 30.5rem);
  }
  .capsule .info, .icon .info {
    margin: 0.5rem;
    margin-right: 0rem;
    min-width: 12.5rem;
    min-height: calc(100% - 1.25rem);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .wide-capsule .info, .hero .info, .logo .info {
    margin-bottom: 0.5rem;
    margin-top: 0.5rem;
    min-width: 12.5rem;
    min-height: calc(100% - 1.25rem);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .icon {
    display: flex;
    flex-direction: row;
    height: calc(100% - 30.5rem);
    max-width: 34.375rem;
  }

  .img-cont {
    margin-top: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .img-cont > .img {
    border-radius: 0.125rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .logo-background {
    border-radius: 0.5rem;
    background-color: #a3a3a3;
    background-image: linear-gradient(140deg, #adadad 0%, #727272 50%, #535353 75%);
    padding: 0.25rem;
    height: 100%;
  }

  .icon-background {
    border-radius: 0.5rem;
    background-color: #a3a3a3;
    background-image: linear-gradient(140deg, #adadad 0%, #727272 50%, #535353 75%);
    padding: 0.25rem;
    height: 16rem;
    width: 16rem;
  }

  .author {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .author > .name {
    margin-left: 0.5rem;
    font-size: 1rem;
  }

  .author > .pfp > img {
    max-width: 1.25rem;
    max-height: 1.25rem;
    width: auto;
    height: auto;
  }

  .label {
    margin-top: 0.5rem;
    font-size: 1rem;
  }
  .label-small { font-size: 0.875rem; }

  .notes {
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }

  .buttons {
    margin-top: 0.875rem;
    width: 100%;
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
