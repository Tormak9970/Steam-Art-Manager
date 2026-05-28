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
  export let disabled: boolean;

  export let selectGame: () => void;
  export let toggleHidden: (isHidden: boolean) => void;
  export let showAllGrids: (appId: number) => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="container">
  {#if disabled}
    <div class="disabled-tooltip" use:AppController.tippy={{ content: "Icons can't be applied to games without them right now", placement: "top", onShow: AppController.onTippyShow }}></div>
  {/if}
  <div class="game" class:disabled class:selected={$selectedGameAppId === game.appid.toString()} on:click={selectGame}>
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
</div>

<style>
  .container {
    position: relative;
  }

  .disabled-tooltip {
    width: 100%;
    height: 100%;
    
    border-radius: 0.25rem;
    overflow: hidden;

    position: absolute;

    z-index: 1;

    backdrop-filter: brightness(0.8);
  }

  .game {
    padding: 0.5rem;
    padding-bottom: 0.25rem;
    border-radius: 0.25rem;

    font-size: 0.75rem;

    display: flex;
    flex-direction: column;
    align-items: center;

    position: relative;
    
    cursor: pointer;

    user-select: none;

    transition: background-color 0.2s ease-in-out;
    
    background-color: var(--background-hover);
    border: 0.0625rem solid var(--foreground);
  }
  .game:hover {
    background-color: var(--foreground);
    border: 0.0625rem solid var(--foreground-hover);
  }

  .selected {
    background-color: var(--foreground-hover);
    border: 0.0625rem solid var(--foreground-light);
  }
  .selected:hover {
    background-color: var(--foreground-light);
    border: 0.0625rem solid var(--foreground-light);
  }

  .name {
    width: 100%;
    height: 1.5rem;
    line-height: 1.5rem;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    
    text-align: center;
  }

  .button-container {
    position: absolute;

    top: 0.125rem;
    left: 0.125rem;
    
    width: 1rem;

    z-index: 2;

    flex-direction: column;
    gap: 0.25rem;

    display: none;
  }

  .image-control {
    border-radius: 50%;

    width: 1rem;
    height: 1rem;

    padding: 0.25rem;

    fill: var(--font-color);

    background-color: var(--background);

    opacity: 0.8;

    display: flex;
    align-items: center;
    justify-content: center;
  }
  .image-control:hover {
    cursor: pointer;
    opacity: 1;
  }

  .game:hover > .button-container { display: flex; }
</style>