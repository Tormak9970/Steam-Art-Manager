<script lang="ts">
  import { AppController } from "@controllers";
  import { afterUpdate } from "svelte";
  import type { Placement } from "tippy.js";

  export let leftTooltip: string;
  export let rightTooltip: string;
  export let tooltipPositions: Placement = "bottom";

  export let value = true;
  export let onChange = (checked:boolean) => {};

  let oldValue = value;

  function setValue(newValue: boolean) {
    oldValue = value;
    value = newValue;
  }

  afterUpdate(() => {
    if (oldValue !== value) onChange(value);
  });
</script>

<div class="icon-toggle">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="side left" class:selected={!value} on:click={() => setValue(false)} use:AppController.tippy={{ content: leftTooltip, placement: tooltipPositions, onShow: AppController.onTippyShow }}>
    <slot name="left" />
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="side right" class:selected={value} on:click={() => setValue(true)} use:AppController.tippy={{ content: rightTooltip, placement: tooltipPositions, onShow: AppController.onTippyShow }}>
    <slot name="right" />
  </div>
</div>

<style>
  .icon-toggle {
    display: flex;
    align-items: center;
		color: var(--font-color);
  }

  .side {
    background-color: var(--foreground-light);
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;

    width: 1em;
    height: 1em;
    padding: 3px;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  :global(.side > span) {
    height: 1em;
  }
  :global(.side svg) {
    fill: var(--background-dark);
  }
  :global(.side.selected svg) {
    fill: var(--background-dark);
  }

  .left {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  .right {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .left:hover,
  .right:hover {
    background-color: var(--foreground-light-hover);
  }

  .selected,
  .selected:hover {
    background-color: var(--highlight);
  }
</style>
