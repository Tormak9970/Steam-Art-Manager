<script lang="ts">
  import { LoadingSpinner } from "@layout";

  export const setSearchFocus = () => { searchInput.focus(); }

  export let label: string;
  export let value = "";
  export let width = "200px";
  export let interval = 300;
  export let reversed = false;
  export let updateOnInput = true;
  export let onChange: (query:string) => void = () => {};

  let searching = false;
  let timeout:NodeJS.Timeout|null;

  let searchInput:HTMLInputElement;

  /**
   * Wraps the onChange handler.
   */
  function inputWrapper(): void {
    searching = false;
    onChange(value);
  }

  /**
   * Handles debouncing the search.
   */
  function handleSearch(): void {
    searching = true;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(inputWrapper, interval);
  }

  /**
   * Wrapper to check if search should be done on each input.
   */
  function onInputWrapper(): void {
    if (updateOnInput) handleSearch();
  }

  /**
   * Wrapper to check if search should be done only on input changes.
   */
  function onChangeWrapper(): void {
    if (!updateOnInput) handleSearch();
  }
</script>

<div class="search-bar" style="width: {width}; flex-direction: {reversed ? "row-reverse" : "row"};">
  <div class="spinner-cont" style="margin-{reversed ? "left" : "right"}: 7px;" class:showing={searching}>
    <LoadingSpinner width="20px" height="20px" />
  </div>
  <input style="width: calc(100% - 6px);" type="text" placeholder={label} on:input={onInputWrapper} on:change={onChangeWrapper} bind:value={value} bind:this={searchInput}>
</div>

<style>
  .search-bar {
    display: flex;
  }

  input {
    background-color: var(--background-hover);
    border: 1px solid var(--foreground);
    color: var(--font-color);
    border-radius: 4px;
    padding: 5px;
    
    transition: background-color 0.15s ease-in-out, border 0.15s ease-in-out;
  }
  input:hover,
  input:focus {
    background-color: var(--foreground);
    border: 1px solid var(--foreground-hover);
    outline: none;
  }

  .spinner-cont {
    visibility: hidden;
    display: flex;
  }

  .showing { visibility: visible; }
</style>