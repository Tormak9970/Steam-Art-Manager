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
import { GridTypes, activeUserId, customGameNames, dbFilters, gamesSize, gridType, gridsSize, hiddenGameIds, loadingSettings, manualSteamGames, needsSGDBAPIKey, needsSteamKey, optionsSize, renderGamesInList, selectedCleanGridsPreset, selectedManualGamesAddMethod, showHidden, steamGridDBKey, steamKey, steamUsers, theme, type DBFilters } from "../../stores/AppState";
import { RustInterop } from "./RustInterop";

import "tippy.js/dist/tippy.css"
import { exit } from "@tauri-apps/api/process";
import { DialogController } from "./DialogController";
import { findSteamPath } from "../utils/Utils";

/**
 * The main controller for the application.
 */
export class SettingsController {
  
  /**
   * Register subscriptions for setting changes.
   */
  async subscribeToSettingChanges() {

  }

  /**
   * Destroy all settings subscriptions.
   */
  destroySubscriptions() {

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
    if (manualSteamGamesSetting.length > 0) {
      manualSteamGames.set(manualSteamGamesSetting);
      LogController.log(`Loaded ${manualSteamGamesSetting.length} manually added games.`);
    }

    const customGameNamesSetting = SettingsManager.getSetting<Record<string, string>>("customGameNames");
    customGameNames.set(customGameNamesSetting);
    LogController.log(`Loaded ${Object.keys(customGameNamesSetting).length} custom game names.`);

    const hiddenGameIdsSetting = SettingsManager.getSetting<number[]>("hiddenGameIds");
    hiddenGameIds.set(hiddenGameIdsSetting);
  }

  /**
   * Load the settings associated with options in the UI.
   */
  private loadUISettings(): void {
    const gameViewTypeSetting = SettingsManager.getSetting<number>("windowSettings.main.gameViewType");
    renderGamesInList.set(gameViewTypeSetting === 1);

    const showHiddenGamesSetting = SettingsManager.getSetting<boolean>("showHiddenGames");
    showHidden.set(showHiddenGamesSetting);
    
    const dbFiltersSetting = SettingsManager.getSetting<DBFilters>("windowSettings.main.filters");
    dbFilters.set(dbFiltersSetting);
    
    const gridTypeSetting = SettingsManager.getSetting<string>("windowSettings.main.type") as GridTypes;
    gridType.set(gridTypeSetting);

    
    const panelSizeSetting = SettingsManager.getSetting<MainWindowPanels>("windowSettings.main.panels");
    optionsSize.set(panelSizeSetting.options);
    gamesSize.set(panelSizeSetting.games);
    gridsSize.set(panelSizeSetting.grids);


    const cleanGridsPresetSetting = SettingsManager.getSetting<CleanGridsPreset>("windowSettings.cleanGrids.preset");
    selectedCleanGridsPreset.set(cleanGridsPresetSetting);

    const manualGamesMethodSetting = SettingsManager.getSetting<ManualGamesMethod>("windowSettings.manageManualGames.method");
    selectedManualGamesAddMethod.set(manualGamesMethodSetting);
  }

  /**
   * Loads the app's settings.
   */
  async loadSettings(): Promise<void> {
    const themeSetting = SettingsManager.getSetting<number>("theme");
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