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
import { fs, path } from "@tauri-apps/api";
import { LogController } from "../controllers/LogController";
import { DEFAULT_SETTINGS } from "../models/Defaults";

/**
 * A class for managing application settings
 */
export class SettingsManager {
  static settingsPath = "";

  /**
   * Sets `settingsPath` and copies default settings if necessary
   */
  static async setSettingsPath(): Promise<void> {
    const appDir = await path.appConfigDir();
    if (!(await fs.exists(appDir))) await fs.createDir(appDir);

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
   * Gets the settings data and updates it if the app version is older.
   */
  static async getSettings(): Promise<AppSettings> {
    const currentSettings = JSON.parse(await fs.readTextFile(SettingsManager.settingsPath));

    let settings: AppSettings = { ...currentSettings };
    if (currentSettings.version !== APP_VERSION || settings.filters || settings.panels || settings.gameViewType) {
      const defaultSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

      const curKeys = Object.keys(currentSettings);
      const defEntries = Object.entries(defaultSettings);
      const defKeys = Object.keys(defaultSettings);

      for (const [ key, val ] of defEntries) {
        if (!curKeys.includes(key)) {
          settings[key] = val;
        }
      }

      for (const key in currentSettings) {
        if (!defKeys.includes(key)) {
          delete settings[key];
        }
      }
      
      settings = SettingsManager.migrateSettingsStructure(settings);

      settings.version = APP_VERSION;

      await fs.writeFile({
        path: SettingsManager.settingsPath,
        contents: JSON.stringify(settings),
      });
  
      LogController.log("Updated settings for new app version and/or migration.");
    }

    return settings;
  }

  /**
   * Updates a field settings JSON with the provided data.
   * @param prop The setting to update.
   * @param val The new value.
   */
  static async updateSetting<T>(prop: string, val: T): Promise<void> {
    const settingsData = await fs.readTextFile(SettingsManager.settingsPath);

    const settings = JSON.parse(settingsData);

    const propsPath = prop.split(".");
    let parentObject = settings;

    for (let i = 0; i < propsPath. length - 1; i++) {
      parentObject = parentObject[propsPath[i]];
    }

    parentObject[propsPath[propsPath.length - 1]] = val;

    await fs.writeFile({
      path: SettingsManager.settingsPath,
      contents: JSON.stringify(settings),
    });

    LogController.log(`Updated setting ${prop} to ${JSON.stringify(val)}.`);
  }
}
