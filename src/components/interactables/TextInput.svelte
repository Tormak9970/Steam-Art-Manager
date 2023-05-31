<script lang="ts">
  export let label:string = "";
  export let value:string;
  export let placeholder:string = "";

  export let width:number = 140;
  export let onChange:(e:Event, fieldName:string)=>void;

  /**
   * Wrapper for the onChange handler.
   * @param e The event.
   */
  function wrapper(e:Event): void {
    onChange(e, label.toLowerCase());
  }
</script>

<div class="input">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  {#if label != ""}
    <label style="margin-right: 13px; font-size: 14px; user-select: none;">{label}:</label>
  {/if}
  <input style="width: {width}px;" type="text" placeholder="{placeholder != "" ? placeholder : value}" bind:value={value} on:change="{wrapper}">
</div>

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

  .input > input {
    color: var(--font-color);
    background-color: var(--foreground);
    border: 1px solid transparent;
    outline: none;
    border-radius: 2px;
    padding: 3px;

    transition: background-color 0.15s ease-in-out, border 0.15s ease-in-out;
  }
  .input > input:hover {
    background-color: var(--foreground-hover);
  }
  .input > input:focus {
    outline: none;
    border: 1px solid var(--highlight);
  }
</style>