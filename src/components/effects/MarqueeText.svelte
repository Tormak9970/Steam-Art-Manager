<script lang="ts">
  import { afterUpdate, onMount } from "svelte";

  export let duration = 15;
  export let repeat = 2;

  let hovered = false;
  let play = true;

  let marqueeElement: HTMLDivElement;

  onMount(() => {
    const container = document.querySelector(".marquee-text") as HTMLElement;
    container.onmouseover = () => {
      hovered = true;
    }
    container.onmouseleave = () => {
      hovered = false;
    }

    if (marqueeElement.clientWidth < marqueeElement.scrollWidth) {
      play = false;
    }
  });

  afterUpdate(() => {
    if (marqueeElement.clientWidth < marqueeElement.scrollWidth) {
      play = false;
    } else {
      play = true;
    }
  });
</script>

<div class="marquee-text" style="overflow: hidden;" bind:this={marqueeElement}>
  <div class="content" class:paused={!hovered}>
    {#each Array(repeat) as _, i}
      <div class="text" style="animation-duration: {duration}s">
        <slot />
      </div>
    {/each}
  </div>
</div>

<style>
  .marquee-text {
    width: inherit;
  }
  .content {
    width: 100000px;
  }
  .text {
    animation-name: animation;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    float: left;
  }
  .paused .text {
    animation-play-state: paused;
  }
  @keyframes animation {
    100% {
      transform: translateX(-100%);
    }
  }
</style>