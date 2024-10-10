<script lang="ts">
  export let width = "auto";
  export let disabled = false;
  export let highlight = false;
  export let warn = false;
</script>

<button class:warn={warn} class:highlight={highlight} class:disabled={disabled} style:width={width} on:click>
  <div style="user-select: none;">
    <slot />
  </div>
</button>

<style>
  button {
    padding: 6px 12px;
    min-width: 52px;

    height: auto;
        
    background-color: var(--background-hover);
    border: 1px solid var(--foreground);
    border-radius: 4px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 12px;
    cursor: pointer;

    color: var(--font-color);

    transition: background-color 0.15s ease-in-out, border 0.15s ease-in-out;
  }

  button:hover {
    background-color: var(--foreground);
    border: 1px solid var(--foreground-hover);
  }

  button:focus {
    outline: none;
  }

  .disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .highlight {
    background-color: #18bb039c;
    border: 1px solid var(--save-hover);
  }
  .highlight:hover {
    background-color: #18bb03c5;
    border: 1px solid var(--save-hover);
  }

  .warn { background-color: var(--warning); }
  .warn:hover { background-color: var(--warning-hover); }
</style>
