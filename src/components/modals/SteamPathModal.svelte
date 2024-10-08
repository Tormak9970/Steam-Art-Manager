<script lang="ts">
  import { LogController, ToastController } from "@controllers";
  import { Button } from "@interactables";
  import { steamInstallPath } from "@stores/AppState";
  import { steamPathModalClose } from "@stores/Modals";
  import { validateSteamPath } from "@utils";
  import ModalBody from "./modal-utils/ModalBody.svelte";
  import FilePathEntry from "./settings/FilePathEntry.svelte";

  let open = true;
  let canSave = false;

  let steamInstallLocation = $steamInstallPath;

  /**
   * Saves the selected install location.
   */
	async function saveInstallLocation(): Promise<void> {
    LogController.log("Setting Steam Install Location...");
    
    $steamInstallPath = steamInstallLocation;

    LogController.log("Steam Install Location set.");

    canSave = false;

    ToastController.showSuccessToast("Steam Install Location saved!");

    await $steamPathModalClose();
  }

  /**
   * Function to run on steam install location change.
   * @param path The updated installation path.
   * @param isValid Whether the new value is valid.
   */
  function onInstallLocationChange(path: string, isValid: boolean): void {
    if (isValid) {
      steamInstallLocation = path;
      canSave = true;
    } else {
      canSave = false;
    }
  }
</script>

<ModalBody title={"Choose Your Steam Install Path"} open={open} on:close={() => open = false} canClose={false}>
  <div class="content">
    <FilePathEntry
      label="Steam Install Path"
      description={"The root of your Steam installation. The default on Windows is <b>C:/Program Files (x86)/Steam</b> and <b>~/.steam/Steam</b> on Linux."}
      value={steamInstallLocation}
      onChange={onInstallLocationChange}
      useValidator={true}
      validPathMessage={"Path is a valid Steam install"}
      validator={validateSteamPath}
      required
    />
  </div>

  <span slot="buttons" class="buttons">
    <Button label="Save Changes" on:click={saveInstallLocation} width="100%" disabled={!canSave} />
  </span>
</ModalBody>

<style>
  .content {
		width: 600px;
		height: calc(100% - 60px);
    padding-top: 14px;

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}

  .buttons {
    width: 100%;
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
