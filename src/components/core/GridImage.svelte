<script lang="ts">
  import Lazy from "svelte-lazy";
  import { heights, widths } from "./imageDimensions";
  import { gridType } from "../../stores/AppState";

  export let imagePath: string;
  export let altText: string;
  export let showImage: boolean = true;
  export let missingMessage: string;
  export let isVideo: boolean = false;

  /**
   * Function to run when the user starts hovering over a video.
   * @param e The associated MouseEvent.
   */
  function onEnter(e: Event) {
    (e.target as HTMLVideoElement).play();
  }

  /**
   * Function to run when the user stops hovering over a video.
   * @param e The associated MouseEvent.
   */
  function onLeave(e: Event) {
    (e.target as HTMLVideoElement).pause();
  }
</script>

<div class="grid-img" style="height: {heights[$gridType]}px;">
  {#if showImage}
    <Lazy height="{heights[$gridType]}px" fadeOption={{delay: 500, duration: 1000}}>
      {#if isVideo}
        <video src="{imagePath}" muted loop autoplay={false} style="max-width: {widths[$gridType]}px; max-height: {heights[$gridType]}px; width: auto; height: auto;" on:mouseover={onEnter} on:mouseleave={onLeave} />
      {:else}
        <img src="{imagePath}" alt="{altText}" style="max-width: {widths[$gridType]}px; max-height: {heights[$gridType]}px; width: auto; height: auto;" draggable="false" />
      {/if}
    </Lazy>
  {:else}
    <div style="text-align: center;">{missingMessage}</div>
  {/if}
</div>

<style>
  .grid-img {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>