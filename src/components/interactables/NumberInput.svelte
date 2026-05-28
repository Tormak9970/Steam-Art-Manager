<script lang="ts">
  export let label: string = "";
  export let value: number;

  let internalValue = "";

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
  {#if label !== ""}
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label style="margin-right: 0.875rem; font-size: 0.875rem; user-select: none;">{label}:</label>
  {/if}
  <input
    type="text"
    placeholder={value.toString()}
    bind:value={value}
    on:input={handleInput}
  />
</div>

<style>
  .input {
    margin: 0rem;

    display: flex;
    flex-direction: row;
    align-items: center;

    color: var(--font-color);
    font-size: 0.75rem;
  }

  .input > input {
    color: var(--font-color);
    background-color: var(--background-hover);
    border: 0.0625rem solid var(--foreground);
    border-radius: 0.25rem;
    outline: none;
    padding: 0.25rem;
    max-width: 8.75rem;
    
    transition: background-color 0.15s ease-in-out, border 0.15s ease-in-out;
  }
  .input > input:hover,
  .input > input:focus {
    background-color: var(--foreground);
    border: 0.0625rem solid var(--foreground-hover);
    outline: none;
  }
</style>
