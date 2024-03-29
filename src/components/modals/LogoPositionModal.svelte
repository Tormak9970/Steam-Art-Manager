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
  import { appLibraryCache, manualSteamGames, nonSteamGames, originalLogoPositions, selectedGameAppId, steamGames, steamLogoPositions, unfilteredLibraryCache } from "../../stores/AppState";
  import Button from "../interactables/Button.svelte";
  import { AppController } from "../../lib/controllers/AppController";
  import { afterUpdate, onMount } from "svelte";
  import { tauri } from "@tauri-apps/api";
  import DropDown from "../interactables/DropDown.svelte";
  import Slider from "../interactables/Slider.svelte";
  import { fade } from "svelte/transition";
  import ModalBody from "./modal-utils/ModalBody.svelte";
  import { showLogoPositionModal } from "../../stores/Modals";
  import Spacer from "../layout/Spacer.svelte";
    import { IMAGE_FADE_OPTIONS } from "../../lib/utils/ImageConstants";

  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showLogoPositionModal = false;
  }

  type LogoCssStyles = {
    top: number,
    bottom: number,
    right: number,
    left: number
  }

  const anchorPos: LogoPinPositions[] = [ "BottomLeft", "UpperCenter", "CenterCenter", "BottomCenter" ];
  const dropdownOptions = anchorPos.map((anchorPos: LogoPinPositions) => {
    return {
      label: anchorPos.split(/(?=[A-Z])/).join(" "),
      data: anchorPos
    }
  });
  
  $: games = [ ...$steamGames, ...$manualSteamGames, ...$nonSteamGames ];
  $: game = games.find((game) => game.appid === $selectedGameAppId);
  let heroPath = "";
  let logoPath = "";

  let canSave = false;
  
  const gameLogoPos = $steamLogoPositions[$selectedGameAppId];

  let originalWidth = gameLogoPos?.logoPosition?.nWidthPct ?? 50;
  let originalHeight = gameLogoPos?.logoPosition?.nHeightPct ?? 50;
  let originalPosition: LogoPinPositions = gameLogoPos?.logoPosition?.pinnedPosition ?? "CenterCenter";

  let logoWidth = (gameLogoPos && gameLogoPos?.logoPosition?.pinnedPosition !== "REMOVE") ? gameLogoPos?.logoPosition?.nWidthPct : 50;
  let logoHeight = (gameLogoPos && gameLogoPos?.logoPosition?.pinnedPosition !== "REMOVE") ? gameLogoPos?.logoPosition?.nHeightPct : 50;
  let logoPosition: LogoPinPositions = (gameLogoPos && gameLogoPos?.logoPosition?.pinnedPosition !== "REMOVE") ? gameLogoPos?.logoPosition?.pinnedPosition : "CenterCenter";

  let currentCssStyles: LogoCssStyles = getLogoPosition(logoPosition, logoHeight, logoWidth);
  
  $: canClear = !!$originalLogoPositions[game.appid] && $steamLogoPositions[$selectedGameAppId]?.logoPosition.pinnedPosition !== "REMOVE";

  const widths = {
    "Hero": 956,
    "Logo": 600
  };

  const heights = {
    "Hero": 342,
    "Logo": 402
  };

  /**
   * Gets the css styles for the current logo settings.
   * @param pos The position of the logo.
   * @param heightPct The height offset of the logo.
   * @param widthPct The width offset of the logo.
   */
  function getLogoPosition(pos: LogoPinPositions, heightPct: number, widthPct: number): LogoCssStyles {
    const positions = {
      BottomLeft: {
        bottom: 0,
        top: 100 - heightPct,
        left: 0,
        right: 100 - widthPct,
      },
      CenterCenter: {
        bottom: (100 - heightPct) / 2,
        top: (100 - heightPct) / 2,
        left: (100 - widthPct) / 2,
        right: (100 - widthPct) / 2,
      },
      UpperCenter: {
        bottom: 100 - heightPct,
        top: 0,
        left: (100 - widthPct) / 2,
        right: (100 - widthPct) / 2,
      },
      BottomCenter: {
        bottom: 0,
        top: 100 - heightPct,
        left: (100 - widthPct) / 2,
        right: (100 - widthPct) / 2,
      },
    };
    return positions[pos];
  }

  /**
   * Apply the logo position changes.
   */
  function applyChanges(): void {
    AppController.setLogoPosition($selectedGameAppId, logoPosition, logoHeight, logoWidth);
    onClose();
  }

  /**
   * Clears any changes made to the logo position.
   */
  function clearLogoPosition(): void {
    AppController.clearLogoPosition($selectedGameAppId);
    onClose();
  }

  afterUpdate(() => {
    currentCssStyles = getLogoPosition(logoPosition, logoHeight, logoWidth);
    const originalLogoConfig = $originalLogoPositions[$selectedGameAppId]?.logoPosition;
    canSave = ((originalHeight !== logoHeight) || (originalWidth !== logoWidth) || (originalPosition !== logoPosition))
      || ((originalLogoConfig?.nHeightPct !== logoHeight) || (originalLogoConfig?.nWidthPct !== logoWidth) || (originalLogoConfig?.pinnedPosition !== logoPosition));
  });

  onMount(() => {
    if ($appLibraryCache[$selectedGameAppId]?.Hero) {
      if ($appLibraryCache[$selectedGameAppId].Hero === "REMOVE") {
        heroPath = tauri.convertFileSrc($unfilteredLibraryCache[$selectedGameAppId].Hero);
      } else {
        heroPath = tauri.convertFileSrc($appLibraryCache[$selectedGameAppId].Hero);
      }
    } else {
      heroPath = "";
    }

    if ($appLibraryCache[$selectedGameAppId]?.Logo) {
      if ($appLibraryCache[$selectedGameAppId].Logo === "REMOVE") {
        logoPath = tauri.convertFileSrc($unfilteredLibraryCache[$selectedGameAppId].Logo);
      } else {
        logoPath = tauri.convertFileSrc($appLibraryCache[$selectedGameAppId].Logo);
      }
    }
    
    const originalLogoConfig = $originalLogoPositions[$selectedGameAppId]?.logoPosition;
    canSave = (originalLogoConfig?.nHeightPct !== logoHeight) || (originalLogoConfig?.nWidthPct !== logoWidth) || (originalLogoConfig?.pinnedPosition !== logoPosition);
  });
</script>

<ModalBody title={`Set Logo Position for ${game?.name}`} onClose={onClose}>
  <div class="content">
    <div class="view">
      <div class="hero-cont">
        <div class="img" class:missing-background={heroPath === ""} style="max-height: {heights.Hero}px;">
          {#if heroPath !== ""}
            <img src="{heroPath}" alt="Hero image for {game?.name}" style="max-width: {widths.Hero}px; max-height: {heights.Hero}px; width: auto; height: auto;" />
          {/if}
        </div>
      </div>
      <div class="logo-cont" style="justify-content: {logoPosition.includes("Bottom") ? "flex-end" : (logoPosition.includes("Upper") ? "flex-start" : "center")}; align-items: {logoPosition.includes("Left") ? "flex-start" : "center"}; height: {logoHeight}%; width: {logoWidth}%; top: {currentCssStyles.top}%; bottom: {currentCssStyles.bottom}%; right: {currentCssStyles.right}%; left: {currentCssStyles.left}%;">
        <img in:fade={IMAGE_FADE_OPTIONS} src="{logoPath}" alt="Logo image for {game?.name}" style="max-height: 100%; max-width: 100%; width: auto; height: auto;" />
      </div>
    </div>
    <div class="interactables">
      <div class="logo-size">
        <Slider label="Width" bind:value={logoWidth} width="200px" />
      </div>
      <div class="logo-size">
        <Slider label="Height" bind:value={logoHeight} width="200px" />
      </div>
      <div class="logo-position">
        <DropDown label="Position" options={dropdownOptions} bind:value={logoPosition} width="140px" direction="UP" />
      </div>
      {#if canClear}
        <Button label="Save" onClick={applyChanges} width="182px" disabled={!canSave} />
        <Spacer orientation="HORIZONTAL" />
        <Spacer orientation="HORIZONTAL" />
        <Button label="Reset" onClick={clearLogoPosition} width="102px" />
      {:else}
        <Button label="Save" onClick={applyChanges} width="300px" disabled={!canSave} />
      {/if}
    </div>
  </div>
</ModalBody>

<style>
  .content {
    margin-bottom: 10px;
    margin-left: 10px;
    margin-right: 10px;
    min-width: 200px;
    min-height: calc(100% - 20px);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .view {
    width: calc(100% - 20px);
    position: relative;
    margin: 10px;
  }

  .logo-cont {
    position: absolute;
    display: flex;
    flex-direction: column;
    border: 2px solid var(--highlight-transparent);
    border-radius: 2px;
  }

  .hero-cont > .img {
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .missing-background {
    width: 956px;
    height: 342px;
    border-radius: 2px;
    background-color: #a3a3a3;
    background-image: linear-gradient(140deg, #adadad 0%, #727272 50%, #535353 75%);
  }

  .interactables {
    width: calc(100% - 20px);
    padding: 0px 10px;

    display: flex;
  }

  .logo-size { width: 220px; }
  .logo-position { width: 220px; }
</style>
