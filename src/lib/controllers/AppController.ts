import { fs, path } from "@tauri-apps/api";
import { get, type Unsubscriber } from "svelte/store";
import {
  changedTabs,
  discardChangesDisabled,
  saveFiles,
  saveChangesDisabled,
  saveDirPath,
  selectedTab,
  tabs,
  unchangedTabs,
  seriesEntry,
  gameVersion,
  selectedProfile,
  availableProfiles
} from "../../Stores";
import { ToasterController } from "./ToasterController";
import { SettingsManager } from "../utils/SettingsManager";
import { LogController } from "./LogController";

/**
 * The main controller for the application
 */
export class AppController {
  private static logFilePath = "";
  static logController = new LogController();
  static backupsController = new BackupsController();
  static windowController = new WindowController();

  private static seriesEntrySub:Unsubscriber;
  private static gameVersionSub:Unsubscriber;
  private static saveDirPathSub:Unsubscriber;
  private static selectedTabSub:Unsubscriber;
  private static selectedProfileSub:Unsubscriber;

  static async setup(): Promise<void> {
    await SettingsManager.setSettingsPath();
    let settings:AppSettings = await SettingsManager.getSettings();

    seriesEntry.set(settings.seriesEntry);
    saveDirPath.set(settings.seriesEntry == SeriesEntry.ROGUE_LEGACY_ONE ? settings.legacy1SaveDir : settings.legacy2SaveDir);
    gameVersion.set(settings.seriesEntry == SeriesEntry.ROGUE_LEGACY_ONE ? settings.legacy1Version : settings.legacy2Version);

    if (!AppController.seriesEntrySub) {
      AppController.seriesEntrySub = seriesEntry.subscribe(async (newVal:number) => {
        await SettingsManager.updateSettings({
          prop: "seriesEntry",
          data: newVal
        });
      });
    }

    if (!AppController.gameVersionSub) {
      AppController.gameVersionSub = gameVersion.subscribe(async (newVal:string) => {
        await SettingsManager.updateSettings({
          prop: get(seriesEntry) === SeriesEntry.ROGUE_LEGACY_ONE ? "legacy1Version": "legacy2Version",
          data: newVal
        });
      });
    }

    if (!AppController.saveDirPathSub) {
      AppController.saveDirPathSub = saveDirPath.subscribe(async (newVal:string) => {
        const saveDirConts = await fs.readDir(newVal);
        const profileFolders = saveDirConts.filter((entry) => entry.name.toLowerCase().includes("profile"));

        if (profileFolders.length > 0) {
          availableProfiles.set(profileFolders.map((entry) => entry.name));
          selectedProfile.set(get(availableProfiles)[0]);
        } else {
          availableProfiles.set([]);
          selectedProfile.set("Invalid Save Dir");
          unchangedTabs.set({});
          changedTabs.set({});
          tabs.set({});
          selectedTab.set("");

          ToasterController.showGenericToast("Select a folder with profiles");
        }

        await SettingsManager.updateSettings({
          prop: get(seriesEntry) === SeriesEntry.ROGUE_LEGACY_ONE ? "legacy1SaveDir": "legacy2SaveDir",
          data: newVal
        });
      });
    }

    if (!AppController.selectedProfileSub) {
      AppController.selectedProfileSub = selectedProfile.subscribe(async (newVal:string) => {
        if (newVal?.toLowerCase().includes("profile")) {
          await AppController.loadSaves();
        }
      });
    }
  }

  /**
   * Sets up the app
   */
  static async init(): Promise<void> {
    const logDir = await path.join(await path.appDataDir(), "logs");

    AppController.logFilePath = await path.join(logDir, "rogue-legacy-editor.log");
    AppController.logController.setFilePath(AppController.logFilePath);
    await AppController.logController.cleanLogFile();

    const backupPath = await path.join(await path.appDataDir(), "backups");
    const rogueOneBackupPath = await path.join(backupPath, "rogueLegacy1");
    const rogueTwoBackupPath = await path.join(backupPath, "rogueLegacy2");

    if (!(await fs.exists(backupPath))) await fs.createDir(backupPath);
    if (!(await fs.exists(rogueOneBackupPath))) await fs.createDir(rogueOneBackupPath);
    if (!(await fs.exists(rogueTwoBackupPath))) await fs.createDir(rogueTwoBackupPath);
    AppController.backupsController.setBackupDir(backupPath);
  }

  /**
   * Saves the current changes
   */
  static async saveChanges(): Promise<void> {
    const saveFileObj = get(saveFiles);
    const saveFileList = Object.entries(saveFileObj);
    const changes = Object.entries(get(tabs));
    const cTabs = get(changedTabs);

    for (let i = 0; i < saveFileList.length; i++) {
      const fileName = saveFileList[i][0];
      const saveFile = saveFileObj[fileName];

      if (cTabs[fileName]) {
        const filePath = await path.join(get(saveDirPath), get(selectedProfile), fileName);
        const newData = changes[i][1];

        const success = saveFile.fromJson(newData);
        if (success) {
          const dataBuf = saveFile.asBinary();

          await fs.writeBinaryFile(filePath, dataBuf);
          cTabs[fileName] = false;
        } else {
          AppController.error(`Failed to write file ${fileName}`);
        }
      }
    }

    changedTabs.set(cTabs);
    saveFiles.set(saveFileObj);
    discardChangesDisabled.set(true);
    saveChangesDisabled.set(true);
  }

  /**
   * Discards the current changes
   */
  static async discardChanges(): Promise<void> {
    const originalJsons = get(unchangedTabs);
    tabs.set(JSON.parse(JSON.stringify(originalJsons)));

    const selTab = get(selectedTab);
    selectedTab.set("");
    selectedTab.set(selTab);

    discardChangesDisabled.set(true);
    saveChangesDisabled.set(true);

    ToasterController.showSuccessToast("Changes discarded!");
  }

  /**
   * Reloads the user's saves
   */
  static async reload(): Promise<void> {
    await AppController.loadSaves();
  }

  /**
   * Logs a message with level [INFO] to the app's log file.
   * @param message Message to log.
   */
  static log(message:string) {
    AppController.logController.log(message);
    console.log(message);
  }
  
  /**
   * Logs a message with level [WARNING] to the app's log file.
   * @param message Message to log.
   */
  static warn(message:string) {
    AppController.logController.warn(message);
    console.warn(message);
  }
  
  /**
   * Logs a message with level [ERROR] to the app's log file.
   * @param message Message to log.
   */
  static error(message:string) {
    AppController.logController.error(message);
    console.error(message);
  }

  /**
   * Function run on app closing/refreshing.
   */
  static onDestroy(): void {
    if (AppController.seriesEntrySub) AppController.seriesEntrySub();
    if (AppController.gameVersionSub) AppController.gameVersionSub();
    if (AppController.saveDirPathSub) AppController.saveDirPathSub();
    if (AppController.selectedTabSub) AppController.selectedTabSub();
    if (AppController.selectedProfileSub) AppController.selectedProfileSub();
  }
}
