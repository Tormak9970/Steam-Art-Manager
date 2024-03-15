/**
 * Steam Art Manager is a tool for setting the artwork of your Steam library.
 * Copyright (C) 2023 Travis Lane (Tormak)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>
 */
import { dialog, process } from "@tauri-apps/api";
import { ToastController } from "./ToastController";
import { SettingsManager } from "../utils/SettingsManager";
import { LogController } from "./LogController";
import { GridTypes, activeUserId, customGameNames, dbFilters, gamesSize, gridType, gridsSize, hiddenGameIds, loadingSettings, manualSteamGames, needsSGDBAPIKey, needsSteamKey, optionsSize, renderGamesInList, selectedCleanGridsPreset, selectedManualGamesAddMethod, showHidden, steamGridDBKey, steamInstallPath, steamKey, steamUsers, theme, type DBFilters } from "../../stores/AppState";
import { RustInterop } from "./RustInterop";

import "tippy.js/dist/tippy.css"
import { exit } from "@tauri-apps/api/process";
import { DialogController } from "./DialogController";
import { findSteamPath } from "../utils/Utils";
import type { Unsubscriber } from "svelte/store";

/**
 * The main controller for the application.
 */
export class SettingsController {
  private oldSteamInstallPath = "";
  private steamInstallPathSub: Unsubscriber;

  private oldHiddenGameIds: number[] = [];
  private hiddenGameIdsSub: Unsubscriber;

  private oldManualSteamGames: GameStruct[] = [];
  private manualSteamGamesSub: Unsubscriber;

  private oldCustomGameNames: Record<string, string>;
  private customGameNamesSub: Unsubscriber;


  private oldTheme = 0;
  private themeSub: Unsubscriber;

  private oldShowHiddenGames = false;
  private showHiddenGamesSub: Unsubscriber;

  private oldDbFilters: DBFilters;
  private dbFiltersSub: Unsubscriber;

  private oldGameViewType = false;
  private gameViewTypeSub: Unsubscriber;

  private oldGridType = GridTypes.CAPSULE;
  private gridTypeSub: Unsubscriber;

  private oldManualGamesAddMethod: ManageManualGamesMethod = "manual";
  private manualGamesAddMethodSub: Unsubscriber;


  private oldCleanGridsPreset: CleanGridsPreset = "clean";
  private cleanGridsPresetSub: Unsubscriber;

  /**
   * Register subscriptions for setting changes.
   */
  async subscribeToSettingChanges() {
    this.steamInstallPathSub = steamInstallPath.subscribe((newPath) => {
      if (newPath !== this.oldSteamInstallPath) {
        SettingsManager.updateSetting("steamInstallPath", newPath);
        this.oldSteamInstallPath = newPath;
      }
    });

    // * See src/components/modals/settings/SettingsModal.svelte for `sgdbApiKey` and `steamApiKeyMap` handling.

    this.hiddenGameIdsSub = hiddenGameIds.subscribe((newIds) => {
      if (JSON.stringify(newIds) !== JSON.stringify(this.oldHiddenGameIds)) {
        SettingsManager.updateSetting("hiddenGameIds", newIds);
        this.oldHiddenGameIds = newIds;
      }
    });

    this.manualSteamGamesSub = manualSteamGames.subscribe((newGames) => {
      if (JSON.stringify(newGames) !== JSON.stringify(this.oldManualSteamGames)) {
        SettingsManager.updateSetting("manualSteamGames", newGames);
        this.oldManualSteamGames = newGames;
      }
    });
    
    this.customGameNamesSub = customGameNames.subscribe((newGameNames) => {
      if (JSON.stringify(newGameNames) !== JSON.stringify(this.oldCustomGameNames)) {
        SettingsManager.updateSetting("customGameNames", newGameNames);
        this.oldCustomGameNames = newGameNames;
      }
    });


    this.themeSub = theme.subscribe((newTheme) => {
      if (newTheme !== this.oldTheme) {
        SettingsManager.updateSetting("theme", newTheme);
        this.oldTheme = newTheme;
      }
    });

    this.showHiddenGamesSub = showHidden.subscribe((show) => {
      if (show !== this.oldShowHiddenGames) {
        SettingsManager.updateSetting("showHiddenGames", show);
        this.oldShowHiddenGames = show;
      }
    });


    this.dbFiltersSub = dbFilters.subscribe((newFilters) => {
      if (JSON.stringify(newFilters) !== JSON.stringify(this.oldDbFilters)) {
        SettingsManager.updateSetting("windowSettings.main.filters", newFilters);
        this.oldDbFilters = newFilters;
      }
    });

    // * See src/windows/Main.svelte for `windowSettings.main.panels` handling.

    this.gameViewTypeSub = renderGamesInList.subscribe((newGameViewType) => {
      if (newGameViewType !== this.oldGameViewType) {
        SettingsManager.updateSetting("windowSettings.main.gameViewType", newGameViewType ? 1 : 0);
        this.oldGameViewType = newGameViewType;
      }
    });

    this.gridTypeSub = gridType.subscribe((newType) => {
      if (newType !== this.oldGridType) {
        SettingsManager.updateSetting("windowSettings.main.type", newType);
        this.oldGridType = newType;
      }
    });


    this.manualGamesAddMethodSub = selectedManualGamesAddMethod.subscribe((newAddMethod) => {
      if (newAddMethod !== this.oldManualGamesAddMethod) {
        SettingsManager.updateSetting("windowSettings.manageManualGames.method", newAddMethod);
        this.oldManualGamesAddMethod = newAddMethod;
      }
    });


    this.cleanGridsPresetSub = selectedCleanGridsPreset.subscribe((newPreset) => {
      if (newPreset !== this.oldCleanGridsPreset) {
        SettingsManager.updateSetting("windowSettings.cleanGrids.preset", newPreset);
        this.oldCleanGridsPreset = newPreset;
      }
    });
  }

  /**
   * Destroy all settings subscriptions.
   */
  destroy() {
    if(this.steamInstallPathSub) this.steamInstallPathSub();
    if(this.hiddenGameIdsSub) this.hiddenGameIdsSub();
    if(this.manualSteamGamesSub) this.manualSteamGamesSub();
    if(this.customGameNamesSub) this.customGameNamesSub();

    if(this.themeSub) this.themeSub();
    if(this.showHiddenGamesSub) this.showHiddenGamesSub();

    if(this.dbFiltersSub) this.dbFiltersSub();
    if(this.gameViewTypeSub) this.gameViewTypeSub();
    if(this.gridTypeSub) this.gridTypeSub();
    
    if(this.manualGamesAddMethodSub) this.manualGamesAddMethodSub();

    if(this.cleanGridsPresetSub) this.cleanGridsPresetSub();
  }


  /**
   * Loads the settings associated with the current Steam user.
   * @returns The userId of the active user.
   */
  private async loadUserSettings(): Promise<string> {
    const users = await RustInterop.getSteamUsers();
    const cleanedUsers: { [id: string]: SteamUser } = {};

    if (Object.keys(users).length === 0) {
      await DialogController.message(
        "No Steam Users Found",
        "ERROR",
        "No Steam users were found while reading the loginusers file. Typically this is because you have not logged in to Steam yet. Please log in at least once, then restart SARM.",
        "Ok",
      );
      await exit(0);
    }

    // ? need to clean the data here bc props can vary in terms of case
    for (const [ id, user ] of Object.entries(users)) {
      const userKeys = Object.keys(user);
      const lowerCaseUser = Object.fromEntries(userKeys.map((key: string) => [ key.toLowerCase(), user[key] ]));

      cleanedUsers[id] = {
        id64: lowerCaseUser.id64,
        id32: lowerCaseUser.id32,
        AccountName: lowerCaseUser.accountname,
        PersonaName: lowerCaseUser.personaname,
        RememberPassword: lowerCaseUser.rememberpassword,
        WantsOfflineMode: lowerCaseUser.wantsofflinemode,
        SkipOfflineModeWarning: lowerCaseUser.skipofflinemodewarning,
        AllowAutoLogin: lowerCaseUser.allowautologin,
        MostRecent: lowerCaseUser.mostrecent,
        Timestamp: lowerCaseUser.timestamp
      }
    }

    steamUsers.set(cleanedUsers);

    const usersList = Object.values(cleanedUsers);

    if (usersList.length === 0) {
      await dialog.message("No Steam Users found. SARM won't work without at least one user. Try signing into Steam after SARM closes.", { title: "No Users Detected", type: "error" });
      LogController.error("Expected to find at least 1 Steam user but found 0.");
      await process.exit(0);
    }

    const activeUser = usersList.find((user) => user.MostRecent === "1") ?? usersList[0];
    activeUserId.set(parseInt(activeUser.id32));

    return activeUser.id32;
  }

  /**
   * Loads the api key settings.
   * @param activeUserId The id of the active Steam user.
   */
  private loadApiKeySettings(activeUserId: string): void {
    const sgdbKeySetting = SettingsManager.getSetting<string>("steamGridDbApiKey");
    if (sgdbKeySetting !== "") {
      steamGridDBKey.set(sgdbKeySetting);
      needsSGDBAPIKey.set(false);
    }

    const steamApiKeyMapSetting = SettingsManager.getSetting<string>("steamApiKeyMap");
    if (steamApiKeyMapSetting[activeUserId] && steamApiKeyMapSetting[activeUserId] !== "") {
      steamKey.set(steamApiKeyMapSetting[activeUserId]);
      needsSteamKey.set(false);
    }
  }

  /**
   * Load the settings most users don't use.
   */
  private loadNicheSettings(): void {
    const manualSteamGamesSetting = SettingsManager.getSetting<GameStruct[]>("manualSteamGames");
    this.oldManualSteamGames = manualSteamGamesSetting;
    if (manualSteamGamesSetting.length > 0) {
      manualSteamGames.set(manualSteamGamesSetting);
      LogController.log(`Loaded ${manualSteamGamesSetting.length} manually added games.`);
    }

    const customGameNamesSetting = SettingsManager.getSetting<Record<string, string>>("customGameNames");
    this.oldCustomGameNames = customGameNamesSetting;
    customGameNames.set(customGameNamesSetting);
    LogController.log(`Loaded ${Object.keys(customGameNamesSetting).length} custom game names.`);

    const hiddenGameIdsSetting = SettingsManager.getSetting<number[]>("hiddenGameIds");
    this.oldHiddenGameIds = hiddenGameIdsSetting;
    hiddenGameIds.set(hiddenGameIdsSetting);
  }

  /**
   * Load the settings associated with options in the UI.
   */
  private loadUISettings(): void {
    const gameViewTypeSetting = SettingsManager.getSetting<number>("windowSettings.main.gameViewType");
    this.oldGameViewType = gameViewTypeSetting === 1;
    renderGamesInList.set(gameViewTypeSetting === 1);

    const showHiddenGamesSetting = SettingsManager.getSetting<boolean>("showHiddenGames");
    this.oldShowHiddenGames = showHiddenGamesSetting;
    showHidden.set(showHiddenGamesSetting);
    
    const dbFiltersSetting = SettingsManager.getSetting<DBFilters>("windowSettings.main.filters");
    this.oldDbFilters = dbFiltersSetting;
    dbFilters.set(dbFiltersSetting);
    
    const gridTypeSetting = SettingsManager.getSetting<string>("windowSettings.main.type") as GridTypes;
    this.oldGridType = gridTypeSetting;
    gridType.set(gridTypeSetting);

    
    const panelSizeSetting = SettingsManager.getSetting<MainWindowPanels>("windowSettings.main.panels");
    optionsSize.set(panelSizeSetting.options);
    gamesSize.set(panelSizeSetting.games);
    gridsSize.set(panelSizeSetting.grids);


    const cleanGridsPresetSetting = SettingsManager.getSetting<CleanGridsPreset>("windowSettings.cleanGrids.preset");
    this.oldCleanGridsPreset = cleanGridsPresetSetting;
    selectedCleanGridsPreset.set(cleanGridsPresetSetting);

    const manageManualGamesMethodSetting = SettingsManager.getSetting<ManageManualGamesMethod>("windowSettings.manageManualGames.method");
    this.oldManualGamesAddMethod = manageManualGamesMethodSetting;
    selectedManualGamesAddMethod.set(manageManualGamesMethodSetting);
  }

  /**
   * Loads the app's settings.
   */
  async loadSettings(): Promise<void> {
    const themeSetting = SettingsManager.getSetting<number>("theme");
    this.oldTheme = themeSetting;
    theme.set(themeSetting);
    document.body.setAttribute("data-theme", themeSetting === 0 ? "dark" : "light");

    const steamInstallPathSetting = SettingsManager.getSetting<string>("steamInstallPath");
    await findSteamPath(steamInstallPathSetting);


    const activeUserId = await this.loadUserSettings();

    if (activeUserId === "0") {
      ToastController.showGenericToast("User id was 0, try opening steam then restart the SARM");
      LogController.error("User id was 0, try opening steam then restart the SARM");
    } else {
      this.loadApiKeySettings(activeUserId);
    
      this.loadNicheSettings();

      this.loadUISettings();

      
      LogController.log("Finished loading app settings.");
      loadingSettings.set(false);
    }
  }
}