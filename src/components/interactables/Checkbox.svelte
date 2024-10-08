<script lang="ts">
  import { Check } from "@icons";

  export let value:boolean;
  export let onChange: (checked: boolean) => void = () => {};

  /**
   * Toggles the check's value.
   */
  function check(): void {
    value = !value;
    onChange(value);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="check-box-container" on:click={check}>
  <input type="checkbox" id="" bind:checked={value}>
  <span class="check-box">
    {#if value}
      <Check />
    {/if}
  </span>
</div>

<style>
  .check-box-container {
    display: block;
    position: relative;
    cursor: pointer;

    height: 16px;
    width: 16px;

    border-radius: 4px;
    border: 1px solid transparent;
  }

  .check-box-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .check-box {
    height: calc(100% - 4px);
    width: calc(100% - 4px);
    background-color: var(--background);
    padding: 2px;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    transition: background-color 0.15s ease-in-out;

    fill: var(--highlight);
  }

  .check-box-container:hover input ~ .check-box {
    background-color: var(--background-hover);
  }

  :global([data-theme="light"] .check-box) {
    fill: var(--highlight-dim) !important;
  }
</style>
