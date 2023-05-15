<script lang="ts">
  import type { Platforms } from "../../../Stores";
  import Checkbox from "../../interactables/Checkbox.svelte";

  export let game: GameStruct;
  export let platform: Platforms;
  export let isChecked: boolean;
  export let onChange: (appid: number, isChecked: boolean) => void = () => {};
</script>

<div class="selected-game-entry">
  <div class="checkbox">
    <Checkbox bind:value={isChecked} onChange={(checked) => { onChange(game.appid, checked); }} />
  </div>
  <div class="name">{game.name}</div>
  <div class="platform">{platform}</div>
</div>

<style>
  @import "/theme.css";

  .selected-game-entry {
    width: calc(100% - 14px);
    
    padding: 3px 7px;
    margin-bottom: 7px;

    display: flex;
    align-items: center;

    background-color: var(--foreground);
  }

  .checkbox {

  }

  .name {
    font-size: 12px;
    margin-left: 7px;
    user-select: none;
  }

  .platform {
    margin-left: auto;
    margin-right: 7px;
    
    font-size: 12px;
    user-select: none;
  }
</style>