<script lang="ts">
  import { IconButton } from "@interactables";
  import type { ComponentType } from "svelte";

  export let label: string;
  export let options: {label: string, icon?: ComponentType, onClick: () => void}[];
  export let width = "auto";
  export let direction: "UP" | "DOWN" = "DOWN";
  export let disabled = false;

  let customSelectElemWrapper: HTMLDivElement;
  
  let open = false
  let active = false;

  /**
   * Closes all dropdowns.
   * @param e The click event.
   */
  function closeDropdowns(e: Event): void {
    const target = e.currentTarget as HTMLElement;
    // * Need this bc we want to only compare the properties of the objects.
    // eslint-disable-next-line eqeqeq
    if (target != customSelectElemWrapper) active = false;
  }
</script>

<svelte:window on:click={closeDropdowns} />

<!-- Overlay -->
<div class="custom-select" style="width: calc({width} - 0.5rem); min-width: calc({width} - 0.5rem);" bind:this={customSelectElemWrapper}>
  <IconButton label={label} on:click={() => open = !open} tooltipPosition={"top"} disabled={disabled}>
    <slot />
  </IconButton>

  {#if open}
    <div class="select-items" class:open-up={direction === "UP"} style="--top-percentage: -{(options.length + 1) * 100 - 35 }%;" class:select-hide={!open}>
      {#each options as option}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div on:click={() => { option.onClick(); open = false }}>
          <div class="icon-container">
            {#if option.icon}
              <svelte:component this={option.icon} style="height: 0.875rem; width: 0.875rem;" />
            {/if}
          </div>
          {option.label}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .custom-select {
    user-select: none;
    position: relative;
  }

  .select-items > div,
  .select-items > div {
    padding: 0.35rem 0.625rem;
    padding-top: 0.25rem;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;

    white-space: nowrap;
    gap: 1rem;

    font-size: 0.9rem;
    
    transition: background-color 0.15s ease-in-out;
  }
  .icon-container {
    width: 0.875rem;
    height: 0.875rem;
    
    color: var(--font-color);
    fill: var(--font-color);
  }
  .select-items {
    position: absolute;
    background-color: var(--background-hover);
    top: 102%;
    /* left: 0; */
    right: 0;
    z-index: 99;
    margin-top: 0.125rem;
    border-radius: 0.25rem;
    border: 0.0625rem solid var(--foreground-hover);
    box-shadow: 0.25rem 0.375rem 0.75rem -0.125rem var(--shadow);
    overflow: hidden;
  }
  .select-items > div:hover {
    background-color: var(--foreground);
    cursor: pointer;
  }
  
  .open-up {
    top: var(--top-percentage);
    left: 0;
    right: 0;
    z-index: 99;
    margin-top: 0.125rem;
    border-radius: 0.125rem;
    border: 0.0625rem solid transparent;
    box-shadow: -0.125rem -0.375rem 1.625rem -0.125rem var(--shadow);
  }

  .select-hide { display: none; }
</style>
