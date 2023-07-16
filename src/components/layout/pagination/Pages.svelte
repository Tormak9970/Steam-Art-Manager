<script lang="ts">
  export let selected: number;
  export let numPages: number;
  export let height = "100%";
</script>

<div class="pages-header">
  <div class="header-label">Page:</div>
  <ul style="user-select: none;">
    {#each Array(numPages) as _, page}
      <li class:active={selected === page}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click={() => { selected = page; }}>{page+1}</span>
      </li>
    {/each}
  </ul>
</div>

<div class="page" style="height: {height};">
  <slot />
</div>

<style>
  @import "/theme.css";

	.page {
		padding: 10px;
    padding-bottom: 5px;
    border-top: 2px solid transparent;
    
    background-color: var(--background);

    border-radius: 4px;
	}

  .pages-header {
    font-size: 14px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 4px;
  }

  .header-label {
    margin-left: 7px;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin: 0;
    list-style: none;

    display: flex;
  }
	li {
    display: flex;
    justify-content: center;
    align-items: center;

    margin-right: 3px;
    padding: 4px 4px;
    width: 16px;
    height: 16px;

    cursor: pointer;

    background-color: var(--background);

    transition: background-color 0.15s ease-in-out;

    border-radius: 4px;
  }
  li:last-child { margin-right: 0px; }

  span {
    border: 1px solid transparent;
    display: block;
  }

  li.active { background-color: var(--foreground); }

  li.active:hover { background-color: var(--foreground-hover) !important; }
  li:hover { background-color: var(--background) !important; }
</style>