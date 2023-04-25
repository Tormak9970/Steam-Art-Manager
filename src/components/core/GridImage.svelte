<script lang="ts">
  import Lazy from "svelte-lazy";
  import { heights, widths } from "./imageDimensions";
  import { gridType } from "../../Stores";

  export let imagePath: string;
  export let altText: string;
  export let showImage: boolean = true;
  export let missingMessage: string;
  export let isVideo: boolean = false;

  let videoElement: HTMLVideoElement;
</script>

<div class="grid-img" style="height: {heights[$gridType]}px;">
  {#if showImage}
    <Lazy height="{heights[$gridType]}px" fadeOption={{delay: 500, duration: 1000}}>
      {#if isVideo}
        <video src="{imagePath}" muted class="vid" loop on:mouseenter={() => { videoElement.play(); }} on:mouseleave={() => { videoElement.pause(); }} bind:this={videoElement} />
      {:else}
        <img src="{imagePath}" alt="{altText}" style="max-width: {widths[$gridType]}px; max-height: {heights[$gridType]}px; width: auto; height: auto;" />
      {/if}
    </Lazy>
  {:else}
    <div style="text-align: center;">{missingMessage}</div>
  {/if}
</div>

<style>
  @import "/theme.css";

  .grid-img {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>