<!--
 DarkestDungeon Save Editor is a tool for viewing and modifying DarkestDungeon game saves.
 Copyright (C) 2022 Travis Lane (Tormak)
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https://www.gnu.org/licenses/>
 -->
<script lang="ts">
  import Lazy from "svelte-lazy";
  import { GridTypes, gridModalInfo, gridType, nonSteamGames, selectedGameAppId, showGridModal, steamGames } from "../../Stores";
  import VerticalSpacer from "../spacers/VerticalSpacer.svelte";
  import Button from "../interactables/Button.svelte";
  import { AppController } from "../../lib/controllers/AppController";
  
  import MarkDownIt from "markdown-it";
    import { open } from "@tauri-apps/api/shell";

  export let show: boolean = false;
  export let onClose: () => void;

  const mdIt = new MarkDownIt({ //try "commonmark"
    html: true,
    linkify: true
  });
  
  $: games = [...$steamGames, ...$nonSteamGames];

  const widths = {
    "Capsule": 400,
    "Wide Capsule": 600,
    "Hero": 956,
    "Logo": 600,
    "Icon": 256,
  };

  const heights = {
    "Capsule": 600,
    "Wide Capsule": 291,
    "Hero": 342,
    "Logo": 402,
    "Icon": 256,
  };

  function applyGrid() {
    AppController.setSteamGridArt($gridModalInfo.id, $gridModalInfo.url);
  }

  /**
   * Handles click events to redirect to the browser.
   * @param e The click event.
   */
  function clickListener(e: Event) {
    const origin = (e.target as Element).closest(`a`);
  
    if (origin) {
      e.preventDefault();
      const href = origin.href;
      open(href);
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="background" class:show on:click={onClose}>
  <div class="modal-body" on:click|stopPropagation>
    <div class="close-btn" on:click={onClose}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
      </svg>
    </div>
    <div class="header">{games.find((game) => game.appid == $selectedGameAppId)?.name} - {$gridType} #{$gridModalInfo?.id}</div>
    <div class="border" />
    <div class="content {$gridType.split(" ").join("-").toLowerCase()}">
      <div class="img-cont">
        <div class="img" class:logo-background={$gridType == GridTypes.LOGO} class:icon-background={$gridType == GridTypes.ICON} style="max-height: {heights[$gridType]}px;">
          <Lazy height="{heights[$gridType]}px" fadeOption={{delay: 500, duration: 1000}}>
            <img src="{$gridModalInfo?.url?.toString()}" alt="{$gridModalInfo?.author}'s {$gridType} image" style="max-width: {widths[$gridType]}px; max-height: {heights[$gridType]}px; width: auto; height: auto;" />
          </Lazy>
        </div>
      </div>
      <div class="info">
        <div class="info-cont">
          <div class="author">
            <div class="pfp">
              <img src="{$gridModalInfo?.author?.avatar?.toString()}" alt="{$gridModalInfo?.author}'s profile picture" />
            </div>
            <div class="name">{$gridModalInfo?.author?.name}</div>
          </div>
          <VerticalSpacer />
          <div class="label-small">Style: {$gridModalInfo?.style}</div>
          <div class="label-small">Dimensions: {$gridModalInfo?.width}x{$gridModalInfo?.height}</div>
          <VerticalSpacer />
          {#if $gridModalInfo?.notes}
            <VerticalSpacer />
            <div class="label">Notes:</div>
            <div class="border" />
            <VerticalSpacer />
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
    display: none;
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

  .show { display: flex; }

  .modal-body {
    margin: auto;
    background-color: var(--background);
    border-radius: 2px;
    border: 1px solid var(--shadow);
    position: relative;
  }

  .header {
    text-align: center;
    font-size: 20px;
    margin-top: 4px;
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

  .img-cont { padding: 10px; }

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
    font-size: 16px;
  }
  .label-small { font-size: 14px; }

  .notes { font-size: 14px; }

  .buttons {
    margin-top: 14px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
