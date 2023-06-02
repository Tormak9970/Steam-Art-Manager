<script lang="ts">
  import { steamKey, steamGridDBKey, needsSteamKey, needsSGDBAPIKey, activeUserId } from "../../../Stores";
  import { LogController } from "../../../lib/controllers/LogController";
  import { ToastController } from "../../../lib/controllers/ToastController";
  import { SettingsManager } from "../../../lib/utils/SettingsManager";
  import Button from "../../interactables/Button.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
    import ModalBody from "../ModalBody.svelte";
  import SettingsEntry from "./SettingsEntry.svelte";

  export let onClose: () => void;

  let canSave = false;

  let steamGridKey = $steamGridDBKey;
  let steamAPIKey = $steamKey;

	async function saveSettings() {
    LogController.log("Saving settings...");
    
    $steamGridDBKey = steamGridKey !== "" ? steamGridKey : $steamGridDBKey;
    if ($steamGridDBKey !== "" && $needsSGDBAPIKey) $needsSGDBAPIKey = false;

    await SettingsManager.updateSetting("steamGridDbApiKey", steamGridKey);
    
    $steamKey = steamAPIKey !== "" ? steamAPIKey : $steamKey;
    if ($steamKey !== "" && $needsSteamKey) $needsSteamKey = false;

    const steamUserKeyMap = (await SettingsManager.getSettings()).steamApiKeyMap;
    steamUserKeyMap[$activeUserId] = steamAPIKey;
    await SettingsManager.updateSetting("steamApiKeyMap", steamUserKeyMap);

    LogController.log("Saved settings.");

    canSave = false;

    ToastController.showSuccessToast("Settings saved!");
  }

  function cancel() {
    LogController.log("Reverting settings...");

    steamGridKey = $steamGridDBKey;
    steamAPIKey = $steamKey;
    
    LogController.log("Reverted settings.");
    
    canSave = false;
  }

  /**
   * Function to run on grid key input change.
   * @param e The associated event.
   */
  function onGridKeyChange(e:Event): void {
    const target = e.currentTarget as HTMLInputElement;
    const value = target.value;

    if (value != "") {
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

    if (value != "") {
      steamAPIKey = value;
      canSave = true;
    }
  }
</script>

<ModalBody title={"Settings"} onClose={onClose}>
  <div class="content">
    <VerticalSpacer />
    <VerticalSpacer />
    <SettingsEntry
      label="SteamGrid Api Key"
      description={`Needed to load art from SteamGridDB.com. To create one, go to <a href="https://www.steamgriddb.com">Steamgrid</a>, sign in and go to preferences, then API.`}
      value={steamGridKey}
      onChange={onGridKeyChange}
      required
    />
    <VerticalSpacer />
    <VerticalSpacer />
    <SettingsEntry
      label="Steam Api key"
      description={`Used to load your games using Steam's web API (It's much faster). To create one, go to Steam's <a href="https://steamcommunity.com/dev/apikey">key registration</a> page, sign in and create an api key.`}
      notes={'Recommended for large libraries. It does <b>NOT</b> matter what domain you put in, It just needs to be a valid url. When in doubt do "http://YOUR_STEAM_USERNAME.com".'}
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
  @import "/theme.css";

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
