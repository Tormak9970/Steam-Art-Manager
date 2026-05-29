<script lang="ts">
  import { Checkbox } from "@interactables";
  import type { SGDBGame } from "@types";

  export let game: SGDBGame;
  export let onSelect: (game: SGDBGame) => void;
  export let isSelected: boolean;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="game-search-entry" on:click={() => onSelect(game)}>
  <Checkbox value={isSelected} />
  <div class="name">{game.name}</div>
</div>

<style>
  .game-search-entry {
    width: calc(100% - 0.75rem);
    height: 1.25rem;
    
    padding: 0.25rem 0.325rem;

    border-radius: 0.25rem;

    display: flex;
    align-items: center;

    background-color: var(--background-dark);
    border: 0.0625rem solid var(--foreground);

    cursor: pointer;
  }
  .game-search-entry:last-child {
    margin-bottom: 0rem;
  }

  .game-search-entry:hover {
    background-color: var(--background);
    border: 0.0625rem solid var(--foreground-hover);
  }

  .name {
    font-size: 0.75rem;
    user-select: none;

    width: 18.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    margin-left: 0.5rem;
  }
</style>