import { fs, path } from "@tauri-apps/api";
import { LogController } from "../controllers/LogController";

/**
 * A class for managing application settings
 */
export class SettingsManager {
  static settingsPath = "";

  /**
   * Sets `settingsPath` and copies default settings if necessary
   */
  static async setSettingsPath() {
    const appDir = await path.appConfigDir();
    if (!(await fs.exists(appDir))) await fs.createDir(appDir);

    const setsPath = await path.join(appDir, "settings.json");
    if (!(await fs.exists(setsPath))) {
      await fs.readTextFile(setsPath).then(
        () => {},
        async () => {
          await fs.copyFile(await path.resolveResource("../settings.json"), setsPath);
        }
      );
    }

    SettingsManager.settingsPath = setsPath;
  }

  /**
   * Gets the settings data and updates it if the app version is older.
   */
  static async getSettings(): Promise<AppSettings> {
    let settings: AppSettings;
    const currentSettings:any = JSON.parse(await fs.readTextFile(SettingsManager.settingsPath));

    settings = {...currentSettings};
    if (currentSettings.version !== APP_VERSION) {
      const defaultSettings = JSON.parse(await fs.readTextFile(await path.resolveResource("../settings.json")));

      const curEntries = Object.entries(currentSettings);
      const curKeys = Object.keys(currentSettings);
      const defEntries = Object.entries(defaultSettings);
      const defKeys = Object.keys(defaultSettings);

      for (const [key, val] of defEntries) {
        if (!curKeys.includes(key)) {
          settings[key] = val;
        }
      }

      for (const [key, _] of curEntries) {
        if (!defKeys.includes(key)) {
          delete settings[key];
        }
      }

      settings.version = APP_VERSION;

      await fs.writeFile({
        path: SettingsManager.settingsPath,
        contents: JSON.stringify(settings),
      });
  
      LogController.log(`Updated settings for new app version.`);
    }
    
    return settings;
  }

  /**
   * Updates a field settings JSON with the provided data.
   * @param prop The setting to update.
   * @param val The new value.
   */
  static async updateSetting<T>(prop: string, val: T) {
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
