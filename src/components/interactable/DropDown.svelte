<script lang="ts">
  export let fieldName:string;
  export let options: string[];
  export let value: string;
  export let handler: (value: string) => void = () => {};

  const body = document.getElementsByTagName("body")[0];

  if (!body.hasAttribute("data-select-close")) {
    document.addEventListener("click", closeAllSelect);
    body.setAttribute("data-select-close", "");
  }

  function closeAllSelect(elmnt: any) {
    let x: string | any[] | HTMLCollectionOf<Element>, y: string | any[] | HTMLCollectionOf<Element>, i: number, xl: number, yl: number, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i);
      } else {
        y[i].classList.remove("select-arrow-active");
      }
    }
    for (i = 0; i < xl; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add("select-hide");
      }
    }
  }

  function aHandleClick(e: Event) {
    const target = <HTMLDivElement>e.currentTarget;
    closeAllSelect(target);
    target.nextElementSibling.classList.toggle("select-hide");
    target.classList.toggle("select-arrow-active");
  }

  function eHandleClick(e: Event) {
    const elem = <HTMLElement>e.currentTarget;
    let s = elem.parentElement.parentElement.parentElement.getElementsByTagName("select")[0];
    let sl = s.length;
    let h = elem.parentElement.previousElementSibling;

    for (let i = 0; i < sl; i++) {
      if (s.options[i].innerHTML == elem.innerHTML) {
        s.selectedIndex = i;
        h.innerHTML = elem.innerHTML;

        let y = elem.parentElement.getElementsByClassName("same-as-selected");
        let yl = y.length;
        for (let k = 0; k < yl; k++) {
          y[k].classList.toggle("same-as-selected");
        }

        elem.classList.toggle("same-as-selected");

        break;
      }
    }

    handler(elem.innerHTML);
    value = elem.innerHTML;

    (h as HTMLElement).click();
  }
</script>

<div class="wrapper">
  <div style="margin-right: 13px; font-size: 14px">{fieldName}:</div>
  <div class="custom-select">
    <select>
      <option value="default">{value}</option>
      {#each options as val}
        <option value={val.toLowerCase()}>{val}</option>
      {/each}
    </select>
  
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div class="select-selected" on:click|stopPropagation={aHandleClick}>{value}</div>
    <div class="select-items select-hide">
      {#each options as val}
        {#if val == value}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div id={val} class="same-as-selected" on:click|stopPropagation={eHandleClick}>{val}</div>
        {:else}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div id={val} on:click|stopPropagation={eHandleClick}>{val}</div>
        {/if}
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

    font-size: 12px;
    width: 100%;
}

  .custom-select {
    user-select: none;
    position: relative;
    width: calc(100% - 26px);
    padding: 0px;
    border-radius: 1px;
    border: 1px solid black;

    background-color: var(--background);

    max-width: 150px;
  }
  .custom-select > select { display: none; }
  .select-selected { background-color: var(--background); }
  .select-selected::after {
    position: absolute;
    content: "";
    top: 38.88%;
    right: 9%;
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
  }
  .select-items > div {
    padding: 0px 2px;
  }
  .select-items {
    position: absolute;
    background-color: var(--background);
    top: 100%;
    left: 0;
    right: 0;
    z-index: 99;
    margin-top: 2px;
    border-radius: 1px;
    border: 1px solid black;
    overflow: hidden;
  }
  .select-items > div:hover {
    background-color: var(--background-hover);
    cursor: pointer;
  }
  .select-hide {
    display: none;
  }
  .same-as-selected {
    background-color: var(--background-hover);
    cursor: pointer;
  }
</style>
