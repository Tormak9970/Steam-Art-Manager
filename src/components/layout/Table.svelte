<script lang="ts">
  import { scrollShadow } from "../directives/scrollShadow";

  export let height = "400px";
  export let marginLeft = "7px";

  let overflowContainer: HTMLDivElement;
  let scrollTarget: HTMLDivElement;
</script>

<div class="table" style="height: {height}; margin-left: {marginLeft};">
  <div class="header">
    <slot name="header" />
  </div>
  <div class="border" style="margin-top: 3px;"></div>
  <div class="overflow-shadow-container" bind:this={overflowContainer} >
    <div class="data-scroller" use:scrollShadow={{ target: scrollTarget, container: overflowContainer, heightBump: 8 }}>
      <div class="data" bind:this={scrollTarget}>
        <slot name="data" />
      </div>
    </div>
  </div>
</div>

<style>
  .table {
    margin-top: 7px;

    width: calc(100% - 28px);
    
    padding: 7px;

    border-radius: 4px;

    background-color: var(--background-dark);
  }

  .border {
    margin-top: 7px;
    position: relative;
    z-index: 2;

    border-bottom: 1px solid var(--foreground);
  }

  .header, .header :global(> :first-child) {
    width: 100%;

    display: flex;
    justify-content: flex-start;
  }

  .data {
    margin-top: 3px;
    width: 100%;

    overflow: hidden;
  }

  .data-scroller {
    padding: 3px;
    width: calc(100% - 6px);
    margin-right: 6px;

    margin-top: 5px;

    height: 100%;

    overflow: scroll;
  }

  .overflow-shadow-container {
    height: calc(100% - 20px);
  }
</style>