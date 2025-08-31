<script lang="ts">
  import { AppController, DialogController, LogController, SettingsController } from "@controllers";
  import { isOverflowing } from "@directives";
  import { Folder } from "@icons";
  import { Button, IconButton } from "@interactables";
  import { activeUserId, cacheSelectedGrids, debugMode, loadingGames, needsSGDBAPIKey, needsSteamKey, showInfoSnackbar, steamGridDBKey, steamInstallPath, steamKey, steamUsers } from "@stores/AppState";
  import { showSettingsModal } from "@stores/Modals";
  import { appLogDir } from "@tauri-apps/api/path";
  import * as shell from "@tauri-apps/plugin-shell";
  import { validateSteamPath } from "@utils";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import DropdownEntry from "./DropdownEntry.svelte";
  import FilePathEntry from "./FilePathEntry.svelte";
  import TextFieldEntry from "./TextFieldEntry.svelte";
  import ToggleFieldEntry from "./ToggleFieldEntry.svelte";
  
	let activeUserIdUnsub: Unsubscriber;
	let usersUnsub: Unsubscriber;

  let open = true;
  let overflowing = false;
  let steamApiKeyChanged = false;

  /**
   * The function to run when the modal closes.
   */
  function onClose() {
    $showSettingsModal = false;

    if (steamApiKeyChanged) {
      DialogController.ask(
        "Steam API Key Changed",
        "WARNING",
        "Your Steam API key has been changed, would you like to reload your games?",
        "Yes",
        "No"
      ).then((confirmed: boolean) => {
        if (confirmed) {
          $loadingGames = true;
          AppController.reloadSteamGames();
        }
      })
    }
  }

  let canSave = false;

	let users = Object.values($steamUsers).map((user) => {
		return {
			"label": user.PersonaName,
			"data": user.id32
		}
	});
	let selectedUserId = $activeUserId.toString();
  
  let steamGridKey = $steamGridDBKey;
  let steamAPIKey = $steamKey;
  let steamInstallLocation = $steamInstallPath;
  let debugModeSetting = $debugMode;
  let cacheSelectedGridsSetting = $cacheSelectedGrids;

  /**
   * Saves the changed settings.
   */
	async function saveSettings(): Promise<void> {
    LogController.log("Saving settings...");
    
    $steamGridDBKey = steamGridKey !== "" ? steamGridKey : $steamGridDBKey;
    if ($steamGridDBKey !== "" && $needsSGDBAPIKey) $needsSGDBAPIKey = false;

    await SettingsController.set("steamGridDbApiKey", steamGridKey);
    
    if ($steamKey !== steamAPIKey) steamApiKeyChanged = true;

    $steamKey = steamAPIKey;
    $needsSteamKey = $steamKey === "";

    const steamApiKeyMapSetting = SettingsController.get<Record<string, string>>("steamApiKeyMap");
    steamApiKeyMapSetting[$activeUserId] = steamAPIKey;
    await SettingsController.set("steamApiKeyMap", steamApiKeyMapSetting);

    
    if (steamInstallLocation !== "") $steamInstallPath = steamInstallLocation;

    if (debugModeSetting !== $debugMode) $debugMode = debugModeSetting;

    if (selectedUserId !== $activeUserId.toString()) await AppController.changeSteamUser(selectedUserId);

    LogController.log("Saved settings.");
    $showInfoSnackbar({ message: "Settings saved!" });
    canSave = false;

    onClose();
  }

  /**
   * Discards the changed settings.
   */
  function cancel(): void {
    LogController.log("Reverting settings...");

    selectedUserId = $activeUserId.toString();
    steamGridKey = $steamGridDBKey;
    steamAPIKey = $steamKey;
    steamInstallLocation = $steamInstallPath;
    debugModeSetting = $debugMode;
    cacheSelectedGridsSetting = $cacheSelectedGrids
    
    LogController.log("Reverted settings.");
    
    canSave = false;

    open = false;
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
    if (isValid) {
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
   * Function to run on cache selected grids change.
   * @param value The updated value.
   */
  function onCacheSelectedGridsChange(value: boolean): void {
    cacheSelectedGridsSetting = value;
    canSave = true;
  }

  /**
   * Opens the app's log directory.
   */
  async function openLogDirectory() {
    const logDir = await appLogDir();
    shell.open("file://"+ logDir);
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

  onMount(() => {
    activeUserIdUnsub = activeUserId.subscribe((id) => {
			selectedUserId = id.toString();
		});
		usersUnsub = steamUsers.subscribe((sUsers) => {
			users = Object.values(sUsers).map((user) => {
				return {
					"label": user.PersonaName,
					"data": user.id32
				}
			});
			if (!selectedUserId) selectedUserId = $activeUserId.toString();
		});
  });

  onDestroy(() => {
    if (activeUserIdUnsub) activeUserIdUnsub();
    if (usersUnsub) usersUnsub();
  });
</script>

<ModalBody title={"Settings"} open={open} on:close={() => open = false} on:closeEnd={onClose}>
  <div class="content">
    <div class="scroll-container" use:isOverflowing={{ callback: (o) => overflowing = o }}>
      <div class="wrapper" style:width={overflowing ? "calc(100% - 7px)" : "100%"}>
        <FilePathEntry
          label="Steam Install Path"
          description={"The root of your Steam installation. The default on Windows is <b>C:/Program Files (x86)/Steam</b> and <b>/home/deck/.steam/steam</b> on Linux. You must restart after changing this."}
          value={steamInstallLocation}
          onChange={onInstallLocationChange}
          useValidator
          validPathMessage={"Path is a valid Steam install"}
          validator={validateSteamPath}
          required
        />
        <TextFieldEntry
          label="SteamGrid Api Key"
          description={"Needed to load art from SteamGridDB.com. To create one, go to <a href=\"https://www.steamgriddb.com\">Steamgrid</a>, sign in and go to preferences, then API."}
          value={steamGridKey}
          onChange={onGridKeyChange}
          required
        />
        <TextFieldEntry
          label="Steam Api key"
          description={"Used to load your games using Steam's web API (It's much faster). To create one, go to Steam's <a href=\"https://steamcommunity.com/dev/apikey\">key registration</a> page, sign in and create an api key."}
          notes={"Recommended for large libraries. It does <b>NOT</b> matter what domain you put in, It just needs to be a valid url. When in doubt do \"http://YOUR_STEAM_USERNAME.com\"."}
          value={steamAPIKey}
          canBeEmpty
          onChange={onSteamKeyChange}
        />
        <ToggleFieldEntry
          label="Cache Selected Grids"
          description={"Enables saving previously selected grids."}
          value={cacheSelectedGridsSetting}
          onChange={onCacheSelectedGridsChange}
        >
          <Button on:click={AppController.clearCachedGrids}>Clear Cache</Button>
        </ToggleFieldEntry>
        <DropdownEntry
          label="Steam User"
          description="Determines which Steam account to edit grids for."
          options={(users && users.length > 0) ? users : [ { label: "Loading...", data: "placeholder" } ]}
          value={(users && users.length > 0) ? selectedUserId : "placeholder"}
          onChange={(id) => {selectedUserId = id; canSave = true;}}
        />
        <ToggleFieldEntry
          label="Debug Mode"
          description={"Enables the inspect element window and automatically opens it on launch."}
          value={debugModeSetting}
          onChange={onDebugModeChange}
        />
      </div>
    </div>
  </div>

  <span slot="buttons" class="buttons">
    <Button on:click={cancel} width="46.5%">Cancel</Button>
    <Button on:click={saveSettings} width="46.5%" disabled={!canSave}>Save Changes</Button>
    <IconButton label="Open log directory" on:click={openLogDirectory}>
      <Folder style="height: 14px; width: 14px;" />
    </IconButton>
  </span>
</ModalBody>

<style>
  .content {
		width: 600px;
    padding-top: 14px;
    
		max-height: 73vh;
	}

  .scroll-container {
    max-height: calc(73vh - 14px);
    width: 100%;

    overflow-y: scroll;
  }
  
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }
</style>
