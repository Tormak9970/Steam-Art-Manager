<script lang="ts">
  import { AppController } from "@controllers";
  import type { Placement } from "tippy.js";

  export let label: string;
  export let tooltipPosition: Placement = "top-end";
  export let width = "auto";
  export let height = "auto";
  export let disabled = false;
  export let highlight = false;
  export let warn = false;
</script>

<button class="button" class:warn={warn} class:highlight={highlight} class:disabled={disabled} style="width: {width}; height: {height};" on:click use:AppController.tippy={{ content: label, placement: tooltipPosition, onShow: AppController.onTippyShow }}>
  <slot />
</button>

<style>
  .button {
    padding: 6px;
    min-width: 22px;
    min-height: 22px;
        
    background-color: var(--background-hover);
    border: 1px solid var(--foreground);
    border-radius: 0.25rem;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 12px;
    cursor: pointer;

    color: var(--font-color);
    fill: var(--font-color);

    transition: background-color 0.15s ease-in-out, border 0.15s ease-in-out;
  }

  .button:hover {
    background-color: var(--foreground);
    border: 1px solid var(--foreground-hover);
  }

  .button:focus {
    outline: none;
  }

  .disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .highlight { background-color: var(--save); }
  .highlight:hover { background-color: var(--save-hover); }

  .warn { background-color: var(--warning); }
  .warn:hover { background-color: var(--warning-hover); }
</style>
