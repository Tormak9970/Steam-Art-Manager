<script lang="ts">
  import DropDown from "../../interactables/DropDown.svelte";
  import ModalBody from "../ModalBody.svelte";

  export let onClose: () => void;

  let presets = [
    { label: "Dead Only", data: "dead" },
    { label: "Custom", data: "custom" },
    { label: "All", data: "all" }
  ];
  
  let selectedPreset = "dead";


</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalBody title={"Clean Grids"} onClose={onClose}>
  <div class="content">
    <div class="description">
      Here you can tidy up your custom artwork.<br/>
      <ul>
        <li><b>Clean</b>: deletes grids for games that don't exist (ex: demos, deleted non steam games, etc)</li>
        <li><b>Custom</b>: Allows you to customize which games you want to delete the grids for.</li>
      </ul>
    </div>
    <div class="options">
      <DropDown label={"Preset"} options={presets} bind:value={selectedPreset} width="100px" />
      <!-- TODO: include hidden toggle -->
    </div>
    <div class="view">
  
    </div>
    <div class="buttons">
  
    </div>
  </div>
</ModalBody>

<style>
  @import "/theme.css";

  .content {
    width: 600px;
		height: calc(100% - 60px);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}
</style>
