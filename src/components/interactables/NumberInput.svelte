<script lang="ts">
  export let label: string = "";
  export let value: number;
  export let onChange: (e: Event, fieldName: string) => void = () => {};

  let internalValue = "";

  /**
   * Wrapper for the onChange handler.
   * @param e The event.
   */
  function wrapper(e: Event): void {
    onChange(e, label.toLowerCase());
  }

  /**
   * Checks if a value is a number.
   * @param value The value to check.
   * @returns Whether the value is a number or not.
   */
  function isNumber(value: any): boolean { return !isNaN(value); }

  /**
   * Handles the field's input events.
   * @param e The event.
   */
  function handleInput(e: Event): void {
    let oldValue = internalValue;
    let newValue = (e.target as HTMLInputElement).value;

    if (isNumber(newValue)) {
      internalValue = newValue;
    } else {
      (e.target as HTMLInputElement).value = oldValue;
    }
  }
</script>

<div class="input">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  {#if label !== ""}
    <label style="margin-right: 13px; font-size: 14px; user-select: none;">{label}:</label>
  {/if}
  <input
    type="text"
    placeholder={value.toString()}
    bind:value={value}
    on:change={wrapper}
    on:input={handleInput}
  />
</div>

<style>
  .input {
    margin: 0px;

    display: flex;
    flex-direction: row;
    align-items: center;

    color: var(--font-color);
    font-size: 12px;
  }

  .input > input {
    color: var(--font-color);
    background-color: var(--foreground);
    border: 1px solid transparent;
    border-radius: 4px;
    outline: none;
    padding: 3px;
    max-width: 140px;
    
    transition: background-color 0.15s ease-in-out, border 0.15s ease-in-out;
  }
  .input > input:hover {
    background-color: var(--foreground-hover);
  }
  .input > input:focus {
    outline: none;
    background-color: var(--foreground-hover);
  }
</style>
