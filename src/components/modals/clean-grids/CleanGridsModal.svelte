<script lang="ts">
  import { AppController } from "@controllers";
  import { Button, DropDown } from "@interactables";
  import { manualSteamGames, nonSteamGames, selectedCleanGridsPreset, steamGames } from "../../../stores/AppState";
  import { showCleanGridsModal } from "../../../stores/Modals";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import GameFilter from "../modal-utils/game-filter/GameFilter.svelte";

  $: allSteamGames = [ ...$steamGames, ...$manualSteamGames ];

  let open = true;
  let presets = [
    { label: "Clean", data: "clean" },
    { label: "Custom", data: "custom" },
  ];

  let selectedGameIds: string[] = [];

  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showCleanGridsModal = false;
  }

  /**
   * Cleans out the undesired grids.
   */
  function cleanGrids(): void {
    AppController.cleanDeadGrids($selectedCleanGridsPreset, selectedGameIds);
    onClose();
  }

  /**
   * The function to run when the process is canceled.
   */
  function cancel(): void {
    onClose();
  }
</script>

<ModalBody title={"Clean Grids"} open={open} on:close={() => open = false} on:closeEnd={onClose}>
  <div class="content">
    <div class="description">
      Here you can tidy up your custom artwork.<br/>
      <ul>
        <li><b>Clean</b>: Deletes grids for games that don't exist (ex: demos, deleted non steam games, etc)</li>
        <li><b>Custom</b>: Allows you to customize which games you want to delete the grids for.</li>
      </ul>
    </div>
    <div class="options">
      <DropDown label={"Preset"} options={presets} bind:value={$selectedCleanGridsPreset} width="100px" showTooltip={false} />
    </div>
    <div class="view">
      {#if $selectedCleanGridsPreset === "custom"}
        <GameFilter steamGames={allSteamGames} nonSteamGames={$nonSteamGames} bind:selectedGameIds={selectedGameIds} showFilters={false}/>
      {/if}
    </div>
  </div>
  <span slot="buttons" class="buttons">
    <Button on:click={cancel} width="48.5%">Cancel</Button>
    <Button on:click={cleanGrids} width="48.5%">Clean</Button>
  </span>
</ModalBody>

<style>
  .content {
    width: 600px;
		height: calc(100% - 60px);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;

    gap: 7px;
	}

  .description {
    width: 100%;
    font-size: 14px;
    margin-top: 7px;
  }

  .description ul {
    margin: 0px;
    padding-left: 20px;
    font-size: 13px;
  }

  .description li {
    margin-top: 0.25rem;
  }

  .options {
    width: 100%;
  }

  .view {
    width: 100%;
  }

  .buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }
</style>
