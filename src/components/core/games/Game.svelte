<script lang="ts">
  import { tauri } from "@tauri-apps/api"
  import { onMount } from "svelte";
  import { appLibraryCache, gridType, selectedGameAppId } from "../../../Stores";

  export let game: SteamGame;
  export let widths: any;
  export let heights: any;

  let imagePath = "";

  function selectGame() { $selectedGameAppId = game.appid.toString(); }

  onMount(() => {
    gridType.subscribe((type) => {
      imagePath = tauri.convertFileSrc($appLibraryCache[game.appid][type]);
    });
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="game" class:selected={$selectedGameAppId == game.appid.toString()} on:click={selectGame}>
  <div class="img" style="height: {heights[$gridType]}px;">
    <img src="{imagePath}" alt="{game.name}'s {$gridType} image" style="max-width: {widths[$gridType]}px; max-height: {heights[$gridType]}px; width: auto; height: auto;" />
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
    
    cursor: pointer;
  }
  .game:hover { background-color: var(--foreground-hover); }

  .img { border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }

  .selected { background-color: var(--foreground-light-hover); }
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
</style>