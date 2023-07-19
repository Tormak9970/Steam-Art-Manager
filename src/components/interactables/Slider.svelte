<script lang="ts">
  import RangeInput from "./RangeInput.svelte";

  export let label:string = "";
  export let min:number = 0;
  export let max:number = 100;
  export let value:number = 0;
  export let width:string = "100px";
  export let onChange: (e: any) => void = () => {};
</script>

<div class="slider" style="width: {width};">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  {#if label != ""}
    <label style="margin-right: 13px; font-size: 14px; user-select: none;">{label}:</label>
  {/if}
  <RangeInput min={min} max={max} bind:value="{value}" on:change={onChange}/>
</div>

<style>
  .slider {
    --track-focus: var(--highlight-hover);
		--track-highlight-bgcolor: var(--highlight-hover);
		--track-highlight-bg: var(--highlight);
		--thumb-holding-outline: rgba(94, 255, 0, 0.3);

    --track-bgcolor: var(--foreground);
    --thumb-bgcolor: var(--foreground-light);

    --tooltip-bg: var(--foreground-light);
    --tooltip-bgcolor: var(--foreground-light);
    
    margin: 0px;

    display: flex;
    flex-direction: row;
    align-items: center;

    color: var(--font-color);

    font-size: 12px;
    width: 100%;
  }
</style>