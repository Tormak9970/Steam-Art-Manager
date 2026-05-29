<script lang="ts">
  import RangeInput from "./RangeInput.svelte";

  export let label:string = "";
  export let min:number = 0;
  export let max:number = 100;
  export let value:number = 0;
  export let width:string = "6.25rem";
</script>

<div class="slider" style="width: {width};">
  {#if label !== ""}
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label style="margin-right: 0.75rem; font-size: 0.875rem; user-select: none;">{label}:</label>
  {/if}
  <RangeInput min={min} max={max} bind:value="{value}" on:change />
</div>

<style>
  .slider {
		--track-highlight-bg: var(--highlight);
		--thumb-holding-outline: transparent;

    --track-bgcolor: var(--foreground);
    --thumb-bgcolor: var(--foreground-light);

    --tooltip-bg: var(--foreground-light);
    --tooltip-bgcolor: var(--foreground-light);
    
    margin: 0rem;

    display: flex;
    flex-direction: row;
    align-items: center;

    color: var(--font-color);

    font-size: 0.75rem;
    width: 100%;
  }
</style>