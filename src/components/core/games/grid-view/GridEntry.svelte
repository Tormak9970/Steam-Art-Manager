<script lang="ts">
  import { AppController } from "@controllers";
  import { AllGrids, Ban, Hide, Recycle, Show, Tag } from "@icons";
  import { gridType, selectedGameAppId } from "@stores/AppState";
  import type { GameStruct } from "@types";
  import GridImage from "../../GridImage.svelte";

  export let game: GameStruct;
  export let imagePath: string;
  export let showImage: boolean;

  export let isHidden: boolean;
  export let hasCustomName: boolean;
  export let hasCustomArt: boolean;
  export let canDiscard: boolean;

  export let selectGame: () => void;
  export let toggleHidden: (isHidden: boolean) => void;
  export let showAllGrids: (appId: number) => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="game" class:selected={$selectedGameAppId === game.appid.toString()} on:click={selectGame}>
  <div class="button-container">
    <div
      class="image-control"
      on:click|stopPropagation={() => showAllGrids(game.appid)}
      use:AppController.tippy={{ content: "Grids", placement: "right", onShow: AppController.onTippyShow }}
    >
      <AllGrids />
    </div>
    <div
      class="image-control"
      on:click|stopPropagation={() => toggleHidden(!isHidden)}
      use:AppController.tippy={{ content: isHidden ? "Unhide" : "Hide", placement: "right", onShow: AppController.onTippyShow }}
    >
      {#if isHidden}
        <Show />
      {:else}
        <Hide />
      {/if}
    </div>
    {#if hasCustomName}
      <div
        class="image-control"
        on:click|stopPropagation={() => { AppController.clearCustomNameForGame(game.appid.toString()); }}
        use:AppController.tippy={{ content: "Clear Name", placement: "right", onShow: AppController.onTippyShow }}
      >
        <Tag height="1em" />
      </div>
    {/if}
    {#if hasCustomArt}
      <div
        class="image-control"
        on:click|stopPropagation={() => { AppController.clearCustomArtForGame(game.appid.toString()); }}
        use:AppController.tippy={{ content: "Clear Art", placement: "right", onShow: AppController.onTippyShow }}
      >
        <Ban />
      </div>
    {/if}
    {#if canDiscard}
      <div
        class="image-control"
        on:click|stopPropagation={() => { AppController.discardChangesForGame(game.appid.toString()); }}
        use:AppController.tippy={{ content: "Discard Changes", placement: "right", onShow: AppController.onTippyShow }}
      >
        <Recycle />
      </div>
    {/if}
  </div>
  <GridImage imagePath={imagePath} altText="{game.name}'s {$gridType} image" showImage={showImage} missingMessage="Missing {$gridType}" />
  <div class="name" use:AppController.tippy={{ content: game.name, placement: "right", onShow: AppController.onTippyShow }}>{game.name}</div>
</div>

<style>
  .game {
    background-color: var(--foreground);
    padding: 10px;
    padding-bottom: 5px;
    border-radius: 4px;

    font-size: 14px;

    display: flex;
    flex-direction: column;
    align-items: center;

    position: relative;
    
    cursor: pointer;

    user-select: none;

    transition: background-color 0.2s ease-in-out;
  }
  .game:hover { background-color: var(--foreground-hover); }

  .selected { background-color: var(--foreground-light); }
  .selected:hover { background-color: var(--foreground-light-hover); }

  .name {
    width: 100%;
    height: 23px;
    line-height: 23px;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    
    text-align: center;
  }

  .button-container {
    position: absolute;

    top: 2px;
    left: 2px;
    
    width: 14px;

    z-index: 2;

    flex-direction: column;
    gap: 5px;

    display: none;
  }

  .image-control {
    border-radius: 50%;

    width: 14px;
    height: 14px;

    padding: 5px;

    fill: var(--font-color);

    background-color: var(--background);

    opacity: 0.8;
  }
  .image-control:hover {
    cursor: pointer;
    opacity: 1;
  }

  .game:hover > .button-container { display: flex; }
</style>