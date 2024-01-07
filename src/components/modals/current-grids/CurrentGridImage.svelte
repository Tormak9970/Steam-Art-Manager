<script lang="ts">
  import Lazy from "svelte-lazy";
  import { GridTypes } from "../../../stores/AppState";
  
  export let gameTitle: string;
  export let gridType: GridTypes;
  export let src: string;

  const widths = {
    "Capsule": 200,
    "Wide Capsule": 460,
    "Hero": 680,
    "Logo": 460,
    "Icon": 32,
  };

  const heights = {
    "Capsule": 300,
    "Wide Capsule": 215,
    "Hero": 220,
    "Logo": 122,
    "Icon": 32,
  };
</script>

<div class="grid-image">
  <div class="label">{gridType}</div>
  <div class="img-cont" style="width: {widths[gridType]}px; height: {heights[gridType]}px;">
    <div class="img" class:logo-background={gridType === GridTypes.LOGO} class:icon-background={gridType === GridTypes.ICON} style="max-height: {heights[gridType]}px;">
      <Lazy height="{heights[gridType]}px" fadeOption={{ delay: 500, duration: 1000 }}>
        <img src="{src}" alt="{gridType} image for {gameTitle}." style="max-width: {widths[gridType]}px; max-height: {heights[gridType]}px; width: auto; height: auto;" />
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
    /* background-color: #a3a3a3;
    background-image: linear-gradient(140deg, #adadad 0%, #727272 50%, #535353 75%);
    padding: 5px; */
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* .icon-background {
    border-radius: 8px;
    background-color: #a3a3a3;
    background-image: linear-gradient(140deg, #adadad 0%, #727272 50%, #535353 75%);
    padding: 5px;
    height: 64px;
    width: 64px;
  } */
</style>