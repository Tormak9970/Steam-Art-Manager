<script lang="ts">
  import type { SGDBGame } from "@types";

  export let game: SGDBGame;
  export let isSelected: boolean;
  export let onSelect: (game: SGDBGame) => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="search-entry" class:selected={isSelected} on:click={() => { onSelect(game); }}>
  <div class="name">{game.name}</div>
</div>

<style>
  .search-entry {
    width: calc(100% - 1rem);
    height: 1.25rem;
    
    padding: 0.25rem;

    display: flex;
    align-items: center;

    background-color: var(--background-hover);
    border: 0.0125rem solid var(--foreground);

    border-radius: 0.25rem;
  }

  .search-entry:hover {
    background-color: var(--foreground);
    border: 0.0625rem solid var(--foreground-hover);
    cursor: pointer;
  }

  .selected, .selected:hover {
    background-color: var(--foreground-light);
    border: 0.0625rem solid var(--foreground-light);
  }

  .name {
    font-size: 0.75rem;
    user-select: none;

    width: 18.75rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    margin-left: 0.25rem;
  }
</style>