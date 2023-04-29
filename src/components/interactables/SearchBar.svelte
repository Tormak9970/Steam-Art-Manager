<script lang="ts">
  import LoadingSpinner from "../info/LoadingSpinner.svelte";

  export let label: string;
  export let value = "";
  export let width = "200px";
  export let interval = 300;
  export let onChange: (query:string) => void = () => {};
  export const setSearchFocus = () => {
    searchInput.focus();
  }

  let searching = false;
  let timeout:NodeJS.Timeout|null;

  let searchInput:HTMLInputElement;

  /**
   * Wraps the onChange handler.
   */
  function inputWrapper() {
    searching = false;
    onChange(value);
  }

  /**
   * Handles debouncing the search.
   */
  function handleSearch() {
    searching = true;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(inputWrapper, interval);
  }
</script>

<div class="search-bar" style="width: {width};">
  <div class="spinner-cont" class:showing={searching}>
    <LoadingSpinner width="20px" height="20px" />
  </div>
  <input style="width: {width}px;" type="text" placeholder="{label}" on:input="{handleSearch}" bind:value={value} bind:this={searchInput}>
</div>

<style>
  @import "/theme.css";

  .search-bar {
    display: flex;
  }

  input {
    background-color: var(--foreground);
    border: 1px solid transparent;
    color: var(--font-color);
    border-radius: 2px;
    
    transition: background-color 0.15s ease-in-out, border 0.15s ease-in-out;
  }
  input:hover {
    background-color: var(--foreground-hover);
  }
  input:focus {
    border: 1px solid var(--highlight);
    outline: none;
  }

  .spinner-cont {
    visibility: hidden;
    margin-right: 7px;
    display: flex;
  }

  .showing { visibility: visible; }
</style>