<script lang="ts">
  import type { Placement } from "tippy.js";
  import { AppController } from "../../lib/controllers/AppController";
  import { afterUpdate } from "svelte";

  export let label:string = "";
  export let options: {label: string, data: any}[];
  export let value: string;
  export let onChange: (value: string) => void = () => {};
  export let width = "auto";
  export let tooltipPosition: Placement = "left";
  export let direction: "UP" | "DOWN" = "DOWN";

  let customSelectElem: HTMLDivElement;
  let customSelectElemWrapper: HTMLDivElement;
  let internalValue = options.find((opt) => opt.data == value)?.label;
  
  let active = false;

  /**
   * Closes all dropdowns.
   * @param e The click event.
   */
  function closeDropdowns(e: Event): void {
    const target = <HTMLDivElement>e.target;
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
    const targetElement = <HTMLElement>e.currentTarget;
    
    onChange(targetElement.id);
    value = targetElement.id;
    internalValue = targetElement.innerHTML;

    toggleDropdown();
  }

  afterUpdate(() => {
    internalValue = options.find((opt) => opt.data == value)?.label;
  });
</script>

<svelte:window on:click={closeDropdowns} />

<div class="wrapper" style="width: {width};">
  {#if label != ""}
    <div style="margin-right: 7px; font-size: 14px; user-select: none;">{label}:</div>
  {/if}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="custom-select" style="width: {width}; min-width: {width};" on:click={toggleDropdown} use:AppController.tippy={{ content: internalValue, placement: tooltipPosition, onShow: AppController.onTippyShow}} bind:this={customSelectElemWrapper}>
    <select>
      <option value="default">{internalValue}</option>
      {#each options as opt}
        <option value={opt.data}>{opt.label}</option>
      {/each}
    </select>
  
    {#key value}
      <div class="select-selected" class:select-arrow-active={active} bind:this={customSelectElem}>{internalValue}</div>
    {/key}
    <div class="select-items" class:open-up={direction=="UP"} style="--top-percentage: -{(options.length + 1) * 100 - 35 }%;" class:select-hide={!active}>
      {#each options as opt}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div id={opt.data} class:same-as-selected={opt.data == value} on:click|stopPropagation={selectOption} use:AppController.tippy={{ content: opt.label, placement: tooltipPosition, onShow: AppController.onTippyShow}}>{opt.label}</div>
      {/each}
    </div>
  </div>
</div>

<style>
  @import "/theme.css";

  .wrapper {
    margin: 0px;

		display: flex;
		flex-direction: row;
		align-items: center;

		color: var(--font-color);

    font-size: 14px;
  }

  .custom-select {
    user-select: none;
    position: relative;
    padding: 3px;
    border-radius: 4px;
    border: 1px solid transparent;

    background-color: var(--foreground);

    min-width: 160px;
  }
  .custom-select:hover {
    background-color: var(--foreground-hover);
    cursor: pointer;
  }
  .custom-select > select { display: none; }

  .select-selected {
    text-overflow: ellipsis;
    overflow: hidden;

    width: calc(100% - 30px);
  }
  .select-selected::after {
    position: absolute;
    content: "";
    top: 38.88%;
    right: 4%;
    width: 0;
    height: 0;
    border: min(1.333vw, 6px) solid transparent;
    border-color: var(--font-color) transparent transparent transparent;
  }
  
  :global(.select-arrow-active::after) {
    border-color: transparent transparent var(--font-color) transparent !important;
    top: 7px !important;
  }

  .select-items > div,
  .select-selected {
    color: var(--font-color);
    padding: 0px 3px;
    cursor: pointer;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .select-items > div {
    padding: 3px 4px;
    padding-top: 5px;

    height: calc(22px - 7px);
    
    transition: background-color 0.15s ease-in-out;
  }
  .select-items > div:first-child {
    border-radius: 4px 4px 0px 0px;
    overflow: hidden;
  }
  .select-items > div:last-child {
    border-radius: 0px 0px 4px 4px;
    overflow: hidden;
  }
  .select-items {
    position: absolute;
    background-color: var(--foreground);
    top: 102%;
    left: 0;
    right: 0;
    z-index: 99;
    margin-top: 2px;
    border-radius: 4px;
    border: 1px solid transparent;
    box-shadow: 3px 6px 12px -2px var(--shadow);
  }
  .select-items > div:hover {
    background-color: var(--foreground-light);
    cursor: pointer;
  }
  
  .open-up {
    top: var(--top-percentage);
    left: 0;
    right: 0;
    z-index: 99;
    margin-top: 2px;
    border-radius: 2px;
    border: 1px solid transparent;
    box-shadow: -3px -6px 26px -2px var(--shadow);
  }

  .select-hide { display: none; }
  .same-as-selected {
    background-color: var(--foreground-light);
    cursor: pointer;
  }
</style>
