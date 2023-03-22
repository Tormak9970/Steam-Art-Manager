import { dialog, fs, path } from "@tauri-apps/api";
// import { get, type Unsubscriber } from "svelte/store";
// import { } from "../../Stores";
import { ToasterController } from "./ToasterController";
import { SettingsManager } from "../utils/SettingsManager";
import { LogController } from "./LogController";

/**
 * The main controller for the application
 */
export class AppController {
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

    await AppController.logController.cleanLogFile();
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

  static async importGrids(): Promise<void> {

  }

  static async exportGrids(): Promise<void> {

  }

  static async emptyCache(): Promise<void> {
    
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
   * Prompts the user to decide if they want to continue offline.
   * @returns A promise resolving to the user's decisions.
   */
  static async promptOffline(): Promise<boolean> {
    return await dialog.ask("You are offline. Steam Art Manager won't work properly/fully. Do you want to continue?", {
      title: "No Internet Connection",
      type: "warning"
    });
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