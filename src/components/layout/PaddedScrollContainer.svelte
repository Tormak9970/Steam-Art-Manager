<script lang="ts">
  import { scrollShadow } from "../directives/scrollShadow";

  export let width = "100%";
  export let height = "auto";
  export let loading = false;
  
  let overflowContainer: HTMLDivElement;
  let scrollTarget: HTMLDivElement;
</script>

<div class="padded-scroll-container" style="width: {width}; height: {height};">
  <div class="overflow-shadow-container" style="width: calc(100% - 4px); height: calc(100% - 4px);" bind:this={overflowContainer}>
    <div class="padded-scroll-inner" style="overflow: {loading ? "hidden" : "auto"};" use:scrollShadow={{ target: scrollTarget, container: overflowContainer, heightBump: 0 }}>
      <div class="padded-scroll-padding" style="padding-right: {loading ? "0px" : "7px"};" bind:this={scrollTarget}>
        <slot />
      </div>
    </div>
  </div>
</div>

<style>
  .padded-scroll-container {
    background-color: var(--background-dark);
    border-radius: 4px;

    margin-top: 7px;
    padding: 5px;

    overflow: hidden;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .padded-scroll-inner {
    width: 100%;
    height: 100%;
  }

  .padded-scroll-padding {
    height: auto;
  }
</style>