<script lang="ts">
  
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="game-search-entry">
  <div class="shine" />
  <svg xmlns="http://www.w3.org/2000/svg" height="16px" width="16px" viewBox="0 0 100 100" style="height: 16px; width: 16px;">
    <circle cx="50" cy="50" r="38" fill="var(--foreground-hover)" stroke="var(--foreground-hover)" stroke-width="4" />
  </svg>
  <div class="name" />
</div>

<style>
  .game-search-entry {
    width: calc(100% - 20px);
    
    padding: 3px 7px;
    margin-bottom: 7px;

    border-radius: 4px;

    display: flex;
    align-items: center;

    background-color: var(--foreground);

    cursor: pointer;
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