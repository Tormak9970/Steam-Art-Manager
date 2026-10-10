<script lang="ts">
  import { AppController } from "@controllers";
  import type { Snippet } from "svelte";
  import type { Placement } from "tippy.js";

  type Props = {
    leftTooltip: string;
    rightTooltip: string;
    tooltipPositions?: Placement;
    value?: boolean;
    onChange?: (checked: boolean) => void;
    left: Snippet;
    right: Snippet;
  };

  let {
    leftTooltip,
    rightTooltip,
    tooltipPositions = "bottom",
    value = $bindable(true),
    onChange = (checked: boolean) => {},
    left,
    right,
  }: Props = $props();

  // svelte-ignore state_referenced_locally
  let oldValue = value;

  function setValue(newValue: boolean) {
    oldValue = value;
    value = newValue;
  }

  $effect(() => {
    if (oldValue !== value) onChange(value);
  });
</script>

<div class="icon-toggle">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="side left"
    class:selected={!value}
    onclick={() => setValue(false)}
    use:AppController.tippy={{
      content: leftTooltip,
      placement: tooltipPositions,
      onShow: AppController.onTippyShow,
    }}
  >
    {@render left()}
  </div>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="side right"
    class:selected={value}
    onclick={() => setValue(true)}
    use:AppController.tippy={{
      content: rightTooltip,
      placement: tooltipPositions,
      onShow: AppController.onTippyShow,
    }}
  >
    {@render right()}
  </div>
</div>

<style>
  .icon-toggle {
    display: flex;
    align-items: center;
    color: var(--font-color);

    border-radius: 0.25rem;
    border: 0.0625rem solid var(--foreground);
    overflow: hidden;
  }

  .side {
    background-color: var(--background);
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;

    width: 1rem;
    height: 1rem;
    padding: 0.25rem;

    display: flex;
    justify-content: center;
    align-items: center;
  }
  :global(.side > span) {
    height: 1rem;
  }
  :global(.side svg) {
    fill: var(--font-color);
    opacity: 0.5;
  }
  :global(.side.selected svg) {
    fill: var(--font-color);
    opacity: 0.8;
  }

  .left:hover,
  .right:hover {
    background-color: var(--foreground);
  }

  .icon-toggle:hover {
    border: 0.0625rem solid var(--foreground-hover);
  }

  .selected,
  .selected:hover {
    background-color: var(--foreground);
  }
</style>
