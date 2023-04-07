<script lang="ts">
  export let label: string;
  export let width = "40px";
  export let height = "auto";
  export let onClick: (e: MouseEvent) => void;
  export let disabled = false;
  export let highlight = false;
  export let warn = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<button class="button" class:warn={warn} class:highlight={highlight} class:disabled={disabled} style="width: {width}; height: {height};" on:click={onClick}>
  <div style="user-select: none;">{label}</div>
</button>

<style>
  @import "/theme.css";

  .button {
    padding: 3px 6px;
    min-width: 40px;
        
    background-color: var(--background);
    border: 1px solid #000;
    border-radius: 1px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 12px;
    cursor: pointer;

    color: rgb(231, 231, 231);

    transition: background-color 0.15s ease-in-out;
  }

  .button:hover {
    background-color: var(--background-hover);
  }

  .button:focus {
    border: 1px solid var(--highlight);
    outline: none;
  }

  .disabled {
    pointer-events: none;
    opacity: 0.7;
  }

  .highlight { background-color: var(--highlight-dim); }
  .highlight:hover { background-color: var(--highlight-dim-hover); }

  .warn { background-color: var(--warning); }
  .warn:hover { background-color: var(--warning-hover); }
</style>
