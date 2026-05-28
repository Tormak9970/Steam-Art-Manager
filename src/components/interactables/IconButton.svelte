<script lang="ts">
  import { AppController } from "@controllers";
  import type { Placement } from "tippy.js";

  export let label: string | undefined = undefined;
  export let tooltipPosition: Placement = "top-end";
  export let width = "auto";
  export let height = "auto";
  export let disabled = false;
  export let highlight = false;
  export let greyHighlight = false;
  export let warn = false;
  export let padding = "6px";
</script>

{#if !!label}
  <button class="button" class:warn={warn} class:grey-highlight={greyHighlight} class:highlight={highlight} class:disabled={disabled} style="width: {width}; height: {height}; padding: {padding}" on:click use:AppController.tippy={{ content: label, placement: tooltipPosition, onShow: AppController.onTippyShow }}>
    <slot />
  </button>
{:else}
<button class="button" class:warn={warn} class:grey-highlight={greyHighlight} class:highlight={highlight} class:disabled={disabled} style="width: {width}; height: {height}; padding: {padding}" on:click>
  <slot />
</button>
{/if}

<style>
  .button {
    min-width: 22px;
    min-height: 22px;
        
    background-color: var(--background-hover);
    border: 0.0625rem solid var(--foreground);
    border-radius: 0.25rem;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 12px;
    cursor: pointer;

    color: var(--font-color);
    fill: var(--font-color);

    transition: background-color 0.15s ease-in-out, border 0.15s ease-in-out;

    aspect-ratio: 1 / 1;
  }

  .button:hover {
    background-color: var(--foreground);
    border: 0.0625rem solid var(--foreground-hover);
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

  .grey-highlight {
    background-color: var(--foreground-light);
    border: 0.0625rem solid var(--foreground-light-hover);
  }
  .grey-highlight:hover {
    background-color: var(--foreground-light-hover);
    border: 0.0625rem solid var(--foreground-light-hover);
  }

  .warn { background-color: var(--warning); }
  .warn:hover { background-color: var(--warning-hover); }
</style>
