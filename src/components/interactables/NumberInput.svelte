<script lang="ts">
  export let label: string;
  export let value: number;
  export let onChange: (e: Event, fieldName: string) => void;

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
  <label style="margin-right: 13px; font-size: 14px; user-select: none;">{label}:</label>
  <input
    type="text"
    placeholder={value.toString()}
    value={value}
    on:change={wrapper}
    on:input={handleInput}
  />
</div>

<!-- svelte-ignore css-unused-selector -->
<style>
  @import "/theme.css";

  .input {
    margin: 0px;

    display: flex;
    flex-direction: row;
    align-items: center;

    color: var(--font-color);
    font-size: 12px;
  }
  .input > .field-name {
    margin-right: 10px;
  }

  .input > input {
    color: var(--font-color);
    background-color: var(--background);
    border-radius: 1px;
    outline: none;
    border: 1px solid black;
    padding: 3px;
    max-width: 140px;
  }
  .input > input:hover {
    background-color: var(--background-hover);
  }
  .input > input:focus {
    outline: 1px solid var(--highlight);
  }
</style>
