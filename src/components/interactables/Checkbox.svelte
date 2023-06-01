<script lang="ts">
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
<div class="check-box-container" on:click={check}>
  <input type="checkbox" id="" bind:checked={value}>
  <span class="check-box">
    {#if value}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
        <path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
      </svg>
    {/if}
  </span>
</div>

<style>
  @import "/theme.css";

  .check-box-container {
    display: block;
    position: relative;
    cursor: pointer;

    height: 16px;
    width: 16px;

    border-radius: 2px;
    border: 1px solid #000;
  }

  .check-box-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .check-box {
    height: 100%;
    width: 100%;
    background-color: var(--foreground);
    border-radius: 2px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    transition: background-color 0.15s ease-in-out;

    fill: var(--highlight);
  }

  :global([data-theme="light"] .check-box) {
    background-color: var(--foreground-light) !important;
  }

  .check-box-container:hover input ~ .check-box {
    background-color: var(--foreground-light);
  }

  :global([data-theme="light"] .check-box-container:hover input ~ .check-box) {
    background-color: var(--foreground-light-hover) !important;
  }
</style>
