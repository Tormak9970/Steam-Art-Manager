<script lang="ts">
  import { AppController } from "@controllers";
  import { afterUpdate } from "svelte";
  import type { Placement } from "tippy.js";

  export let label:string = "";
  export let options: {label: string, data: any}[];
  export let value: string;
  export let onChange: (value: string) => void = () => {};
  export let width = "auto";
  export let showTooltip = true;
  export let tooltipPosition: Placement = "left";
  export let entryTooltipPosition: Placement = tooltipPosition;
  export let direction: "UP" | "DOWN" = "DOWN";
  export let disabled = false;

  let customSelectElem: HTMLDivElement;
  let customSelectElemWrapper: HTMLDivElement;
  let internalValue = options.find((opt) => opt.data === value)?.label;
  
  let active = false;

  /**
   * Closes all dropdowns.
   * @param e The click event.
   */
  function closeDropdowns(e: Event): void {
    const target = e.currentTarget as HTMLElement;
    // * Need this bc we want to only compare the properties of the objects.
    // eslint-disable-next-line eqeqeq
    if (target != customSelectElem && target != customSelectElemWrapper) active = false;
  }

  /**
   * Toggles the dropdown.
   */
  function toggleDropdown(): void {
    active = !active;
  }

  /**
   * Updates the dropdown with the new option.
   * @param e The associated event.
   */
  function selectOption(e: Event): void {
    const targetElement = e.currentTarget as HTMLElement;
    
    onChange(targetElement.id);
    value = targetElement.id;

    toggleDropdown();
  }

  afterUpdate(() => {
    internalValue = options.find((opt) => opt.data === value)?.label;
  });
</script>

<svelte:window on:click={closeDropdowns} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="wrapper" on:click|stopPropagation>
  {#if label !== ""}
    <div style="margin-right: 0.5rem; font-size: 0.875rem; user-select: none;">{label}:</div>
  {/if}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  {#if showTooltip}
    <div class="custom-select" class:disabled={disabled} style="width: calc({width} - 0.5rem); min-width: calc({width} - 0.5rem);" on:click={toggleDropdown} use:AppController.tippy={{ content: internalValue, placement: active ? entryTooltipPosition : tooltipPosition, onShow: AppController.onTippyShow }} bind:this={customSelectElemWrapper}>
      <select>
        <option value="default">{internalValue}</option>
        {#each options as opt}
          <option value={opt.data}>{opt.label}</option>
        {/each}
      </select>
    
      {#key value}
        <div class="select-selected" class:select-arrow-active={active} bind:this={customSelectElem}>{internalValue}</div>
      {/key}
      <div class="select-items" class:select-hide={!active} class:open-up={direction === "UP"} style="--top-percentage: -{(options.length + 1) * 100 - 35 }%;">
        {#each options as opt}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div id={opt.data} class:same-as-selected={opt.data === value} on:click|stopPropagation={selectOption} use:AppController.tippy={{ content: opt.label, placement: entryTooltipPosition, onShow: AppController.onTippyShow }}>{opt.label}</div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="custom-select" class:disabled={disabled} style="width: calc({width} - 0.5rem); min-width: calc({width} - 0.5rem);" on:click={toggleDropdown} bind:this={customSelectElemWrapper}>
      <select>
        <option value="default">{internalValue}</option>
        {#each options as opt}
          <option value={opt.data}>{opt.label}</option>
        {/each}
      </select>
    
      {#key value}
        <div class="select-selected" class:select-arrow-active={active} bind:this={customSelectElem}>{internalValue}</div>
      {/key}
      <div class="select-items" class:open-up={direction === "UP"} style="--top-percentage: -{(options.length + 1) * 100 - 35 }%;" class:select-hide={!active}>
        {#each options as opt}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div id={opt.data} class:same-as-selected={opt.data === value} on:click|stopPropagation={selectOption}>{opt.label}</div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .wrapper {
    margin: 0rem;

		display: flex;
		flex-direction: row;
		align-items: center;

		color: var(--font-color);

    font-size: 0.875rem;
  }

  .custom-select {
    user-select: none;
    position: relative;
    padding: 0.3125rem;
    border-radius: 0.25rem;
    border: 0.0625rem solid var(--foreground);

    background-color: var(--background-hover);
    transition: background-color 0.15s ease-in-out;
    
    min-width: 10rem;
  }
  .custom-select:hover {
    background-color: var(--foreground);
    border: 0.0625rem solid var(--foreground-hover);
    cursor: pointer;
  }
  .disabled {
    pointer-events: none;
    opacity: 0.6;
  }
  .custom-select > select { display: none; }

  .select-selected {
    text-overflow: ellipsis;
    overflow: hidden;

    width: calc(100% - 1.875rem);
    line-height: 1rem;
  }
  .select-selected::after {
    position: absolute;
    content: "";
    top: 38.88%;
    right: 4%;
    width: 0;
    height: 0;
    border: min(1.333vw, 0.375rem) solid transparent;
    border-color: var(--font-color) transparent transparent transparent;
  }
  
  .select-arrow-active::after {
    border-color: transparent transparent var(--font-color) transparent;
    top: 0.5rem;
  }

  .select-items > div,
  .select-selected {
    color: var(--font-color);
    padding: 0rem 0.125rem;
    cursor: pointer;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .select-items > div {
    padding: 0.25rem 0.3125rem;
    padding-top: 0.3125rem;
    
    transition: background-color 0.15s ease-in-out;
  }
  .select-items {
    position: absolute;
    background-color: var(--background-hover);
    top: 102%;
    left: 0;
    right: 0;
    z-index: 99;
    margin-top: 0.125rem;
    border-radius: 0.25rem;
    border: 0.0625rem solid var(--foreground-hover);
    box-shadow: 0.125rem 0.75rem -0.125rem var(--shadow);
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
    box-shadow: -0.125rem -0.75rem 1.625rem -0.125rem var(--shadow);
  }

  .select-hide { display: none; }
  .same-as-selected,
  .select-items > div.same-as-selected:hover {
    background-color: var(--foreground-light);
    cursor: pointer;
  }
</style>
