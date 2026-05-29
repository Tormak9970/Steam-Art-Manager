<script lang="ts">
  import { Image } from "@icons";
  import { LoadingSpinner } from "@layout";
  import { GridTypes } from "@types";
  import { CURRENT_GRID_DIMENSIONS, IMAGE_FADE_OPTIONS } from "@utils";
  import Lazy from "svelte-lazy";
  
  export let gridType: GridTypes;
  export let src: string;
  export let selected = false;
</script>

<div class="grid-image">
  <div class="loading-overlay" class:selected={selected}>
    <LoadingSpinner width="2.5rem" height="2.5rem" />
  </div>
  <div class="label">{gridType}</div>
  <div class="img-cont" style="width: {CURRENT_GRID_DIMENSIONS.widths[gridType]}rem; height: {CURRENT_GRID_DIMENSIONS.heights[gridType]}rem;">
    {#if src && src !== ""}
      <div class="img" class:logo-background={gridType === GridTypes.LOGO} class:icon-background={gridType === GridTypes.ICON} style="max-height: {CURRENT_GRID_DIMENSIONS.heights[gridType]}rem;">
        <Lazy height="{CURRENT_GRID_DIMENSIONS.heights[gridType]}rem" fadeOption={IMAGE_FADE_OPTIONS}>
          <img src="{src}" alt="{gridType} image." style="max-width: {CURRENT_GRID_DIMENSIONS.widths[gridType]}rem; max-height: {CURRENT_GRID_DIMENSIONS.heights[gridType]}rem; width: auto; height: auto;" />
        </Lazy>
      </div>
    {:else}
      <div class="logo-background" style="width: {CURRENT_GRID_DIMENSIONS.widths[gridType]}rem; height: {CURRENT_GRID_DIMENSIONS.heights[gridType]}rem;">
        <Image style="width: 2rem; height: 2rem; fill: var(--font-color)" />
      </div>
    {/if}
  </div>
</div>

<style>
  .grid-image {
    position: relative;
  }
  
  .label {
    padding-left: 0.625rem;
    font-size: 1.5rem;
  }

  .img-cont {
    margin: 0.125rem 0.625rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .img-cont > .img {
    border-radius: 0.125rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .logo-background {
    border-radius: 0.5rem;
    background-color: #a3a3a3;
    background-image: linear-gradient(140deg, #adadad 0%, #727272 50%, #535353 75%);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .loading-overlay {
    display: none;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    border-radius: 0.25rem;

    background-color: rgba(0, 0, 0, 0.7);

    justify-content: center;
    align-items: center;
  }
  
  .selected {
    display: flex;
  }
</style>