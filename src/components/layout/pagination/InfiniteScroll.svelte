<script lang="ts">
  import { onDestroy, createEventDispatcher } from "svelte";

  export let threshold = 0;
  export let horizontal = false;
  export let hasMore = true;

  const dispatch = createEventDispatcher();
  let isLoadMore = false;
  let component: any;

  $: {
    if (component) {
      const element = component.parentNode.parentNode;

      element.addEventListener("scroll", onScroll);
      element.addEventListener("resize", onScroll);
    }
  }

  function onScroll(e: any) {
    const offset = horizontal
      ? e.target.scrollWidth - e.target.clientWidth - e.target.scrollLeft
      : e.target.scrollHeight - e.target.clientHeight - e.target.scrollTop;

    if (offset <= threshold) {
      if (!isLoadMore && hasMore) {
        dispatch("loadMore");
      }
      isLoadMore = true;
    } else {
      isLoadMore = false;
    }
  }

  onDestroy(() => {
    if (component) {
      const element = component.parentNode.parentNode;

      element.removeEventListener("scroll", null);
      element.removeEventListener("resize", null);
    }
  });
</script>

<div bind:this={component} style="width:0px" />