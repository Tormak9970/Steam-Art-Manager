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
import { LogController } from "@controllers";
import { DEFAULT_SETTINGS } from "@models";
import { path } from "@tauri-apps/api";
import * as fs from "@tauri-apps/plugin-fs";
import type { AppSettings } from "@types";

/**
 * A class for managing application settings
 */
export class SettingsManager {
  private static settings: AppSettings;
  static settingsPath = "";

  /**
   * Initializes the SettingsManager.
   */
  static async init() {
    await SettingsManager.setSettingsPath();
    SettingsManager.settings = await SettingsManager.loadSettingsFromSystem();
  }

  /**
   * Sets `settingsPath` and copies default settings if necessary.
   */
  private static async setSettingsPath(): Promise<void> {
    const appDir = await path.appConfigDir();
    if (!(await fs.exists(appDir))) await fs.create(appDir);

    const setsPath = await path.join(appDir, "settings.json");
    if (!(await fs.exists(setsPath))) {
      await fs.writeTextFile(setsPath, JSON.stringify(DEFAULT_SETTINGS, null, "\t"));
    }

    SettingsManager.settingsPath = setsPath;
  }

  /**
   * Migrate the settings structure to account for changes in the structure.
   */
  private static migrateSettingsStructure(oldSettings: AppSettings): AppSettings {
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
  private static async loadSettingsFromSystem(): Promise<AppSettings> {
    let currentSettings: any = {};

    if (await fs.exists(SettingsManager.settingsPath)) {
      currentSettings = JSON.parse(await fs.readTextFile(SettingsManager.settingsPath));
    }

    let settings: AppSettings = { ...currentSettings };
    
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
    
    settings = SettingsManager.migrateSettingsStructure(settings);

    settings.version = APP_VERSION;

    await fs.writeTextFile(SettingsManager.settingsPath, JSON.stringify(settings));

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
   * Gets the given settings field.
   * @param field The settings property to get.
   * @returns The given setting, or its default value if it does not exist.
   */
  static getSetting<T>(field: string): T {
    const settings = structuredClone(SettingsManager.settings);
    const fieldPath = field.split(".");
    let parentObject = settings;

    for (let i = 0; i < fieldPath. length - 1; i++) {
      const key = fieldPath[i];
      
      if (Object.keys(parentObject).includes(key)) {
        // @ts-expect-error This will always be fine.
        parentObject = parentObject[key];
      } else {
        const defaultValue = SettingsManager.getDefault<T>(field);
        LogController.log(`Field ${field} didn't exist. Returning default value ${defaultValue}.`);
        return defaultValue;
      }
    }

    const finalKey = fieldPath[fieldPath.length - 1];
    if (Object.keys(parentObject).includes(finalKey)) {
      // @ts-expect-error This will always be fine.
      return parentObject[finalKey];
    } else {
      const defaultValue = SettingsManager.getDefault<T>(field);
      LogController.log(`Field ${field} didn't exist. Returning default value ${defaultValue}.`);
      return defaultValue;
    }
  }

  /**
   * Updates the given settings field with the provided data.
   * @param field The setting to update.
   * @param val The new value.
   */
  static async updateSetting<T>(field: string, val: T): Promise<void> {
    const settings = structuredClone(SettingsManager.settings);
    const fieldPath = field.split(".");
    let parentObject = settings;

    for (let i = 0; i < fieldPath. length - 1; i++) {
      // @ts-expect-error This will always be fine.
      parentObject = parentObject[fieldPath[i]];
    }

    // @ts-expect-error This will always be fine.
    parentObject[fieldPath[fieldPath.length - 1]] = val;

    SettingsManager.settings = settings;
    await fs.writeTextFile(SettingsManager.settingsPath, JSON.stringify(settings));

    LogController.log(`Updated setting ${field} to ${JSON.stringify(val)}.`);
  }
}
