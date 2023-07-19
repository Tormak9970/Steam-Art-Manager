<script lang="ts">
  import { onMount } from "svelte";
  import { tabsDict } from "./tabStore";

  export let selected: string;
  export let tabsId: string;
  export let height = "100%";
  
  let labels: string[] = [];

  function onClick(label: string) {
    $tabsDict[tabsId].selected = label;
    selected = label;
  }

  onMount(() => {
    $tabsDict[tabsId].selected = selected;
    labels = [...$tabsDict[tabsId].labels];
  });
</script>

<ul>
  {#each labels as label}
    <li class:active={selected === label}>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <span on:click={() => onClick(label)}>{label}</span>
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
    border-top: 2px solid var(--foreground-light-hover);
    
    background-color: var(--background);
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

    border-right: 2px solid var(--foreground-hover);
  }
  li:last-child { border-right: none; }

  span {
    border: 1px solid transparent;
    display: block;
    padding: 4px 6px;
    cursor: pointer;

    background-color: var(--foreground);

    transition: background-color 0.15s ease-in-out;
  }

  li.active > span { background-color: var(--foreground-light); }

  li.active > span:hover { background-color: var(--foreground-light-hover) !important; }
  span:hover { background-color: var(--foreground-hover) !important; }
</style>