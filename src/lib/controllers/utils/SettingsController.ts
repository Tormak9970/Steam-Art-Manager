/**
 * Steam Art Manager is a tool for setting the artwork of your Steam library.
 * Copyright (C) 2024 Travis Lane (Tormak)
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
import { DEFAULT_SETTINGS } from "@models";
import { activeUserId, cacheSelectedGrids, customGameNames, dbFilters, debugMode, gamesSize, gridsSize, gridType, hiddenGameIds, loadingSettings, manualSteamGames, needsSGDBAPIKey, needsSteamKey, optionsSize, renderGamesInList, selectedCleanGridsPreset, selectedManualGamesAddMethod, showCachedGrids, showHidden, showInfoSnackbar, steamGridDBKey, steamInstallPath, steamKey, steamUsers, theme } from "@stores/AppState";
import { path } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";
import { exit } from "@tauri-apps/plugin-process";
import type { GridTypes, Settings, SteamUser } from "@types";
import { findSteamPath, restartApp } from "@utils";
import { get, type Unsubscriber } from "svelte/store";
import { DialogController } from "./DialogController";
import { LogController } from "./LogController";
import { RustInterop } from "./RustInterop";

/**
 * The main controller for the application.
 */
export class SettingsController {
static settingsPath = "";
  private static settings: Settings;
  private static subscriptions: Unsubscriber[] = [];
  private static oldValues: Record<string, any> = {};

  /**
   * Initializes the SettingsController.
   */
  static async init() {
    loadingSettings.set(true);
    await SettingsController.setSettingsPath();
    SettingsController.settings = await SettingsController.loadSettingsFromSystem();

    LogController.log("Finished loading settings.");

    await SettingsController.setStores();
    loadingSettings.set(false);
  }

  /**
   * Sets `settingsPath` and copies default settings if necessary.
   */
  private static async setSettingsPath(): Promise<void> {
    const appDir = await path.appConfigDir();
    if (!(await fs.exists(appDir))) await fs.mkdir(appDir);

    const setsPath = await path.join(appDir, "settings.json");
    if (!(await fs.exists(setsPath))) {
      await fs.writeTextFile(setsPath, JSON.stringify(DEFAULT_SETTINGS, null, "\t"));
    }

    SettingsController.settingsPath = setsPath;
  }

  /**
   * Migrate the settings structure to account for changes in the structure.
   */
  private static migrateSettingsStructure(oldSettings: Settings): Settings {
    if (oldSettings?.filters) {
      oldSettings.windowSettings.main.filters = oldSettings.filters ?? DEFAULT_SETTINGS.windowSettings.main.filters;
      delete oldSettings.filters;
    }

    if (oldSettings?.panels) {
      oldSettings.windowSettings.main.panels = oldSettings.panels ?? DEFAULT_SETTINGS.windowSettings.main.panels;
      delete oldSettings.panels;
    }

    if (oldSettings?.gameViewType) {
      oldSettings.windowSettings.main.gameViewType = oldSettings.gameViewType ?? DEFAULT_SETTINGS.windowSettings.main.gameViewType;
      delete oldSettings.gameViewType;
    }

    return oldSettings;
  }

  /**
   * Gets the settings data and updates it if needed.
   */
  private static async loadSettingsFromSystem(): Promise<Settings> {
    let currentSettings: any = {};

    if (await fs.exists(SettingsController.settingsPath)) {
      currentSettings = JSON.parse(await fs.readTextFile(SettingsController.settingsPath));
    }

    let settings: Settings = { ...currentSettings };
    
    const defaultSettings = structuredClone(DEFAULT_SETTINGS);

    const curKeys = Object.keys(currentSettings);
    const defEntries = Object.entries(defaultSettings);
    const defKeys = Object.keys(defaultSettings);

    for (const [ key, val ] of defEntries) {
      if (!curKeys.includes(key)) {
        // @ts-expect-error This will always be fine.
        settings[key] = val;
      }
    }

    for (const key in currentSettings) {
      if (!defKeys.includes(key)) {
        // @ts-expect-error This will always be fine.
        delete settings[key];
      }
    }
    
    settings = SettingsController.migrateSettingsStructure(settings);

    settings.version = APP_VERSION;

    await fs.writeTextFile(SettingsController.settingsPath, JSON.stringify(settings));

    LogController.log("Finished checking settings for new app version and/or migration.");

    return settings;
  }


  /**
   * Gets the default value for the given settings field.
   * @param field The settings property to get.
   * @returns The default value for the field.
   */
  static getDefault<T>(field: string): T {
    const settings = structuredClone(DEFAULT_SETTINGS);
    const fieldPath = field.split(".");
    let parentObject = settings;

    for (let i = 0; i < fieldPath. length - 1; i++) {
      // @ts-expect-error This will always be fine.
      parentObject = parentObject[fieldPath[i]];
    }

    // @ts-expect-error This will always be fine.
    return parentObject[fieldPath[fieldPath.length - 1]];
  }

  /**
   * Gets a setting.
   * @param field The key of the setting to get.
   */
  static get<T>(field: string): T {
    const settings = structuredClone(SettingsController.settings);
    const fieldPath = field.split(".");
    let parentObject = settings;

    for (let i = 0; i < fieldPath. length - 1; i++) {
      const key = fieldPath[i];
      
      if (Object.keys(parentObject).includes(key)) {
        // @ts-expect-error This will always be fine.
        parentObject = parentObject[key];
      } else {
        const defaultValue = SettingsController.getDefault<T>(field);
        LogController.log(`Field ${field} didn't exist. Returning default value ${defaultValue}.`);
        return defaultValue;
      }
    }

    const finalKey = fieldPath[fieldPath.length - 1];
    if (Object.keys(parentObject).includes(finalKey)) {
      // @ts-expect-error This will always be fine.
      return parentObject[finalKey];
    } else {
      const defaultValue = SettingsController.getDefault<T>(field);
      LogController.log(`Field ${field} didn't exist. Returning default value ${defaultValue}.`);
      return defaultValue;
    }
  }

  /**
   * Sets a setting's value.
   * @param key The key of the setting to set.
   * @param value The setting's value
   */
  static async set<T>(key: string, value: T) {
    SettingsController.setOnChange(key)(value);
  }

  private static setOnChange<T>(key: string): (value: T) => Promise<void> {
    const keys = key.split(".");
    const lastKey = keys[keys.length - 1];

    let parentObject = SettingsController.settings as any;
    for (let i = 0; i < keys.length - 1; i++) {
      parentObject = parentObject[keys[i]];
    }

    return async (value: T) => {
      if (!SettingsController.oldValues[key] || JSON.stringify(SettingsController.oldValues[key]) !== JSON.stringify(value)) {
        const settings = structuredClone(SettingsController.settings);

        parentObject[lastKey] = value;
        SettingsController.oldValues[key] = value;
        
        await fs.writeTextFile(SettingsController.settingsPath, JSON.stringify(settings));
        
        LogController.log(`Updated setting ${key} to ${JSON.stringify(value)}.`);
      }
    }
  }

  /**
   * Loads the settings associated with the current Steam user.
   * @returns The userId of the active user.
   */
  private static async loadUserSettings(): Promise<string> {
    const users = await RustInterop.getSteamUsers();
    const cleanedUsers: { [id: string]: SteamUser } = {};

    if (Object.keys(users).length === 0) {
      await DialogController.message(
        "No Steam Users Found",
        "ERROR",
        "No Steam users were found while reading the loginusers file. Typically this is because you have not logged in to Steam yet. Please log in at least once, then restart SARM.",
        "Ok",
      );
      LogController.error("Expected to find at least 1 Steam user but found 0.");
      await exit(0);
    }

    // ? need to clean the data here bc props can vary in terms of case
    for (const [ id, user ] of Object.entries(users)) {
      const userKeys = Object.keys(user);
      // @ts-expect-error since we're mapping from user's keys, it should always work.
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
    const activeUser = usersList.find((user) => user.MostRecent === "1") ?? usersList[0];
    activeUserId.set(parseInt(activeUser.id32));

    return activeUser.id32;
  }

  private static async setStores(): Promise<void> {
    const themeSetting = SettingsController.settings.theme;
    SettingsController.oldValues["theme"] = themeSetting;
    theme.set(themeSetting);
    document.body.setAttribute("data-theme", themeSetting === 0 ? "dark" : "light");

    const debugModeSetting = SettingsController.settings.debugMode;
    SettingsController.oldValues["debugMode"] = debugModeSetting;
    debugMode.set(debugModeSetting);
    if (debugModeSetting) await RustInterop.toggleDevTools(true);

    const steamInstallPathSetting = SettingsController.settings.steamInstallPath;
    await findSteamPath(steamInstallPathSetting);

    const activeUserId = await SettingsController.loadUserSettings();
    if (activeUserId === "0") {
      get(showInfoSnackbar)({ message: "User id was 0, try opening steam then restart the SARM" });
      LogController.error("User id was 0, try opening steam then restart the SARM");
    } else {
      const sgdbKeySetting = SettingsController.settings.steamGridDbApiKey;
      SettingsController.oldValues["steamGridDbApiKey"] = sgdbKeySetting;
      
      if (sgdbKeySetting !== "") {
        steamGridDBKey.set(sgdbKeySetting);
        needsSGDBAPIKey.set(false);
      }
  
      const steamApiKeyMapSetting = SettingsController.settings.steamApiKeyMap;
      SettingsController.oldValues["steamApiKeyMap"] = steamApiKeyMapSetting
      if (steamApiKeyMapSetting[activeUserId] && steamApiKeyMapSetting[activeUserId] !== "") {
        steamKey.set(steamApiKeyMapSetting[activeUserId]);
        needsSteamKey.set(false);
      }

      
      const manualSteamGamesSetting = SettingsController.settings.manualSteamGames;
      SettingsController.oldValues["manualSteamGames"] = structuredClone(manualSteamGamesSetting);
      if (manualSteamGamesSetting.length > 0) {
        manualSteamGames.set(manualSteamGamesSetting);
        LogController.log(`Loaded ${manualSteamGamesSetting.length} manually added games.`);
      }
  
      const customGameNamesSetting = SettingsController.settings.customGameNames;
      SettingsController.oldValues["customGameNames"] = structuredClone(customGameNamesSetting);
      customGameNames.set(customGameNamesSetting);
      LogController.log(`Loaded ${Object.keys(customGameNamesSetting).length} custom game names.`);
  
      const hiddenGameIdsSetting = SettingsController.settings.hiddenGameIds;
      SettingsController.oldValues["hiddenGameIds"] = structuredClone(hiddenGameIdsSetting);
      hiddenGameIds.set(hiddenGameIdsSetting);
  
      const cacheSelectedGridsSetting = SettingsController.settings.cacheSelectedGrids;
      SettingsController.oldValues["cacheSelectedGrids"] = cacheSelectedGridsSetting;
      cacheSelectedGrids.set(cacheSelectedGridsSetting);


      const gameViewTypeSetting = SettingsController.settings.windowSettings.main.gameViewType;
      SettingsController.oldValues["windowSettings.main.gameViewType"] = gameViewTypeSetting;
      renderGamesInList.set(gameViewTypeSetting === 1);
  
      const showHiddenGamesSetting = SettingsController.settings.showHiddenGames;
      SettingsController.oldValues["showHiddenGames"] = showHiddenGamesSetting;
      showHidden.set(showHiddenGamesSetting);
      
      const dbFiltersSetting = SettingsController.settings.windowSettings.main.filters;
      SettingsController.oldValues["windowSettings.main.filters"] = dbFiltersSetting;
      dbFilters.set(dbFiltersSetting);
      
      const gridTypeSetting = SettingsController.settings.windowSettings.main.type as GridTypes;
      SettingsController.oldValues["windowSettings.main.type"] = gridTypeSetting;
      gridType.set(gridTypeSetting);
      
      const showCachedSetting = SettingsController.settings.windowSettings.main.showCached;
      SettingsController.oldValues["windowSettings.main.showCached"] = showCachedSetting;
      showCachedGrids.set(showCachedSetting);
  
      
      const panelSizeSetting = SettingsController.settings.windowSettings.main.panels;
      SettingsController.oldValues["windowSettings.main.panels"] = panelSizeSetting;
      optionsSize.set(panelSizeSetting.options);
      gamesSize.set(panelSizeSetting.games);
      gridsSize.set(panelSizeSetting.grids);
  
  
      const cleanGridsPresetSetting = SettingsController.settings.windowSettings.cleanGrids.preset;
      SettingsController.oldValues["windowSettings.cleanGrids.preset"] = cleanGridsPresetSetting;
      selectedCleanGridsPreset.set(cleanGridsPresetSetting);
  
      const manageManualGamesMethodSetting = SettingsController.settings.windowSettings.manageManualGames.method;
      SettingsController.oldValues["windowSettings.manageManualGames.method"] = manageManualGamesMethodSetting;
      selectedManualGamesAddMethod.set(manageManualGamesMethodSetting);
      
      
      LogController.log("Finished loading app settings.");
      loadingSettings.set(false);
    }
  }

  /**
   * Registers the store listeners responsible for automatically updating the settings.
   */
  static registerSubs() {
    SettingsController.subscriptions = [
      steamInstallPath.subscribe(async (newPath) => {
        if (newPath !== SettingsController.oldValues["steamInstallPath"]) {
          SettingsController.set("steamInstallPath", newPath);
  
          if (SettingsController.oldValues["steamInstallPath"] !== "") {
            const shouldReloadGames = await DialogController.ask(
              "Steam Install Path Changed",
              "WARNING",
              "A change to your Steam install path was detected, would you like to reload your games?",
              "Yes",
              "No"
            );
  
            if (shouldReloadGames) {
              await restartApp();
            }
          }
          
          SettingsController.oldValues["steamInstallPath"] = newPath;
        }
      }),
      // * See src/components/modals/settings/SettingsModal.svelte for `sgdbApiKey` and `steamApiKeyMap` handling.
      hiddenGameIds.subscribe(SettingsController.setOnChange("hiddenGameIds")),
      manualSteamGames.subscribe(SettingsController.setOnChange("manualSteamGames")),
      customGameNames.subscribe(SettingsController.setOnChange("customGameNames")),
  
      theme.subscribe(SettingsController.setOnChange("theme")),
      debugMode.subscribe(SettingsController.setOnChange("debugMode")),
      showHidden.subscribe(SettingsController.setOnChange("showHiddenGames")),
      cacheSelectedGrids.subscribe(SettingsController.setOnChange("cacheSelectedGrids")),
  
      dbFilters.subscribe(SettingsController.setOnChange("windowSettings.main.filters")),
  
      // * See src/windows/Main.svelte for `windowSettings.main.panels` handling.
      renderGamesInList.subscribe(SettingsController.setOnChange("windowSettings.main.gameViewType")),
      gridType.subscribe(SettingsController.setOnChange("windowSettings.main.type")),
      showCachedGrids.subscribe(SettingsController.setOnChange("windowSettings.main.showCached")),
  
      selectedManualGamesAddMethod.subscribe(SettingsController.setOnChange("windowSettings.manageManualGames.method")),
      selectedCleanGridsPreset.subscribe(SettingsController.setOnChange("windowSettings.cleanGrids.preset")),
    ];
  }

  /**
   * Handles destroying the settings.
   */
  static destroy() {
    for (const unsub of SettingsController.subscriptions) {
      unsub();
    }
  }
}