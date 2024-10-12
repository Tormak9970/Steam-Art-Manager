<script lang="ts">
  import { Checkbox } from "@interactables";
  import { Platforms } from "@stores/AppState";
  import type { GameStruct } from "@types";

  export let game: GameStruct;
  export let platform: string;
  export let isChecked: boolean;
  export let onChange: (appid: number, isChecked: boolean) => void = () => {};
</script>

<div class="selected-game-entry">
  <div class="checkbox">
    <Checkbox bind:value={isChecked} onChange={(checked) => { onChange(game.appid, checked); }} />
  </div>
  <div class="name">{game.name}</div>
  <div class="platform" style="margin-left: auto; margin-right: {platform === Platforms.STEAM ? "60px" : "40px"};">{platform}</div>
</div>

<style>
  .selected-game-entry {
    width: calc(100% - 14px);
    height: 24px;
    
    padding: 3px 5px;

    border-radius: 4px;

    display: flex;
    align-items: center;

    background-color: var(--foreground);
  }
  .selected-game-entry:last-child {
    margin-bottom: 0px;
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

  .platform {
    font-size: 12px;
    user-select: none;
  }
</style>