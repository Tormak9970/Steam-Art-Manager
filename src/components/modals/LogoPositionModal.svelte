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
  import { AppController } from "@controllers";
  import { Button, DropDown, Slider } from "@interactables";
  import { appLibraryCache, manualSteamGames, nonSteamGames, originalLogoPositions, selectedGameAppId, steamGames, steamLogoPositions, unfilteredLibraryCache } from "@stores/AppState";
  import { showLogoPositionModal } from "@stores/Modals";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import type { LogoPinPositions } from "@types";
  import { IMAGE_FADE_OPTIONS } from "@utils";
  import { afterUpdate, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import ModalBody from "./modal-utils/ModalBody.svelte";

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
  $: game = games.find((game) => game.appid.toString() === $selectedGameAppId)!;
  let heroPath = "";
  let logoPath = "";

  let open = true;
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
    "Hero": 59.75,
    "Logo": 12.5
  };

  const heights = {
    "Hero": 21.375,
    "Logo": 25.125
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
    // @ts-expect-error REMOVE will never be pos' value.
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
        const heroImagePath = $unfilteredLibraryCache[$selectedGameAppId].Hero;
        heroPath = heroImagePath ? convertFileSrc(heroImagePath) : "";
      } else {
        heroPath = convertFileSrc($appLibraryCache[$selectedGameAppId].Hero);
      }
    } else {
      heroPath = "";
    }

    if ($appLibraryCache[$selectedGameAppId]?.Logo) {
      if ($appLibraryCache[$selectedGameAppId].Logo === "REMOVE") {
        const logoImagePath = $unfilteredLibraryCache[$selectedGameAppId].Logo;
        logoPath = logoImagePath ? convertFileSrc(logoImagePath) : "";
      } else {
        logoPath = convertFileSrc($appLibraryCache[$selectedGameAppId].Logo);
      }
    }
    
    const originalLogoConfig = $originalLogoPositions[$selectedGameAppId]?.logoPosition;
    canSave = (originalLogoConfig?.nHeightPct !== logoHeight) || (originalLogoConfig?.nWidthPct !== logoWidth) || (originalLogoConfig?.pinnedPosition !== logoPosition);
  });
</script>

<ModalBody title={`Set Logo Position for ${game?.name}`} open={open} on:close={() => open = false} on:closeEnd={onClose}>
  <div class="content">
    <div class="view">
      <div class="hero-cont">
        <div class="img" class:missing-background={heroPath === ""} style="max-height: {heights.Hero}rem;">
          {#if heroPath !== ""}
            <img src="{heroPath}" alt="Hero image for {game?.name}" style="max-width: {widths.Hero}rem; max-height: {heights.Hero}rem; width: auto; height: auto;" />
          {/if}
        </div>
      </div>
      <div class="logo-cont" style="justify-content: {logoPosition.includes("Bottom") ? "flex-end" : (logoPosition.includes("Upper") ? "flex-start" : "center")}; align-items: {logoPosition.includes("Left") ? "flex-start" : "center"}; height: {logoHeight}%; width: {logoWidth}%; top: {currentCssStyles.top}%; bottom: {currentCssStyles.bottom}%; right: {currentCssStyles.right}%; left: {currentCssStyles.left}%;">
        <img in:fade={IMAGE_FADE_OPTIONS} src="{logoPath}" alt="Logo image for {game?.name}" style="max-height: 100%; max-width: 100%; width: auto; height: auto;" />
      </div>
    </div>
    <div class="interactables">
      <div class="logo-size">
        <Slider label="Width" bind:value={logoWidth} width="12.5rem" />
      </div>
      <div class="logo-size">
        <Slider label="Height" bind:value={logoHeight} width="12.5rem" />
      </div>
      <div class="logo-position">
        <DropDown label="Position" options={dropdownOptions} bind:value={logoPosition} width="8.75rem" direction="UP" />
      </div>
      {#if canClear}
        <Button on:click={applyChanges} width="11.5rem" disabled={!canSave}>Save</Button>
        <Button on:click={clearLogoPosition} width="6.5rem">Reset</Button>
      {:else}
        <Button on:click={applyChanges} width="18.75rem" disabled={!canSave}>Save</Button>
      {/if}
    </div>
  </div>
</ModalBody>

<style>
  .content {
    min-width: 12.5rem;
    min-height: calc(100% - 1.25rem);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .view {
    width: 100%;
    position: relative;
    margin: 0.625rem 0;
  }

  .logo-cont {
    position: absolute;
    display: flex;
    flex-direction: column;
    border: 0.125rem solid var(--highlight-transparent);
    border-radius: 0.125rem;
  }

  .hero-cont > .img {
    border-radius: 0.125rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .missing-background {
    width: 59.75rem;
    height: 21.375rem;
    border-radius: 0.125rem;
    background-color: #a3a3a3;
    background-image: linear-gradient(140deg, #adadad 0%, #727272 50%, #535353 75%);
  }

  .interactables {
    width: calc(100% - 1.25rem);
    padding: 0rem 0.625rem;

    display: flex;
    align-items: center;

    gap: 0.5rem;
  }

  .logo-size { width: 13.75rem; }
  .logo-position { width: 13.75rem; }
</style>