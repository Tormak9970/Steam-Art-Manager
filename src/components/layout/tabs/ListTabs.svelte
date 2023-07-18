<script lang="ts">
  export let selected: string;
  export let tabs: string[];
  export let height = "100%";

  function onClick(label: string) {
    selected = label;
  }
</script>

<ul style="user-select: none;">
  {#each tabs as tab}
    <li class:active={selected === tab}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <span on:click={() => onClick(tab)}>{tab}</span>
    </li>
  {/each}
</ul>

<div class="tabs" style="height: {height};">
  <slot />
</div>

<style>
	.tabs {
		padding: 10px;
    padding-bottom: 5px;
    border-top: 2px solid var(--foreground);
    
    background-color: var(--background);

    border-radius: 0px 0px 4px 4px;
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
    margin-bottom: -1px;
    flex-grow: 1;

    justify-content: center;

    border-right: 1px solid var(--foreground);
    overflow: hidden;
  }
  li:first-child {
    border-top-left-radius: 4px;
  }
  li:last-child { border-right: none; border-top-right-radius: 4px; }

  span {
    display: block;
    padding: 5px 7px;
    cursor: pointer;

    background-color: var(--background);

    transition: background-color 0.15s ease-in-out;
  }

  li.active > span { background-color: var(--foreground); }

  li.active > span:hover { background-color: var(--foreground-hover) !important; }
  span:hover { background-color: var(--background-hover) !important; }
</style>