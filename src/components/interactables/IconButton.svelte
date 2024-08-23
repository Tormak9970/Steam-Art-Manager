<script lang="ts">
  import { AppController } from "@controllers";
  import type { Placement } from "tippy.js";

  export let label: string;
  export let tooltipPosition: Placement = "top-end";
  export let width = "22px";
  export let height = "22px";
  export let onClick: (e: MouseEvent) => void;
  export let disabled = false;
  export let highlight = false;
  export let warn = false;
</script>

<button class="button" class:warn={warn} class:highlight={highlight} class:disabled={disabled} style="width: {width}; height: {height};" on:click={onClick} use:AppController.tippy={{ content: label, placement: tooltipPosition, onShow: AppController.onTippyShow }}>
  <slot />
</button>

<style>
  .button {
    padding: 2px;
    min-width: 22px;
    min-height: 22px;
        
    background-color: var(--foreground);
    border: 1px solid transparent;
    border-radius: 4px;

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
    background-color: var(--foreground-hover);
  }

  .button:focus {
    outline: none;
  }

  .disabled {
    pointer-events: none;
    opacity: 0.7;
  }

  .highlight { background-color: var(--save); }
  .highlight:hover { background-color: var(--save-hover); }

  .warn { background-color: var(--warning); }
  .warn:hover { background-color: var(--warning-hover); }
</style>
