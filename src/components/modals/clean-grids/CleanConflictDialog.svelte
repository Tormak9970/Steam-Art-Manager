<script lang="ts">
  import { LogController, ToastController } from "@controllers";
  import { Button } from "@interactables";
  import * as fs from "@tauri-apps/plugin-fs";
  import { onMount } from "svelte";
  import { cleanConflicts, showCleanConflictDialog } from "../../../stores/Modals";
  import ModalBody from "../modal-utils/ModalBody.svelte";
    
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { type CleanConflict } from "@types";
  import { CLEAN_CONFLICT_GRID_DIMENSIONS, IMAGE_FADE_OPTIONS } from "@utils";
  import Lazy from "svelte-lazy";

  let conflictNumber: number = 1;
  let conflict: CleanConflict | null;
  $: conflictGridType = conflict ? conflict.gridType : "";
  $: fileAPath = conflict ? convertFileSrc(conflict.fileAPath) : "";
  $: fileBPath = conflict ? convertFileSrc(conflict.fileBPath) : "";

  /**
   * Get the next grid conflict.
   */
  function getNextConflict(): CleanConflict | null {
    conflictNumber++;
    return $cleanConflicts.length > 0 ? $cleanConflicts.shift()! : null;
  }

  /**
   * Removes one of the two conflicting files.
   * @param keepChoiceA If true, keep choice A, if false, keep choice B.
   */
  async function deleteGrid(keepChoiceA: boolean): Promise<void> {
    await fs.remove(keepChoiceA ? conflict!.fileBPath : conflict!.fileAPath);

    LogController.log(`Appid: ${conflict!.appid}. Keeping ${keepChoiceA ? conflict!.fileAName : conflict!.fileBName} and deleting ${keepChoiceA ? conflict!.fileBName : conflict!.fileAName}.`);
    
    conflict = getNextConflict();

    if (!conflict) {
      $showCleanConflictDialog = false;
      $cleanConflicts = [];
      ToastController.showSuccessToast("Finished cleaning!");
      LogController.log("Finished cleaning!");
    }
  }

  /**
   * Function to call when the user wants to keep both grids.
   */
  function keepBoth(): void {
    LogController.log(`Appid: ${conflict!.appid}. Keeping both ${conflict!.fileAName} and ${conflict!.fileBName}.`);

    conflict = getNextConflict();

    if (!conflict) {
      $showCleanConflictDialog = false;
      $cleanConflicts = [];
      ToastController.showSuccessToast("Finished cleaning!");
      LogController.log("Finished cleaning!");
    }
  }

  onMount(() => {
    conflict = getNextConflict();
    conflictGridType = conflict!.gridType;
    fileAPath = convertFileSrc(conflict!.fileAPath);
    fileBPath = convertFileSrc(conflict!.fileBPath);
  });
</script>

<ModalBody title={`Clean Conflict Dialog #${conflictNumber}`} canClose={false}>
  <div class="content">
    <div class="description">
      Choose which grid you would like to keep.
    </div>
    <div class="images {conflictGridType}">
      <div class="split">
        <div class="img-cont">
          <div class="img" class:logo-background={conflictGridType === "logo"} class:icon-background={conflictGridType === "icon"} style="max-height: {CLEAN_CONFLICT_GRID_DIMENSIONS.heights[conflictGridType]}px;">
            <Lazy height="{CLEAN_CONFLICT_GRID_DIMENSIONS.heights[conflictGridType]}px" fadeOption={IMAGE_FADE_OPTIONS}>
              <img src="{fileAPath}" alt="Option 1" style="max-width: {CLEAN_CONFLICT_GRID_DIMENSIONS.widths[conflictGridType]}px; max-height: {CLEAN_CONFLICT_GRID_DIMENSIONS.heights[conflictGridType]}px; width: auto; height: auto;" />
            </Lazy>
          </div>
        </div>
        <div class="filename">{conflict?.fileAName}</div>
      </div>
      <div class="split">
        <div class="img-cont">
          <div class="img" class:logo-background={conflictGridType === "logo"} class:icon-background={conflictGridType === "icon"} style="max-height: {CLEAN_CONFLICT_GRID_DIMENSIONS.heights[conflictGridType]}px;">
            <Lazy height="{CLEAN_CONFLICT_GRID_DIMENSIONS.heights[conflictGridType]}px" fadeOption={IMAGE_FADE_OPTIONS}>
              <img src="{fileBPath}" alt="Option 2" style="max-width: {CLEAN_CONFLICT_GRID_DIMENSIONS.widths[conflictGridType]}px; max-height: {CLEAN_CONFLICT_GRID_DIMENSIONS.heights[conflictGridType]}px; width: auto; height: auto;" />
            </Lazy>
          </div>
        </div>
        <div class="filename">{conflict?.fileBName}</div>
      </div>
    </div>
    <div class="buttons">
      <Button label={`Keep ${conflictGridType === "hero" ? "Top" : "Left"}`} onClick={() => { deleteGrid(true); }} width="30%" />
      <Button label={`Keep ${conflictGridType === "hero" ? "Bottom" : "Right"}`} onClick={() => { deleteGrid(false); }} width="30%" />
      <Button label="Keep Both" onClick={keepBoth} width="30%" />
    </div>
  </div>
</ModalBody>

<style>
  /* done */
  .content {
    width: 600px;
		height: calc(100% - 60px);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}

  /* done */
  .description {
    width: calc(100% - 14px);
    font-size: 14px;
    margin-top: 7px;
    margin-bottom: 7px;
  }

  .images {
    width: 100%;

    display: flex;

    flex-direction: row;
    justify-content: space-around;
  }

  .images.hero {
    flex-direction: column;
    justify-content: flex-start;
  }

  .split {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .images.hero .split {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .capsule {
    display: flex;
    flex-direction: row;
    height: calc(100% - 38px);
  }

  .icon {
    display: flex;
    flex-direction: row;
    height: calc(100% - 38px);
    max-width: 550px;
  }

  /* done */
  .img-cont { padding: 10px; }

  .img-cont > .img {
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  /* done */
  .buttons {
    margin-top: 14px;
    margin-bottom: 7px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
