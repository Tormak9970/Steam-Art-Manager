<script lang="ts">
  import { steamKey, steamGridDBKey, needsSteamKey, needsSGDBAPIKey, activeUserId, steamInstallPath } from "../../../stores/AppState";
  import { LogController } from "../../../lib/controllers/LogController";
  import { ToastController } from "../../../lib/controllers/ToastController";
  import { SettingsManager } from "../../../lib/utils/SettingsManager";
  import Button from "../../interactables/Button.svelte";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import SettingsEntry from "./SettingsEntry.svelte";
  import SettingsFilePathEntry from "./SettingsFilePathEntry.svelte";
  import { showSettingsModal } from "../../../stores/Modals";
  import Spacer from "../../layout/Spacer.svelte";

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
    
    LogController.log("Reverted settings.");
    
    canSave = false;

    onClose();
  }

  /**
   * Function to run on grid key input change.
   * @param e The associated event.
   */
  function onGridKeyChange(e:Event): void {
    const target = e.currentTarget as HTMLInputElement;
    const value = target.value;

    if (value !== "") {
      steamGridKey = value;
      canSave = true;
    }
  }

  /**
   * Function to run on steam key input change.
   * @param e The associated event.
   */
  function onSteamKeyChange(e:Event): void {
    const target = e.currentTarget as HTMLInputElement;
    const value = target.value;

    if (value !== "") {
      steamAPIKey = value;
      canSave = true;
    }
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

<ModalBody title={"Settings"} onClose={onClose}>
  <div class="content">
    <Spacer orientation="VERTICAL" />
    <Spacer orientation="VERTICAL" />
    <SettingsFilePathEntry
      label="Steam Install Path"
      description={"The root of your Steam installation. The default on Windows is <b>C:/Program Files (x86)/Steam</b> and <b>~/.steam/Steam</b> on Linux. You must restart after changing this."}
      value={steamInstallLocation}
      onChange={onInstallLocationChange}
      required
    />
    <Spacer orientation="VERTICAL" />
    <Spacer orientation="VERTICAL" />
    <SettingsEntry
      label="SteamGrid Api Key"
      description={"Needed to load art from SteamGridDB.com. To create one, go to <a href=\"https://www.steamgriddb.com\">Steamgrid</a>, sign in and go to preferences, then API."}
      value={steamGridKey}
      onChange={onGridKeyChange}
      required
    />
    <Spacer orientation="VERTICAL" />
    <Spacer orientation="VERTICAL" />
    <SettingsEntry
      label="Steam Api key"
      description={"Used to load your games using Steam's web API (It's much faster). To create one, go to Steam's <a href=\"https://steamcommunity.com/dev/apikey\">key registration</a> page, sign in and create an api key."}
      notes={"Recommended for large libraries. It does <b>NOT</b> matter what domain you put in, It just needs to be a valid url. When in doubt do \"http://YOUR_STEAM_USERNAME.com\"."}
      value={steamAPIKey}
      onChange={onSteamKeyChange}
    />

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
    margin-bottom: 7px;
    width: calc(100% - 14px);
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
