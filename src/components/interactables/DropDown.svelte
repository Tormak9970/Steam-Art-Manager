<script lang="ts">
  import type { Placement } from "tippy.js";
  import { AppController } from "../../lib/controllers/AppController";

  export let label:string = "";
  export let options: string[];
  export let value: string;
  export let onChange: (value: string) => void = () => {};
  export let width = "auto";
  export let placement: Placement = "left";
  
  let active = false;

  const body = document.getElementsByTagName("body")[0];

  if (!body.hasAttribute("data-select-close")) {
    document.addEventListener("click", closeAllSelect);
    body.setAttribute("data-select-close", "");
  }

  /**
   * Closes all select elements.
   * @param element The element that was selected.
   */
  function closeAllSelect(element: any): void {
    let sameAsSelected = [];

    let selectedItems = document.getElementsByClassName("select-items") as HTMLCollectionOf<Element>;
    let selectedItemsLength = selectedItems.length;

    let selectedOptions = document.getElementsByClassName("select-selected") as HTMLCollectionOf<Element>;
    let selectedOptionsLength = selectedOptions.length;

    for (let i = 0; i < selectedOptionsLength; i++) {
      if (element == selectedOptions[i]) {
        sameAsSelected.push(i);
      } else {
        selectedOptions[i].classList.remove("select-arrow-active");
      }
    }

    for (let i = 0; i < selectedItemsLength; i++) {
      if (sameAsSelected.indexOf(i)) {
        selectedItems[i].classList.add("select-hide");
      }
    }
  }

  /**
   * Toggles the dropdown.
   * @param e The associated event.
   */
  function toggleDropdown(e: Event): void {
    const target = <HTMLDivElement>e.currentTarget;
    closeAllSelect(target);
    active = !active;
  }

  /**
   * Updates the dropdown with the new option.
   * @param e The associated event.
   */
  function selectOption(e: Event): void {
    const targetElement = <HTMLElement>e.currentTarget;
    let select = targetElement.parentElement.parentElement.parentElement.getElementsByTagName("select")[0];
    let numOptions = select.length;
    let selectDisplay = targetElement.parentElement.previousElementSibling;

    for (let i = 0; i < numOptions; i++) {
      if (select.options[i].innerHTML == targetElement.innerHTML) {
        select.selectedIndex = i;
        selectDisplay.innerHTML = targetElement.innerHTML;

        let y = targetElement.parentElement.getElementsByClassName("same-as-selected");
        let yl = y.length;
        for (let k = 0; k < yl; k++) {
          y[k].classList.toggle("same-as-selected");
        }

        targetElement.classList.toggle("same-as-selected");

        break;
      }
    }

    onChange(targetElement.innerHTML);
    value = targetElement.innerHTML;

    (selectDisplay as HTMLElement).click();
  }
</script>

<div class="wrapper" style="width: {width};">
  {#if label != ""}
    <div style="margin-right: 7px; font-size: 14px; user-select: none;">{label}:</div>
  {/if}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="custom-select" style="width: {width}; min-width: {width};" on:click|stopPropagation={toggleDropdown} use:AppController.tippy={{ content: value, placement: placement, onShow: AppController.onTippyShow}}>
    <select>
      <option value="default">{value}</option>
      {#each options as val}
        <option value={val.toLowerCase()}>{val}</option>
      {/each}
    </select>
  
    {#key value}
      <div class="select-selected" class:select-arrow-active={active}>{value}</div>
    {/key}
    <div class="select-items" class:select-hide={!active}>
      {#each options as val}
        {#if val == value}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div id={val} class="same-as-selected" on:click|stopPropagation={selectOption} use:AppController.tippy={{ content: val, placement: placement, onShow: AppController.onTippyShow}}>{val}</div>
        {:else}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div id={val} on:click|stopPropagation={selectOption} use:AppController.tippy={{ content: val, placement: placement, onShow: AppController.onTippyShow }}>{val}</div>
        {/if}
      {/each}
    </div>
  </div>
</div>

<style>
  @import "/theme.css";

  @keyframes loopOverflowingText {

  }

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
    padding: 2px;
    border-radius: 2px;
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
    padding: 2px 3px;
    padding-top: 4px;

    height: clac(22px - 7px);
    
    transition: background-color 0.15s ease-in-out;
  }
  .select-items {
    position: absolute;
    background-color: var(--foreground);
    top: 100%;
    left: 0;
    right: 0;
    z-index: 99;
    margin-top: 2px;
    border-radius: 2px;
    border: 1px solid transparent;
    box-shadow: 3px 6px 10px 4px var(--shadow);
  }
  .select-items > div:hover {
    background-color: var(--foreground-light);
    cursor: pointer;
  }

  .select-hide { display: none; }
  .same-as-selected {
    background-color: var(--foreground-light);
    cursor: pointer;
  }
</style>
