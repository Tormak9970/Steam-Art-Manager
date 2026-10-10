<script lang="ts">
  import { AppController } from "@controllers";
  import { TriangleExclamation } from "@icons";
  import { gridImageSize, gridType } from "@stores/AppState";
  import { GRID_DIMENSIONS, IMAGE_FADE_OPTIONS } from "@utils";
  import Lazy from "svelte-lazy";

  type Props = {
    imagePath: string;
    altText: string;
    showImage?: boolean;
    missingMessage: string;
    isVideo?: boolean;
  };

  let {
    imagePath,
    altText,
    showImage = true,
    missingMessage,
    isVideo = false,
  }: Props = $props();

  let showWarning = $state(false);

  let gridDimensions = $derived(GRID_DIMENSIONS[$gridImageSize]);

  let imageWidth = $derived(gridDimensions.widths[$gridType]);
  let imageHeight = $derived(gridDimensions.heights[$gridType]);

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

<div class="grid-img" style="height: {imageHeight}rem;">
  {#if showImage && !showWarning && imagePath}
    <Lazy height="{imageHeight}rem" fadeOption={IMAGE_FADE_OPTIONS}>
      {#if isVideo}
        <!-- svelte-ignore a11y_mouse_events_have_key_events -->
        <!-- svelte-ignore element_invalid_self_closing_tag -->
        <video
          src={imagePath}
          muted
          loop
          autoplay={false}
          style="max-width: {imageWidth}rem; max-height: {imageHeight}rem; width: auto; height: auto;"
          onmouseover={onEnter}
          onmouseleave={onLeave}
        />
      {:else}
        <img
          src={imagePath}
          alt={altText}
          style="max-width: {imageWidth}rem; max-height: {imageHeight}rem; width: auto; height: auto;"
          draggable="false"
          onerror={() => (showWarning = true)}
        />
      {/if}
    </Lazy>
  {:else}
    <div
      use:AppController.tippy={{
        content: missingMessage,
        placement: "bottom",
        onShow: AppController.onTippyShow,
      }}
    >
      <TriangleExclamation
        height="3rem"
        width="3rem"
        fill="var(--foreground-light-hover)"
      />
    </div>
  {/if}
</div>

<style>
  .grid-img {
    display: flex;
    flex-direction: column;
    justify-content: center;

    border-radius: 0.25rem;
    overflow: hidden;
  }
</style>
