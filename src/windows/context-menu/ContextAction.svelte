<script lang="ts">
  export let label: string;
  export let width = "40px";
  export let marginBottom = "5px";
  export let onClick: (e: MouseEvent) => void;
  export let disabled = false;
  export let highlight = false;
  export let warn = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<button class="button" class:warn={warn} class:highlight={highlight} class:disabled={disabled} style="width: {width}; margin-bottom: {marginBottom};" on:mouseup={onClick}>
  <slot />
  <div style="user-select: none; margin-left: 7px">{label}</div>
</button>

<style>
  .button {
    padding: 3px 6px;
    min-width: 40px;

    height: 25px;
        
    background-color: var(--foreground-hover);
    border: 1px solid transparent;
    border-radius: 4px;

    display: flex;
    align-items: center;

    font-size: 12px;
    cursor: pointer;

    color: var(--font-color);

    transition: background-color 0.15s ease-in-out, border 0.15s ease-in-out;
  }

  .button:hover {
    background-color: var(--foreground-light);
  }
</style>
