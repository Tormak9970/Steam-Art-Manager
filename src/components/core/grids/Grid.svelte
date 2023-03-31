<script lang="ts">
  import Lazy from "svelte-lazy";
  
  import type { SGDBImage } from "../../../lib/models/SGDB";

  import { gridType } from "../../../Stores";

  export let grid: SGDBImage;
  export let widths: any;
  export let heights: any;

  function selectGame() {
    
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="grid" on:click={selectGame}>
  <div class="img" style="height: {heights[$gridType]}px;">
    <Lazy height="{heights[$gridType]}px" fadeOption={{delay: 500, duration: 1000}}>
      <img src="{grid.url.toString()}" alt="{grid.author}'s {$gridType} image" style="max-width: {widths[$gridType]}px; max-height: {heights[$gridType]}px; width: auto; height: auto;" />
    </Lazy>
  </div>
  <div class="name">{grid.author}</div>
</div>

<style>
  @import "/theme.css";

  .grid {
    background-color: var(--foreground);
    padding: 10px;
    padding-bottom: 5px;
    border-radius: 4px;

    font-size: 14px;

    display: flex;
    flex-direction: column;
    align-items: center;

    position: relative;
    
    cursor: pointer;

    user-select: none;

    transition: transform 0.2s ease-in-out;
  }
  .grid:hover {
    background-color: var(--foreground-hover);
    transform: scale(1.1);
  }

  .img {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .name {
    width: 100%;
    height: 23px;
    line-height: 23px;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    
    text-align: center;
  }
</style>