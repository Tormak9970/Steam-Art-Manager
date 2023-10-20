<script lang="ts">
  import type { Placement } from "tippy.js";
  import { afterUpdate } from "svelte";
  import { AppController } from "../../lib/controllers/AppController";

  export let leftTooltip: string;
  export let rightTooltip: string;
  export let tooltipPositions: Placement = "bottom";

  export let value = true;
  export let onChange = (checked:boolean) => {};

  afterUpdate(() => {
    onChange(value);
  });
</script>

<div class="icon-toggle">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="side left" class:selected={!value} on:click={() => value = false} use:AppController.tippy={{ content: leftTooltip, placement: tooltipPositions, onShow: AppController.onTippyShow }}>
    <slot name="left" />
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="side right" class:selected={value} on:click={() => value = true} use:AppController.tippy={{ content: rightTooltip, placement: tooltipPositions, onShow: AppController.onTippyShow }}>
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

    width: 22px;
    height: 22px;
  }
  :global(.side > span) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 22px;
    height: 22px;
  }
  :global(.side:first-child) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 22px;
    height: 22px;
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
