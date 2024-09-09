<script lang="ts">
  import type { SGDBGame } from "@types";

  export let game: SGDBGame;
  export let onSelect: (game: SGDBGame) => void;
  export let isSelected: boolean;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="game-search-entry" on:click={() => onSelect(game)}>
  <svg xmlns="http://www.w3.org/2000/svg" height="16px" width="16px" viewBox="0 0 100 100" style="height: 16px; width: 16px;">
    <circle cx="50" cy="50" r="38" fill={isSelected ? "var(--font-color)" : "transparent"} style="transition: fill 0.3s ease-in-out;" stroke="var(--font-color)" stroke-width="4" />
  </svg>
  <div class="name">{game.name}</div>
</div>

<style>
  .game-search-entry {
    width: calc(100% - 14px);
    
    padding: 3px 7px;
    margin-bottom: 7px;

    border-radius: 4px;

    display: flex;
    align-items: center;

    background-color: var(--foreground);

    cursor: pointer;
  }
  .game-search-entry:last-child {
    margin-bottom: 0px;
  }

  .game-search-entry:hover {
    background-color: var(--foreground-hover);
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
</style>