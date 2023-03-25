<script lang="ts">
  import { onMount } from "svelte";
  import { tabsDict } from "./tabStore";

  export let selected: string;
  export let tabsId: string;
  
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

<div class="tabs">
  <slot />
</div>

<style>
  @import "/theme.css";

	.tabs {
		margin-bottom: 10px;
		padding: 10px;
    border-top: 2px solid var(--foreground-light);
    
    background-color: var(--foreground);

    height: 100%;
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
  }

  span {
    border: 1px solid transparent;
    display: block;
    padding: 4px 1rem;
    cursor: pointer;

    background-color: var(--background-hover);
  }

  span:hover { border-color: var(--highlight); }

  li.active > span { background-color: var(--foreground-light); }
</style>