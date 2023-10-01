<script lang="ts">
  export let game: GameStruct;
  export let isSelected: boolean;
  export let onSelect: (game: GameStruct) => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="search-entry" class:selected={isSelected} on:click={() => { onSelect(game); }}>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="appid">{game.appid}</div>
  <div class="name">{game.name}</div>
</div>

<style>
  .search-entry {
    width: calc(100% - 20px);
    
    padding: 3px 7px;
    margin-bottom: 7px;

    display: flex;
    align-items: center;

    background-color: var(--foreground);
  }

  .search-entry:hover {
    background-color: var(--foreground-hover);
    cursor: pointer;
  }

  .selected, .selected:hover {
    background-color: var(--foreground-light);
  }

  .appid {
    font-size: 12px;
    user-select: none;

    width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    margin-left: 10px;
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