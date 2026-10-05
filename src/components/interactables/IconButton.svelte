<script lang="ts">
  import { AppController } from "@controllers";
  import type { Snippet } from "svelte";
  import type { Placement } from "tippy.js";

  type Props = {
    label: string | undefined;
    children: Snippet;
    onClick: () => void | Promise<void>;
    tooltipPosition?: Placement;
    width?: string;
    height?: string;
    disabled?: boolean;
    highlight?: boolean;
    greyHighlight?: boolean;
    warn?: boolean;
    padding?: string;
  };

  let {
    label = undefined,
    children,
    onClick,
    tooltipPosition = "top-end",
    width = "auto",
    height = "auto",
    disabled = false,
    highlight = false,
    greyHighlight = false,
    warn = false,
    padding = "0.3125rem",
  }: Props = $props();
</script>

{#if !!label}
  <button
    class="button"
    class:warn
    class:grey-highlight={greyHighlight}
    class:highlight
    class:disabled
    style="width: {width}; height: {height}; padding: {padding}"
    onclick={onClick}
    use:AppController.tippy={{
      content: label,
      placement: tooltipPosition,
      onShow: AppController.onTippyShow,
    }}
  >
    {@render children()}
  </button>
{:else}
  <button
    class="button"
    class:warn
    class:grey-highlight={greyHighlight}
    class:highlight
    class:disabled
    style="width: {width}; height: {height}; padding: {padding}"
    onclick={onClick}
  >
    {@render children()}
  </button>
{/if}

<style>
  .button {
    min-width: 1.25rem;
    min-height: 1.25rem;

    background-color: var(--background-hover);
    border: 0.0625rem solid var(--foreground);
    border-radius: 0.25rem;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 0.75rem;
    cursor: pointer;

    color: var(--font-color);
    fill: var(--font-color);

    transition:
      background-color 0.15s ease-in-out,
      border 0.15s ease-in-out;

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

  .highlight {
    background-color: var(--save);
  }
  .highlight:hover {
    background-color: var(--save-hover);
  }

  .grey-highlight {
    background-color: var(--foreground-light);
    border: 0.0625rem solid var(--foreground-light-hover);
  }
  .grey-highlight:hover {
    background-color: var(--foreground-light-hover);
    border: 0.0625rem solid var(--foreground-light-hover);
  }

  .warn {
    background-color: var(--warning);
  }
  .warn:hover {
    background-color: var(--warning-hover);
  }
</style>
