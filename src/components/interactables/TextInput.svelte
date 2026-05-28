<script lang="ts">
  export let label:string = "";
  export let value:string;
  export let placeholder:string = "";

  export let width:number = 140;
</script>

<div class="input">
  {#if label !== ""}
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label style="margin-right: 0.625rem; font-size: 0.825rem; user-select: none;">{label}:</label>
  {/if}
  <input style="width: {width}px;" type="text" placeholder="{placeholder !== "" ? placeholder : value}" bind:value={value} on:change on:input>
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
    outline: none;
    border-radius: 0.25rem;
    padding: 0.25rem;

    transition: background-color 0.15s ease-in-out, border 0.15s ease-in-out;
  }
  .input > input:hover,
  .input > input:focus {
    background-color: var(--foreground);
    border: 0.0625rem solid var(--foreground-hover);
    outline: none;
  }
</style>