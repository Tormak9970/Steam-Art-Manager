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

  export let show: boolean = false;
  export let onClose: () => void;
  
  $: games = [...$steamGames, ...$nonSteamGames];

  const widths = {
    "Capsule": 300,
    "Wide Capsule": 600,
    "Hero": 956,
    "Logo": 200,
    "Icon": 60,
  };

  const heights = {
    "Capsule": 450,
    "Wide Capsule": 291,
    "Hero": 342,
    "Logo": 134,
    "Icon": 60,
  };

  function applyGrid() {
    AppController.setSteamGridArt($gridModalInfo.id, $gridModalInfo.url);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="background" class:show on:click={onClose}>
  <div class="modal-body" on:click|stopPropagation>
    <div class="header">{games.find((game) => game.appid == $selectedGameAppId)?.name} - {$gridType} #{$gridModalInfo?.id}</div>
    <div class="border" />
    <div class="content {$gridType.split(" ").join("-").toLowerCase()}">
      <div class="img-cont">
        <div class="img" style="height: {heights[$gridType]}px;">
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
          <VerticalSpacer />
          {#if $gridType == GridTypes.CAPSULE}
            <div class="label">Notes:</div>
            <div class="border" />
            <VerticalSpacer />
            <div class="notes">{$gridModalInfo}</div>
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
    top: 30px;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.6);
    width: 100%;
    height: 100%;
    display: none;
  }

  .border {
    margin-top: 7px;
    border-bottom: 1px solid var(--foreground);
  }

  .show { display: flex; }

  .modal-body {
    margin: auto;
    background-color: var(--background);
    border-radius: 2px;
    border: 1px solid var(--shadow); /* consider removing this */
  }

  .header {
    text-align: center;
    font-size: 20px;
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

  .wide-capsule .info {
    margin-bottom: 10px;
    margin-left: 14px;
    margin-right: 10px;
    min-width: 200px;
    min-height: calc(100% - 20px);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .hero .info {
    margin-bottom: 10px;
    margin-left: 14px;
    margin-right: 10px;
    min-width: 200px;
    min-height: calc(100% - 20px);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .img-cont { padding: 10px; }

  .img-cont > .img {
    border-radius: 2px;
    overflow: hidden;
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
