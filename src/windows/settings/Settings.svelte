<script lang="ts">
  import { open } from "@tauri-apps/api/shell"
  import { onDestroy, onMount } from "svelte";
  import { activeUserId, needsSGDBAPIKey, needsSteamKey, steamGridDBKey, steamKey, theme } from "../../Stores";
	import Titlebar from "../../components/Titlebar.svelte";
  import Button from "../../components/interactables/Button.svelte";
  import HorizontalSpacer from "../../components/spacers/HorizontalSpacer.svelte";
  import TextInput from "../../components/interactables/TextInput.svelte";
  import VerticalSpacer from "../../components/spacers/VerticalSpacer.svelte";
  import { LogController } from "../../lib/controllers/LogController";
  import { SettingsManager } from "../../lib/utils/SettingsManager";
  import { WindowController } from "../../lib/controllers/WindowController";
  import type { Unsubscriber } from "svelte/store";

  let settingsFocusUnsub: any;
  let themeUnsub: Unsubscriber;

  let canSave = false;
  let isFocused = false;

  let steamGridKey = "";
  let steamAPIKey = "";

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

  onMount(async () => {
    steamGridKey = $steamGridDBKey;
    steamAPIKey = $steamKey;

    settingsFocusUnsub = await WindowController.settingsWindow.onFocusChanged(({ payload: focused }) => {
      isFocused = focused;
    });
    themeUnsub = theme.subscribe((theme) => {
      document.documentElement.setAttribute("data-theme", theme == 0 ? "dark" : "light");
    });

    await SettingsManager.setSettingsPath();
  });

  onDestroy(() => {
    if (settingsFocusUnsub) settingsFocusUnsub();
    if (themeUnsub) themeUnsub();
  });
</script>

<div id="settings" class:dim={!isFocused}>
	<Titlebar title="Settings" />
	<div class="content">
    <VerticalSpacer />
    <VerticalSpacer />
    <div class="setting">
      <TextInput label="SteamGrid Api key" value={steamGridKey} onChange={onGridKeyChange} width="{220}" />
      <!-- svelte-ignore a11y-invalid-attribute -->
      <div class="description">
        <b>Usage:</b> Needed to load art from SteamGridDB.com.<br/>
        <VerticalSpacer />
        <b>Required:</b> Yes<br/>
        <VerticalSpacer />
        <b>Instructions:</b> To create one, go to <a href="" on:click={() => open("https://www.steamgriddb.com")}>Steamgrid</a>, sign in and go to preferences, then API.
      </div>
    </div>
    <VerticalSpacer />
    <VerticalSpacer />
    <div class="setting">
      <TextInput label="Steam Api key" value={steamAPIKey} onChange={onSteamKeyChange} width="{220}" />
      <!-- svelte-ignore a11y-invalid-attribute -->
      <div class="description">
        <b>Usage:</b> Used to load your games using Steam's web API (It's much faster).<br/>
        <VerticalSpacer />
        <b>Required:</b> No, but recommended if you have a large library.<br/>
        <VerticalSpacer />
        <b>Instructions:</b> To create one, go to Steam's <a href="" on:click={() => open("https://steamcommunity.com/dev/apikey")}>key registration</a> page, sign in and create an api key.<br/>
        <VerticalSpacer />
        <b>Important:</b> It does <b>NOT</b> matter what domain you put in, It just needs to be a valid url. When in doubt do "http://YOUR_STEAM_USERNAME.com"
      </div>
    </div>
	</div>
  <div class="footer">
    <div class="info">
      <div style="margin-left: 8px; text-align: center;">© Travis Lane {new Date().getFullYear()}</div>
    </div>
    <div class="btns">
      {#if canSave}
        <Button label="Save" onClick={saveSettings} highlight={true} width="auto" height="20px" />
        <HorizontalSpacer />
        <Button label="Cancel" onClick={cancel} width="auto" height="20px" />
        <HorizontalSpacer />
      {/if}
    </div>
  </div>
</div>

<style>
	@import "/theme.css";

	#settings {
		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;

		color: var(--font-color);

    transition: opacity 0.1s ease-in-out;
	}

	.content {
		width: 100%;
		height: calc(100% - 60px);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}

  .setting {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 0px 14px;
  }

  .description {
    line-height: 18px;
    font-size: 14px;
    margin: 7px 0px;
  }

  .footer {
    height: 30px;
    width: 100%;

    background: var(--foreground-light);
    user-select: none;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
  }
  .info {
    display: flex;
    align-items: center;
    font-size: 10px;
    opacity: 0.5;
    margin-bottom: 3px;
  }
  .btns {
    height: 22px;
    display: flex;
    padding-right: 7px;
  }

  .dim {
    opacity: 0.8;
  }
</style>