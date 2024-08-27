<script lang="ts">
  import { AppController } from "@controllers";
  import { appLibraryCache, unfilteredLibraryCache } from "@stores/AppState";
  import type { GameStruct } from "@types";

  export let game: GameStruct;
  export let onRemove: (game: GameStruct) => void;

  /**
   * Checks if the entry has any existing steam art on the pc.
   * @returns True if it does, false if not.
   */
  function getSteamArtStatus(): boolean {
    return !!$unfilteredLibraryCache[game.appid];
  }

  /**
   * Checks if the entry has any existing custom art on the pc.
   * @returns True if it does, false if not.
   */
  function getCustomArtStatus(): boolean {
    // * Need this bc we want to only compare the properties of the objects.
    // eslint-disable-next-line eqeqeq
    return $unfilteredLibraryCache[game.appid] && $appLibraryCache[game.appid] != $unfilteredLibraryCache[game.appid];
  }

  $: hasSteamArt = getSteamArtStatus();
  $: hasCustomArt = getCustomArtStatus();
</script>

<div class="selected-game-entry">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="remove-cont" on:click={() => { onRemove(game); }} use:AppController.tippy={{ content: "Remove this game", placement: "left", onShow: AppController.onTippyShow }}>
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="width: 12px; height: 12px;">
      <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
      <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/>
    </svg>
  </div>
  <div class="name">{game.name}</div>
  <div class="steam-art" use:AppController.tippy={{ content: hasSteamArt ? "Existing official art" : "No official art", placement: "left", onShow: AppController.onTippyShow }}>
    {#if hasSteamArt}
      <svg class="exists" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="width: 12px; height: 12px;">
        <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/>
      </svg>
    {:else}
      <svg class="dne" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="width: 12px; height: 12px;">
        <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/>
      </svg>
    {/if}
  </div>
  <div class="custom-art" use:AppController.tippy={{ content: hasSteamArt ? "Existing custom art" : "No custom art", placement: "left", onShow: AppController.onTippyShow }}>
    {#if hasCustomArt}
      <svg class="exists" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="width: 12px; height: 12px;">
        <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"/>
      </svg>
    {:else}
      <svg class="dne" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="width: 12px; height: 12px;">
        <!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"/>
      </svg>
    {/if}
  </div>
</div>

<style>
  .selected-game-entry {
    width: calc(100% - 20px);
    
    padding: 3px 7px;
    margin-bottom: 7px;

    display: flex;
    align-items: center;

    background-color: var(--foreground);
  }

  .remove-cont {
    margin-left: 2px;
    margin-right: 4px;
    width: auto;
    height: 100%;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;

    fill: var(--warning);
  }

  .remove-cont:hover {
    cursor: pointer;
    fill: var(--warning-hover);
  }

  .name {
    font-size: 12px;
    user-select: none;

    width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    margin-left: 10px;
  }

  .steam-art {
    margin-left: 73px;
    margin-right: 7px;
    
    font-size: 12px;
    user-select: none;

    width: auto;
    height: 100%;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;
  }

  .custom-art {
    margin-left: 27px;
    margin-right: 7px;
    
    font-size: 12px;
    user-select: none;

    width: auto;
    height: 100%;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: center;
  }

  .dne {
    fill: var(--warning);
  }

  .exists {
    fill: var(--success);
  }
</style>