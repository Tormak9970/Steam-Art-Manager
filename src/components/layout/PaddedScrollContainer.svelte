<script lang="ts">
  import { onMount } from "svelte";
  import { debounce } from "../../lib/utils/Utils";
  import { scrollShadow } from "../directives/scrollShadow";

  export let width = "100%";
  export let height = "auto";
  export let marginTop = "7px";
  export let padding = "5px";
  export let background = "var(--background-dark)";
  export let loading = false;

  let isOverflowing = !loading;
  
  let overflowContainer: HTMLDivElement;
  let scrollContainer: HTMLDivElement;
  let scrollTarget: HTMLDivElement;

  function checkOverflow(element: HTMLElement) {
    const curOverflow = element.style.overflow;

    if (!curOverflow || curOverflow === "visible") element.style.overflow = "hidden";

    const isOverflowing = (element.clientWidth < element.scrollWidth) || (element.clientHeight < element.scrollHeight);

    element.style.overflow = curOverflow;

    return isOverflowing;
  }

  const setIsOverflowing = () => {
    if (scrollContainer) isOverflowing = checkOverflow(scrollContainer);
  };
  const debouncedCheck: () => void = debounce(setIsOverflowing, 100);

  onMount(() => {
    setIsOverflowing();
  });
</script>

<svelte:window on:resize={() => debouncedCheck()} />

<div class="padded-scroll-container" style="width: {width}; height: {height}; background-color: {background}; margin-top: {marginTop}; padding: {padding};">
  <div class="overflow-shadow-container" style="width: calc(100% - 4px); height: calc(100% - 4px);" bind:this={overflowContainer}>
    <div class="padded-scroll-inner" style="overflow: {loading ? "hidden" : "auto"};" bind:this={scrollContainer} use:scrollShadow={{ target: scrollTarget, container: overflowContainer, heightBump: 0 }}>
      <div class="padded-scroll-padding" style="padding-right: {loading || !isOverflowing ? "0px" : "7px"};" bind:this={scrollTarget}>
        <slot />
      </div>
    </div>
  </div>
</div>

<style>
  .padded-scroll-container {
    border-radius: 4px;

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