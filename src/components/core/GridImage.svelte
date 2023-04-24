<script lang="ts">
  import Lazy from "svelte-lazy";
  import { heights, widths } from "./imageDimensions";
  import { gridType } from "../../Stores";

  export let imagePath: string;
  export let altText: string;
  export let showImage: boolean = true;
  export let missingMessage: string;

  const videoExts = [".webp"]

  $: isVideo = videoExts.some((ext) => imagePath.endsWith(ext));
</script>

<div class="grid-img" style="height: {heights[$gridType]}px;">
  {#if showImage}
    <Lazy height="{heights[$gridType]}px" fadeOption={{delay: 500, duration: 1000}}>
      {#if isVideo}
        <div>its a video</div>
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