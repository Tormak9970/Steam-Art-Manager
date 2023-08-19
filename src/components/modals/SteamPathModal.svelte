<script lang="ts">
  import { steamInstallPath, steamPathModalClose } from "../../Stores";
  import { LogController } from "../../lib/controllers/LogController";
  import { ToastController } from "../../lib/controllers/ToastController";
  import { SettingsManager } from "../../lib/utils/SettingsManager";
  import Button from "../interactables/Button.svelte";
  import VerticalSpacer from "../spacers/VerticalSpacer.svelte";
  import ModalBody from "./modal-utils/ModalBody.svelte";
  import SettingsFilePathEntry from "./settings/SettingsFilePathEntry.svelte";

  let canSave = false;

  let steamInstallLocation = $steamInstallPath;

	async function saveInstallLocation() {
    LogController.log("Setting Steam Install Location...");
    
    $steamInstallPath = steamInstallLocation;
    await SettingsManager.updateSetting("steamInstallPath", steamInstallLocation);

    LogController.log("Steam Install Location set.");

    canSave = false;

    ToastController.showSuccessToast("Steam Install Location saved!");

    await $steamPathModalClose();
  }

  /**
   * Function to run on steam install location change.
   * @param path The updated installation path.
   */
  function onInstallLocationChange(path: string): void {
    steamInstallLocation = path;
    canSave = true;
  }
</script>

<ModalBody title={"Choose Your Steam Install Path"} canClose={false}>
  <div class="content">
    <VerticalSpacer />
    <VerticalSpacer />
    <SettingsFilePathEntry
      label="Steam Install Path"
      description={`The root of your Steam installation. The default on Windows is <b>C:/Program Files (x86)/Steam</b> and <b>~/.steam/Steam</b> on Linux.`}
      value={steamInstallLocation}
      onChange={onInstallLocationChange}
      required
    />

    <div class="buttons">
      <Button label="Save Changes" onClick={saveInstallLocation} width="100%" disabled={!canSave} />
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

  .buttons {
    margin-top: 14px;
    margin-bottom: 7px;
    width: calc(100% - 14px);
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
