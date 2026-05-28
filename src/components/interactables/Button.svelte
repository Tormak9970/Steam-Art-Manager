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
    padding: 0.425rem 0.75rem;
    min-width: 3.25rem;

    height: auto;
        
    background-color: var(--background-hover);
    border: 0.0625rem solid var(--foreground);
    border-radius: 0.25rem;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 0.75rem;
    cursor: pointer;

    color: var(--font-color);

    transition: background-color 0.15s ease-in-out, border 0.15s ease-in-out;
  }

  button:hover {
    background-color: var(--foreground);
    border: 0.0625rem solid var(--foreground-hover);
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
    border: 0.0625rem solid var(--save-hover);
  }
  .highlight:hover {
    background-color: #18bb03c5;
    border: 0.0625rem solid var(--save-hover);
  }

  .warn { background-color: var(--warning); }
  .warn:hover { background-color: var(--warning-hover); }
</style>
