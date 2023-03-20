import { fs, path } from "@tauri-apps/api";
// import { get, type Unsubscriber } from "svelte/store";
// import { } from "../../Stores";
import { ToasterController } from "./ToasterController";
import { SettingsManager } from "../utils/SettingsManager";
import { LogController } from "./LogController";

/**
 * The main controller for the application
 */
export class AppController {
  private static logFilePath = "";
  static logController = new LogController();

  static async setup(): Promise<void> {
    await SettingsManager.setSettingsPath();
    let settings:AppSettings = await SettingsManager.getSettings();

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
  }

  /**
   * Saves the current changes
   */
  static async saveChanges(): Promise<void> {
    
  }

  /**
   * Discards the current changes
   */
  static async discardChanges(): Promise<void> {
    

    ToasterController.showSuccessToast("Changes discarded!");
  }

  /**
   * Reloads the user's saves
   */
  static async reload(): Promise<void> {
    
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
    
  }
}

// function confirmDelete(e:Event) {
//   toast.push({
//     component: {
//       src: ConfirmDelete,
//       props: {
//         properties: ['archive', $state.archive.data.name]
//       },
//       sendIdTo: 'toastId'
//     },
//     target: "top",
//     dismissable: false,
//     initial: 0,
//         intro: { y: -192 },
//     theme: {
//       '--toastPadding': '0',
//             '--toastBackground': 'transparent',
//       '--toastMsgPadding': '0'
//     }
//   });
// }