<script lang="ts">
  import { LoadingSpinner } from "@layout";

  export const setSearchFocus = () => {
    searchInput?.focus();
  };

  type Props = {
    label: string;
    value?: string;
    width?: string;
    interval?: number;
    reversed?: boolean;
    updateOnInput?: boolean;
    onChange?: (query: string) => void;
  };

  let {
    label,
    value = $bindable(""),
    width = "12.5rem",
    interval = 300,
    reversed = false,
    updateOnInput = true,
    onChange = () => {},
  }: Props = $props();

  let searching = $state(false);
  let timeout: number | null;

  let searchInput: HTMLInputElement | undefined = $state();

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

<div
  class="search-bar"
  style="width: {width}; flex-direction: {reversed ? 'row-reverse' : 'row'};"
>
  <div
    class="spinner-cont"
    style="margin-{reversed ? 'left' : 'right'}: 0.5rem;"
    class:showing={searching}
  >
    <LoadingSpinner width="1.25rem" height="1.25rem" />
  </div>
  <input
    style="width: calc(100% - 0.375rem);"
    type="text"
    placeholder={label}
    oninput={onInputWrapper}
    onchange={onChangeWrapper}
    bind:value
    bind:this={searchInput}
  />
</div>

<style>
  .search-bar {
    display: flex;
  }

  input {
    background-color: var(--background-hover);
    border: 0.0625rem solid var(--foreground);
    color: var(--font-color);
    border-radius: 0.25rem;
    padding: 0.375rem;

    transition:
      background-color 0.15s ease-in-out,
      border 0.15s ease-in-out;

    height: 0.875rem;
  }
  input:hover,
  input:focus {
    background-color: var(--foreground);
    border: 0.0625rem solid var(--foreground-hover);
    outline: none;
  }

  .spinner-cont {
    visibility: hidden;
    display: flex;
  }

  .showing {
    visibility: visible;
  }
</style>
