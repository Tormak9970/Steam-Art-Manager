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
    width: calc(100% - 14px);
    height: 20px;
    
    padding: 3px;

    display: flex;
    align-items: center;

    background-color: var(--foreground);

    border-radius: 4px;
  }

  .search-entry:hover {
    background-color: var(--foreground-hover);
    cursor: pointer;
  }

  .selected, .selected:hover {
    background-color: var(--foreground-light);
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