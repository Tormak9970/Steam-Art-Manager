<script lang="ts">
  import {
    LeftChevron,
    LeftDoubleChevron,
    RightChevron,
    RightDoubleChevron,
  } from "@icons";
  import { IconButton } from "@interactables";

  type Props = {
    currentPage: number;
    resultsPerPage: number;
    totalResults: number;
    disabled?: boolean;
  };

  let {
    currentPage,
    resultsPerPage,
    totalResults,
    disabled = false,
  }: Props = $props();

  let resultsStart = $derived(currentPage * resultsPerPage);
  let resultsEnd = $derived(
    Math.min(resultsStart + resultsPerPage, totalResults),
  );

  let finalPage = $derived(Math.ceil(totalResults / resultsPerPage));

  function makeWindow(center: number, min: number, max: number): number[] {
    const clampedShiftedCenter = Math.max(min, Math.min(center - 2, max - 5));
    return Array.from(
      { length: Math.min(5, finalPage) },
      (_, i) => clampedShiftedCenter + i,
    );
  }

  let currentPageRange = $derived(makeWindow(currentPage, 0, finalPage));
</script>

<div class="container" class:disabled>
  <div class="button-container">
    <div class="viewing-message">
      Showing {resultsStart + 1} to {resultsEnd + 1} of {totalResults + 1}
    </div>
    <IconButton
      label="First Page"
      onClick={() => {
        currentPage = 0;
      }}
      disabled={currentPage === 0}
      padding={"0.25rem"}
    >
      <LeftDoubleChevron style="height: 1rem; width: 1rem;" />
    </IconButton>
    <IconButton
      label="Previous"
      onClick={() => {
        currentPage--;
      }}
      disabled={currentPage === 0}
      padding={"0.25rem"}
    >
      <LeftChevron style="height: 1rem; width: 1rem;" />
    </IconButton>
    <div class="pages">
      {#each currentPageRange as page, i}
        <IconButton
          label={`Page ${page + 1}`}
          onClick={() => {
            currentPage = page;
          }}
          padding={"0.25rem"}
          greyHighlight={page === currentPage}
        >
          <div style="height: 1rem; width: 1rem;">{page + 1}</div>
        </IconButton>
      {/each}
    </div>
    <IconButton
      label="Next"
      onClick={() => {
        currentPage++;
      }}
      disabled={currentPage === finalPage - 1}
      padding={"0.25rem"}
    >
      <RightChevron style="height: 1rem; width: 1rem;" />
    </IconButton>
    <IconButton
      label="Last Page"
      onClick={() => {
        currentPage = finalPage - 1;
      }}
      disabled={currentPage === finalPage - 1}
      padding={"0.25rem"}
    >
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

  .disabled {
    visibility: hidden;
  }
</style>
