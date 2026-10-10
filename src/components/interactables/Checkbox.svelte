<script lang="ts">
  import { Check } from "@icons";

  type Props = {
    value: boolean;
    onChange?: (checked: boolean) => void;
  };

  let { value = $bindable(), onChange = () => {} }: Props = $props();

  /**
   * Toggles the check's value.
   */
  function check(): void {
    value = !value;
    onChange(value);
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="check-box-container" onclick={check}>
  <input type="checkbox" id="" bind:checked={value} />
  <span class="check-box">
    {#if value}
      <Check height="1rem" />
    {/if}
  </span>
</div>

<style>
  .check-box-container {
    display: block;
    position: relative;
    cursor: pointer;

    height: 1.25rem;
    width: 1.25rem;

    border-radius: 0.25rem;
    border: 0.0625rem solid transparent;
  }

  .check-box-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .check-box {
    height: calc(100% - 0.375rem);
    width: calc(100% - 0.375rem);
    background-color: var(--background-hover);
    border: 0.0625rem solid var(--foreground);
    padding: 0.125rem;
    border-radius: 0.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    transition: background-color 0.15s ease-in-out;

    fill: var(--highlight);
  }

  .check-box-container:hover input ~ .check-box {
    background-color: var(--foreground);
    border: 0.0625rem solid var(--foreground-hover);
  }
</style>
