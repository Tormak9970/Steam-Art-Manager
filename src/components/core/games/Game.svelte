<script lang="ts">
  import { tauri } from "@tauri-apps/api"
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import Lazy from "svelte-lazy";

  import { SettingsManager } from "../../../lib/utils/SettingsManager";
  import { appLibraryCache, gridType, hiddenGameIds, originalAppLibraryCache, selectedGameAppId, selectedGameName } from "../../../Stores";
  import { AppController } from "../../../lib/controllers/AppController";

  export let game: GameStruct;
  export let widths: any;
  export let heights: any;

  let gridTypeUnsub: Unsubscriber;
  let libraryCacheUnsub: Unsubscriber;

  let showImage = true;
  let imagePath = "";
  $: isHidden = $hiddenGameIds.includes(game.appid);
  $: canDiscard = $appLibraryCache[game.appid][$gridType] != $originalAppLibraryCache[game.appid][$gridType];

  function selectGame() {
    $selectedGameName = game.name;
    $selectedGameAppId = game.appid;
  }

  function hide() {
    const tmp = $hiddenGameIds;
    tmp.push(game.appid);
    $hiddenGameIds = [...tmp];
    SettingsManager.updateSetting("hiddenGameIds", $hiddenGameIds);

    if ($selectedGameAppId == game.appid) {
      $selectedGameAppId = null;
      $selectedGameName = null;
    }
  }

  function unHide() {
    const tmp = $hiddenGameIds;
    tmp.splice($hiddenGameIds.indexOf(game.appid), 1);
    $hiddenGameIds = [...tmp];
    SettingsManager.updateSetting("hiddenGameIds", $hiddenGameIds);
  }

  onMount(() => {
    gridTypeUnsub = gridType.subscribe((type) => {
      if ($appLibraryCache[game.appid]) {
        if ($appLibraryCache[game.appid][type] && $appLibraryCache[game.appid][type] != "REMOVE") {
          showImage = true;
          imagePath = tauri.convertFileSrc($appLibraryCache[game.appid][type]);
        } else {
          showImage = false;
        }
      }
    });
    libraryCacheUnsub = appLibraryCache.subscribe((cache) => {
      if (cache[game.appid]) {
        if (cache[game.appid][$gridType] && cache[game.appid][$gridType] != "REMOVE") {
          showImage = true;
          imagePath = tauri.convertFileSrc(cache[game.appid][$gridType]);
        } else {
          showImage = false;
        }
      }
    });
  });

  onDestroy(() => {
    if (gridTypeUnsub) gridTypeUnsub();
    if (libraryCacheUnsub) libraryCacheUnsub();
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="game" class:selected={$selectedGameAppId == game.appid} on:click={selectGame}>
  <div class="image-control show-hide" on:click|stopPropagation={isHidden ? unHide : hide} use:AppController.tippy={{ content: isHidden ? "Unhide" : "Hide", placement: "right", onShow: AppController.onTippyShow}}>
    {#if isHidden}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
        <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/>
      </svg>
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
        <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"/>
      </svg>
    {/if}
  </div>
  <div class="image-control show-clear" on:click|stopPropagation={() => { AppController.clearCustomArtForGame(game.appid); }} use:AppController.tippy={{ content: "Clear Art", placement: "right", onShow: AppController.onTippyShow}}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/>
    </svg>
  </div>
  {#if canDiscard}
    <div class="image-control show-discard" on:click|stopPropagation={() => { AppController.discardChangesForGame(game.appid); }} use:AppController.tippy={{ content: "Discard Changes", placement: "right", onShow: AppController.onTippyShow}}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/>
      </svg>
    </div>
  {/if}
  <div class="img" style="height: {heights[$gridType]}px;">
    {#if showImage}
      <Lazy height="{heights[$gridType]}px" fadeOption={{delay: 500, duration: 1000}}>
        <img src="{imagePath}" alt="{game.name}'s {$gridType} image" style="max-width: {widths[$gridType]}px; max-height: {heights[$gridType]}px; width: auto; height: auto;" />
      </Lazy>
    {:else}
      <div style="text-align: center;">No {$gridType} image for game</div>
    {/if}
  </div>
  <div class="name">{game.name}</div>
</div>

<style>
  @import "/theme.css";

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

    transition: transform 0.2s ease-in-out, background-color 0.15s ease-in-out;
  }
  .game:hover {
    background-color: var(--foreground-hover);
    transform: scale(1.1);
  }

  .img {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .selected {
    background-color: var(--foreground-light);
    transform: scale(1.1);
  }
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

  .image-control {
    position: absolute;

    border-radius: 50%;

    width: 14px;
    height: 14px;

    padding: 5px;

    left: 2px;

    fill: var(--font-color);

    background-color: var(--background);

    opacity: 0.8;

    display: none;
  }
  .image-control:hover {
    cursor: pointer;
    opacity: 1;
  }

  .show-hide { top: 2px; }
  .show-clear { top: 30px; }
  .show-discard { top: 58px; }

  .game:hover > .image-control { display: flex; }
</style>