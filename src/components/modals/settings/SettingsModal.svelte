<script lang="ts">
  import { steamKey, steamGridDBKey, needsSteamKey, needsSGDBAPIKey, activeUserId, steamInstallPath, debugMode } from "../../../stores/AppState";
  import { LogController } from "../../../lib/controllers/LogController";
  import { ToastController } from "../../../lib/controllers/ToastController";
  import { SettingsManager } from "../../../lib/utils/SettingsManager";
  import Button from "../../interactables/Button.svelte";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import TextFieldEntry from "./TextFieldEntry.svelte";
  import FilePathEntry from "./FilePathEntry.svelte";
  import { showSettingsModal } from "../../../stores/Modals";
  import Spacer from "../../layout/Spacer.svelte";
  import { validateSteamPath, validateSGDBAPIKey, validateSteamAPIKey } from "../../../lib/utils/Utils";
  import ToggleFieldEntry from "./ToggleFieldEntry.svelte";


  /**
   * The function to run when the modal closes.
   */
  function onClose() {
    $showSettingsModal = false;
  }

  let canSave = false;

  let steamGridKey = $steamGridDBKey;
  let steamAPIKey = $steamKey;
  let steamInstallLocation = $steamInstallPath;
  let debugModeSetting = $debugMode;

  /**
   * Saves the changed settings.
   */
	async function saveSettings(): Promise<void> {
    LogController.log("Saving settings...");
    
    $steamGridDBKey = steamGridKey !== "" ? steamGridKey : $steamGridDBKey;
    if ($steamGridDBKey !== "" && $needsSGDBAPIKey) $needsSGDBAPIKey = false;

    await SettingsManager.updateSetting("steamGridDbApiKey", steamGridKey);
    

    $steamKey = steamAPIKey !== "" ? steamAPIKey : $steamKey;
    if ($steamKey !== "" && $needsSteamKey) $needsSteamKey = false;

    const steamApiKeyMapSetting = SettingsManager.getSetting<Record<string, string>>("steamApiKeyMap");
    steamApiKeyMapSetting[$activeUserId] = steamAPIKey;
    await SettingsManager.updateSetting("steamApiKeyMap", steamApiKeyMapSetting);

    
    if (steamInstallLocation !== "") $steamInstallPath = steamInstallLocation;

    if (debugModeSetting !== $debugMode) $debugMode = debugModeSetting;

    LogController.log("Saved settings.");
    ToastController.showSuccessToast("Settings saved!");
    canSave = false;

    onClose();
  }

  /**
   * Discards the changed settings.
   */
  function cancel(): void {
    LogController.log("Reverting settings...");

    steamGridKey = $steamGridDBKey;
    steamAPIKey = $steamKey;
    steamInstallLocation = $steamInstallPath;
    debugModeSetting = $debugMode;
    
    LogController.log("Reverted settings.");
    
    canSave = false;

    onClose();
  }

  /**
   * Function to run on grid key input change.
   * @param value The updated value.
   * @param isValid Whether the new value is valid.
   */
  function onGridKeyChange(value: string, isValid: boolean): void {
    if (value !== "" && isValid) {
      steamGridKey = value;
      canSave = true;
    } else {
      canSave = false;
    }
  }

  /**
   * Function to run on steam key input change.
   * @param value The updated value.
   * @param isValid Whether the new value is valid.
   */
  function onSteamKeyChange(value: string, isValid: boolean): void {
    if (value !== "" && isValid) {
      steamAPIKey = value;
      canSave = true;
    } else {
      canSave = false;
    }
  }

/**
 * Function to run on debug mode change.
 * @param value The updated value.
 */
function onDebugModeChange(value: boolean): void {
  debugModeSetting = value;
  canSave = true;
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

<ModalBody title={"Settings"} onClose={onClose}>
  <div class="content">
    <Spacer orientation="VERTICAL" />
    <Spacer orientation="VERTICAL" />
    <div class="settings-container">
      <FilePathEntry
        label="Steam Install Path"
        description={"The root of your Steam installation. The default on Windows is <b>C:/Program Files (x86)/Steam</b> and <b>~/.steam/Steam</b> on Linux. You must restart after changing this."}
        value={steamInstallLocation}
        onChange={onInstallLocationChange}
        useValidator={true}
        validPathMessage={"Path is a valid Steam install"}
        validator={validateSteamPath}
        required
      />
      <Spacer orientation="VERTICAL" />
      <Spacer orientation="VERTICAL" />
      <TextFieldEntry
        label="SteamGrid Api Key"
        description={"Needed to load art from SteamGridDB.com. To create one, go to <a href=\"https://www.steamgriddb.com\">Steamgrid</a>, sign in and go to preferences, then API."}
        value={steamGridKey}
        onChange={onGridKeyChange}
        useValidator={true}
        validator={validateSGDBAPIKey}
        required
      />
      <Spacer orientation="VERTICAL" />
      <Spacer orientation="VERTICAL" />
      <TextFieldEntry
        label="Steam Api key"
        description={"Used to load your games using Steam's web API (It's much faster). To create one, go to Steam's <a href=\"https://steamcommunity.com/dev/apikey\">key registration</a> page, sign in and create an api key."}
        notes={"Recommended for large libraries. It does <b>NOT</b> matter what domain you put in, It just needs to be a valid url. When in doubt do \"http://YOUR_STEAM_USERNAME.com\"."}
        value={steamAPIKey}
        onChange={onSteamKeyChange}
        useValidator={true}
        validator={validateSteamAPIKey}
      />
      <Spacer orientation="VERTICAL" />
      <Spacer orientation="VERTICAL" />
      <ToggleFieldEntry
        label="Debug Mode"
        description={"Enables the inspect element window and automatically opens it on launch."}
        value={debugModeSetting}
        onChange={onDebugModeChange}
      />
    </div>

    <div class="buttons">
      <Button label="Save Changes" onClick={saveSettings} width="47.5%" disabled={!canSave} />
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

  .buttons {
    margin-top: 14px;
    margin-bottom: 10px;
    width: calc(100% - 14px);
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
