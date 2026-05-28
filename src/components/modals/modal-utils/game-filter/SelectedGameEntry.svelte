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
  <div class="platform" style="margin-left: auto; margin-right: {platform === Platforms.STEAM ? "3.75rem" : "2.5rem"};">{platform}</div>
</div>

<style>
  .selected-game-entry {
    width: calc(100% - 1rem);
    height: 1.5rem;
    
    padding: 0.125rem 0.25rem;

    border-radius: 0.25rem;

    display: flex;
    align-items: center;

    background-color: var(--background-hover);
    border: 0.0125rem solid var(--foreground);
  }
  .selected-game-entry:last-child {
    margin-bottom: 0rem;
  }

  .name {
    font-size: 0.75rem;
    user-select: none;

    width: 12.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    margin-left: 0.5rem;
  }

  .platform {
    font-size: 0.75rem;
    user-select: none;
  }
</style>