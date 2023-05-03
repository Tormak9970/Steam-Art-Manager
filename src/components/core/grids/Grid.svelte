<script lang="ts">
  import { AppController } from "../../../lib/controllers/AppController";
  
  import type { SGDBImage } from "../../../lib/models/SGDB";

  import { dowloadingGridId, gridType } from "../../../Stores";
  import LoadingSpinner from "../../info/LoadingSpinner.svelte";
  import GridImage from "../GridImage.svelte";

  export let grid: SGDBImage;

  let imagePath = grid.thumb.toString();

  /**
   * Sets this grid to be the current grid for the selected game.
   */
  function selectGame() {
    AppController.setSteamGridArt(grid.id, grid.url);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="grid" on:click={selectGame}>
  <div class="loading-overlay" class:selected={$dowloadingGridId == grid.id}>
    <LoadingSpinner width="40px" height="40px" />
  </div>
  <div class="image-control show-view" on:click|stopPropagation={() => { AppController.viewSteamGridImage(grid); }} use:AppController.tippy={{ content: "View Grid", placement: "right", onShow: AppController.onTippyShow}}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
      <path d="M344 0H488c13.3 0 24 10.7 24 24V168c0 9.7-5.8 18.5-14.8 22.2s-19.3 1.7-26.2-5.2l-39-39-87 87c-9.4 9.4-24.6 9.4-33.9 0l-32-32c-9.4-9.4-9.4-24.6 0-33.9l87-87L327 41c-6.9-6.9-8.9-17.2-5.2-26.2S334.3 0 344 0zM168 512H24c-13.3 0-24-10.7-24-24V344c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2l39 39 87-87c9.4-9.4 24.6-9.4 33.9 0l32 32c9.4 9.4 9.4 24.6 0 33.9l-87 87 39 39c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8z"/>
    </svg>
  </div>
  {#if grid?.isAnimated}
    <div class="image-control show-animated" use:AppController.tippy={{ content: "Animated", placement: "left", onShow: AppController.onTippyShow}}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM48 368v32c0 8.8 7.2 16 16 16H96c8.8 0 16-7.2 16-16V368c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16zm368-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V368c0-8.8-7.2-16-16-16H416zM48 240v32c0 8.8 7.2 16 16 16H96c8.8 0 16-7.2 16-16V240c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16zm368-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V240c0-8.8-7.2-16-16-16H416zM48 112v32c0 8.8 7.2 16 16 16H96c8.8 0 16-7.2 16-16V112c0-8.8-7.2-16-16-16H64c-8.8 0-16 7.2-16 16zM416 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V112c0-8.8-7.2-16-16-16H416zM160 128v64c0 17.7 14.3 32 32 32H320c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H192c-17.7 0-32 14.3-32 32zm32 160c-17.7 0-32 14.3-32 32v64c0 17.7 14.3 32 32 32H320c17.7 0 32-14.3 32-32V320c0-17.7-14.3-32-32-32H192z"/>
      </svg>
    </div>
  {/if}
  {#if grid?.notes}
    <div class="image-control show-notes" use:AppController.tippy={{ content: "Notes", placement: "right", onShow: AppController.onTippyShow}}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/>
      </svg>
    </div>
  {/if}
  <GridImage imagePath={imagePath} altText="{grid.author.name}'s {$gridType} image" missingMessage="Unable to display grid" isVideo={grid.isAnimated} />
  <div class="author">By {grid.author.name}</div>
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

    transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out;
  }
  .grid:hover {
    background-color: var(--foreground-hover);
  }

  .author {
    width: 100%;
    height: 23px;
    line-height: 23px;

    font-size: 12px;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    
    text-align: center;
  }

  .loading-overlay {
    display: none;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    border-radius: 4px;

    background-color: rgba(0, 0, 0, 0.7);

    justify-content: center;
    align-items: center;
  }

  .selected {
    display: flex;
  }

  .image-control {
    position: absolute;

    border-radius: 50%;

    width: 14px;
    height: 14px;

    padding: 5px;

    left: 2px;

    fill: var(--font-color);

    background-color: var(--background);

    opacity: 0.8;

    display: none;

    z-index: 2;
  }
  .image-control:hover {
    cursor: pointer;
    opacity: 1;
  }

  .show-view { top: 2px; }
  .show-notes { cursor: default; top: 30px; }
  .show-notes:hover { cursor: default; opacity: 0.8; }

  .show-animated {
    background-color: var(--sgdb-animated-color);
    display: flex;
    cursor: default;

    top: 2px;
    left: auto;
    right: 2px;
    
    opacity: 1;
  }
  .show-animated:hover {
    display: flex;
    cursor: default;
  }

  .grid:hover > .image-control { display: flex; }
</style>