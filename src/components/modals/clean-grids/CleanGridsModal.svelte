<script lang="ts">
  import { AppController } from "../../../lib/controllers/AppController";
  import { showCleanGridsModal } from "../../../stores/Modals";
  import Button from "../../interactables/Button.svelte";
  import DropDown from "../../interactables/DropDown.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import GameFilter from "../modal-utils/game-filter/GameFilter.svelte";

  function onClose() {
    $showCleanGridsModal = false;
  }

  let presets = [
    { label: "Clean", data: "clean" },
    { label: "Custom", data: "custom" },
  ];
  
  let selectedPreset: "clean" | "custom" = "clean";

  let selectedGameIds: string[] = [];

  function cleanGrids() {
    AppController.cleanDeadGrids(selectedPreset, selectedGameIds);
    onClose();
  }

  function cancel() {
    onClose();
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalBody title={"Clean Grids"} onClose={onClose}>
  <div class="content">
    <VerticalSpacer />
    <div class="description">
      Here you can tidy up your custom artwork.<br/>
      <ul>
        <li><b>Clean</b>: Deletes grids for games that don't exist (ex: demos, deleted non steam games, etc)</li>
        <li><b>Custom</b>: Allows you to customize which games you want to delete the grids for.</li>
      </ul>
    </div>
    <VerticalSpacer />
    <VerticalSpacer />
    <div class="options">
      <DropDown label={"Preset"} options={presets} bind:value={selectedPreset} width="100px" showTooltip={false} />
    </div>
    <VerticalSpacer />
    <VerticalSpacer />
    <div class="view">
      {#if selectedPreset == "custom"}
        <GameFilter bind:selectedGameIds={selectedGameIds} showFilters={false}/>
      {/if}
    </div>
    <div class="buttons">
      <Button label="Clean" onClick={cleanGrids} width="47.5%" />
      <Button label="Cancel" onClick={cancel} width="47.5%" />
    </div>
  </div>
</ModalBody>

<style>
  .content {
    width: 600px;
		height: calc(100% - 60px);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}

  .description {
    width: calc(100% - 14px);
    font-size: 14px;
  }

  .description ul {
    margin: 0px;
    padding-left: 20px;
    font-size: 13px;
  }

  .description li {
    margin-top: 4px;
  }

  .options {
    width: calc(100% - 14px);
  }

  .view {
    width: 100%;
  }

  .buttons {
    margin-top: 14px;
    margin-bottom: 7px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
