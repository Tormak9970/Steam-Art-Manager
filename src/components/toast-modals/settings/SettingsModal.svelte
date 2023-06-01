<script lang="ts">
  import { steamKey, steamGridDBKey, needsSteamKey, needsSGDBAPIKey, activeUserId } from "../../../Stores";
  import { LogController } from "../../../lib/controllers/LogController";
  import { ToastController } from "../../../lib/controllers/ToastController";
  import { SettingsManager } from "../../../lib/utils/SettingsManager";
  import Button from "../../interactables/Button.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
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

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="background" on:click={onClose}>
  <div class="modal-body" on:click|stopPropagation>
    <div class="close-btn" on:click={onClose}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
      </svg>
    </div>
    <div class="header">Settings</div>
    <div class="border" />
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
  </div>
</div>

<style>
  @import "/theme.css";

  .background {
    font-size: 12px;
    z-index: 3;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.6);
    width: 100%;
    height: calc(100% - 30px);
    display: flex;
  }

  .border {
    margin-top: 7px;
    border-bottom: 1px solid var(--foreground);
  }

  .close-btn {
    position: absolute;
    height: 20px;
    width: 20px;
    fill: var(--font-color);

    top: 2px;
    right: 2px;

    background-color: var(--background);
    padding: 3px;
    border-radius: 2px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .close-btn:hover {
    cursor: pointer;
    background-color: var(--background-hover);
  }

  .modal-body {
    margin: auto;
    background-color: var(--background);
    border-radius: 2px;
    border: 1px solid var(--shadow);
    position: relative;
  }

  .header {
    text-align: center;
    font-size: 20px;
    margin-top: 4px;
  }

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
