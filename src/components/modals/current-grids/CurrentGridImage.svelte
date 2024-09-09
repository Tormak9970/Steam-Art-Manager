<script lang="ts">
  import { GridTypes } from "@types";
  import { CURRENT_GRID_DIMENSIONS, IMAGE_FADE_OPTIONS } from "@utils";
  import Lazy from "svelte-lazy";
  
  export let gameTitle: string;
  export let gridType: GridTypes;
  export let src: string;
</script>

<div class="grid-image">
  <div class="label">{gridType}</div>
  <div class="img-cont" style="width: {CURRENT_GRID_DIMENSIONS.widths[gridType]}px; height: {CURRENT_GRID_DIMENSIONS.heights[gridType]}px;">
    <div class="img" class:logo-background={gridType === GridTypes.LOGO} class:icon-background={gridType === GridTypes.ICON} style="max-height: {CURRENT_GRID_DIMENSIONS.heights[gridType]}px;">
      <Lazy height="{CURRENT_GRID_DIMENSIONS.heights[gridType]}px" fadeOption={IMAGE_FADE_OPTIONS}>
        <img src="{src}" alt="{gridType} image for {gameTitle}." style="max-width: {CURRENT_GRID_DIMENSIONS.widths[gridType]}px; max-height: {CURRENT_GRID_DIMENSIONS.heights[gridType]}px; width: auto; height: auto;" />
      </Lazy>
    </div>
  </div>
</div>

<style>
  .label {
    padding-left: 10px;
    font-size: 18px;
  }

  .img-cont {
    margin: 3px 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .img-cont > .img {
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .logo-background {
    border-radius: 8px;
    background-color: #a3a3a3;
    background-image: linear-gradient(140deg, #adadad 0%, #727272 50%, #535353 75%);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>