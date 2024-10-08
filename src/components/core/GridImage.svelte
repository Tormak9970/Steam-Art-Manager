<script lang="ts">
    import { AppController } from "@controllers";
    import { TriangleExclamation } from "@icons";
    import { gridType } from "@stores/AppState";
    import { IMAGE_FADE_OPTIONS, SMALL_GRID_DIMENSIONS } from "@utils";
    import Lazy from "svelte-lazy";

  export let imagePath: string;
  export let altText: string;
  export let showImage: boolean = true;
  export let missingMessage: string;
  export let isVideo: boolean = false;

  let showWarning = false;

  /**
   * Function to run when the user starts hovering over a video.
   * @param e The associated MouseEvent.
   */
  function onEnter(e: Event): void {
    (e.target as HTMLVideoElement).play();
  }

  /**
   * Function to run when the user stops hovering over a video.
   * @param e The associated MouseEvent.
   */
  function onLeave(e: Event): void {
    (e.target as HTMLVideoElement).pause();
  }
</script>

<div class="grid-img" style="height: {SMALL_GRID_DIMENSIONS.heights[$gridType]}px;">
  {#if showImage && !showWarning && imagePath}
    <Lazy height="{SMALL_GRID_DIMENSIONS.heights[$gridType]}px" fadeOption={IMAGE_FADE_OPTIONS}>
      {#if isVideo}
        <video
          src="{imagePath}"
          muted
          loop
          autoplay={false}
          style="max-width: {SMALL_GRID_DIMENSIONS.widths[$gridType]}px; max-height: {SMALL_GRID_DIMENSIONS.heights[$gridType]}px; width: auto; height: auto;"
          on:mouseover={onEnter}
          on:mouseleave={onLeave}
        />
      {:else}
        <img
          src="{imagePath}"
          alt="{altText}"
          style="max-width: {SMALL_GRID_DIMENSIONS.widths[$gridType]}px; max-height: {SMALL_GRID_DIMENSIONS.heights[$gridType]}px; width: auto; height: auto;"
          draggable="false"
          on:error={() => showWarning = true}
        />
      {/if}
    </Lazy>
  {:else}
    <div use:AppController.tippy={{ content: missingMessage, placement: "bottom", onShow: AppController.onTippyShow }}>
      <TriangleExclamation height="3rem" width="3rem" fill="var(--foreground-light-hover)" />
    </div>
  {/if}
</div>

<style>
  .grid-img {
    display: flex;
    flex-direction: column;
    justify-content: center;

    border-radius: 4px;
    overflow: hidden;
  }
</style>