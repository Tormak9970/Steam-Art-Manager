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
import { DEFAULT_FILTERS } from "./Defaults";

const DEFAULT_SETTINGS = `{
  "version": "",
  "steamInstallPath": "",
  "shownShortcutPrompt": false,
  "steamGridDbApiKey": "",
  "steamApiKeyMap": {},
  "hiddenGameIds": [],
  "manualSteamGames": [],
  "customGameName": {},
  
  "theme": 0,
  "gameViewType": 0,
  "showHiddenGames": false,
  "filters": ${JSON.stringify(DEFAULT_FILTERS, null, "\t")},
  "panels": {
    "options": 16,
    "games": 42,
    "grids": 42
  }
}`;

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
      await fs.writeTextFile(setsPath, DEFAULT_SETTINGS);
    }

    SettingsManager.settingsPath = setsPath;
  }

  /**
   * Gets the settings data and updates it if the app version is older.
   */
  static async getSettings(): Promise<AppSettings> {
    const currentSettings = JSON.parse(await fs.readTextFile(SettingsManager.settingsPath));

    const settings: AppSettings = { ...currentSettings };
    if (currentSettings.version !== APP_VERSION) {
      const defaultSettings = JSON.parse(DEFAULT_SETTINGS);

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

      settings.version = APP_VERSION;

      await fs.writeFile({
        path: SettingsManager.settingsPath,
        contents: JSON.stringify(settings),
      });
  
      LogController.log("Updated settings for new app version.");
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
    settings[prop] = val;

    await fs.writeFile({
      path: SettingsManager.settingsPath,
      contents: JSON.stringify(settings),
    });

    LogController.log(`Updated setting ${prop} to ${val}.`);
  }
}
