<script lang="ts">
  import { debounce } from "../../lib/utils/Utils";
  import { scrollShadow } from "../../lib/directives/scrollShadow";

  export let width = "100%";
  export let height = "auto";
  export let marginTop = "7px";
  export let padding = "5px";
  export let background = "var(--background-dark)";
  export let loading = false;

  let isOverflowing = !loading;
  let contentHeight: number;
  $: contentHeight && debouncedCheck();
  
  let overflowContainer: HTMLDivElement;
  let scrollContainer: HTMLDivElement;
  let scrollTarget: HTMLDivElement;

  /**
   * Check if the content of the scroll container needs a scroll bar.
   * @param element The element to use for checking.
   * @returns True if the container needs scrolling.
   */
  function checkOverflow(element: HTMLElement): boolean {
    const curOverflow = element.style.overflow;

    if (!curOverflow || curOverflow === "visible") element.style.overflow = "hidden";

    const isOverflowing = (element.clientWidth < element.scrollWidth) || (element.clientHeight < element.scrollHeight);

    element.style.overflow = curOverflow;

    return isOverflowing;
  }

  const setIsOverflowing = () => { if (scrollContainer) isOverflowing = checkOverflow(scrollContainer); };
  const debouncedCheck: () => void = debounce(setIsOverflowing, 100);
</script>

<svelte:window on:resize={() => debouncedCheck()} />

<div class="padded-scroll-container" style="width: {width}; height: {height}; background-color: {background}; margin-top: {marginTop}; padding: {padding};">
  <div class="overflow-shadow-container" style="width: calc(100% - 4px); height: calc(100% - 4px);" bind:this={overflowContainer}>
    <div class="padded-scroll-inner" style="overflow: {loading ? "hidden" : "auto"};" bind:this={scrollContainer} use:scrollShadow={{ target: scrollTarget, container: overflowContainer, heightBump: 0 }}>
      <div class="padded-scroll-padding" style="padding-right: {loading || !isOverflowing ? "0px" : "7px"};" bind:this={scrollTarget} bind:clientHeight={contentHeight}>
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