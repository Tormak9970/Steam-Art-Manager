<script lang="ts">
  import RangeInput from "./RangeInput.svelte";

  type Props = {
    label?: string;
    min?: number;
    max?: number;
    value?: number;
    width?: string;
    onChange?: (value: number) => void;
  };

  let {
    label = "",
    min = 0,
    max = 100,
    value = $bindable(0),
    width = "6.25rem",
    onChange,
  }: Props = $props();
</script>

<div class="slider" style="width: {width};">
  {#if label !== ""}
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label
      style="margin-right: 0.75rem; font-size: 0.875rem; user-select: none;"
      >{label}:</label
    >
  {/if}
  <RangeInput {min} {max} bind:value {onChange} />
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
