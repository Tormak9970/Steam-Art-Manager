<script lang="ts">
  import { afterUpdate } from "svelte";

  export let leftTooltip: string;
  export let rightTooltip: string;

  export let value = true;
  export let onChange = (checked:boolean) => {};

  afterUpdate(() => {
    onChange(value);
    console.log(leftTooltip, rightTooltip)
  });
</script>

<div class="icon-toggle">
  <div class="side left" class:selected={!value}>
    <slot name="left" />
  </div>
  <div class="side right" class:selected={value}>
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
    background-color: var(--foreground);
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;
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
    background-color: var(--foreground-hover);
  }

  .selected,
  .selected:hover {
    background-color: var(--highlight);
  }
</style>
