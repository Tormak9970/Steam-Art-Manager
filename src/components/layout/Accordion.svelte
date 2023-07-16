<script lang="ts">
	import { slide } from "svelte/transition";
	export let label: string;
  export let open = false;
	let isOpen = open;
  
	const toggle = () => { isOpen = !isOpen; }
</script>

<div class="accordion">
  <button on:click={toggle} aria-expanded={isOpen} class:all-corners={!isOpen}>
    <svg
      style="tran"
      width="12"
      height="12"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path d="M9 5l7 7-7 7" />
    </svg> 
    {label}
  </button>
  {#if isOpen}
    <div class="content" transition:slide={{ duration: 300 }}>
      <slot />
    </div>
  {/if}
</div>

<style>
  @import "/theme.css";

  .accordion {
    color: var(--font-color);
    width: 100%;

    user-select: none;
  }

	button {
    color: var(--font-color);
    border: none;
    background: none;
    display: flex;

    align-items: center;
    
    font-size: 14px;
    cursor: pointer;

    margin: 0;
    padding-bottom: 0.5em;
    padding-top: 0.5em;

    width: 100%;
    background-color: var(--background);

    transition: background-color 0.15s ease-in-out;

    border-radius: 4px 4px 0px 0px;
  }
  .all-corners {
    border-radius: 4px;
    transition: border-radius 0.15s ease-in-out 0.15s;
  }
  button:hover { background-color: var(--background-hover); }

  .content {
    padding: 0px 6px;
    width: calc(100% - 12px);
    background-color: var(--background);
    border-radius: 0px 0px 4px 4px;
  }

	svg { transition: transform 0.2s ease-in; margin-right: 3px; }
	[aria-expanded=true] svg { transform: rotate(0.25turn); }
</style>