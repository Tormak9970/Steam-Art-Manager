<script lang="ts">
  import { LeftChevron, LeftDoubleChevron, RightChevron, RightDoubleChevron } from "@icons";
  import { IconButton } from "@interactables";


  export let currentPage:number
  export let resultsPerPage: number
  export let totalResults: number

  $: resultsStart = currentPage * resultsPerPage
  $: resultsEnd = Math.min(resultsStart + resultsPerPage, totalResults)

  $: finalPage = Math.ceil(totalResults / resultsPerPage)

  function makeWindow(center: number, min: number, max: number): number[] {
    const clampedShiftedCenter = Math.max(min, Math.min(center - 2, max - 5))
    return Array.from({ length: Math.min(5, finalPage) }, (_, i) => clampedShiftedCenter + i)
  }

  $: currentPageRange = makeWindow(currentPage, 0, finalPage)
</script>

<div class="container">
  <div class="button-container">
    <div class="viewing-message">Showing {resultsStart + 1} to {resultsEnd + 1} of {totalResults + 1}</div>
    <IconButton label="First Page" on:click={() => currentPage = 0} padding={"0.25rem"}>
      <LeftDoubleChevron style="height: 1rem; width: 1rem;" />
    </IconButton>
    <IconButton label="Previous" on:click={() => currentPage-- } padding={"0.25rem"}>
      <LeftChevron style="height: 1rem; width: 1rem;" />
    </IconButton>
    <div class="pages">
      {#each currentPageRange as page, i}
        <IconButton on:click={() => currentPage = page } padding={"0.25rem"} greyHighlight={page === currentPage}>
          <div style="height: 1rem; width: 1rem;">{page + 1}</div>
        </IconButton>
      {/each}
    </div>
    <IconButton label="Next" on:click={() => currentPage-- } padding={"0.25rem"}>
      <RightChevron style="height: 1rem; width: 1rem;" />
    </IconButton>
    <IconButton label="Last Page" on:click={() => currentPage = finalPage} padding={"0.25rem"}>
      <RightDoubleChevron style="height: 1rem; width: 1rem;" />
    </IconButton>
  </div>
</div>

<style>
  .container {
    width: 100%;

    padding-top: 1rem;

    display: flex;
    justify-content: center;

    height: 4rem;
  }

  .button-container {
    height: fit-content;
    
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 0.5rem;
  }

  .pages {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 0.5rem;
  }

  .pages > div {
    text-align: center;
  }

  .viewing-message {
    text-align: center;
    opacity: 0.5;
    font-size: 0.75rem;

    width: fit-content;
    text-wrap: nowrap;

    position: absolute;
    top: calc(100% + 0.5rem);
  }
</style>