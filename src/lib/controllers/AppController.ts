import { dialog } from "@tauri-apps/api";
import { ToastController } from "./ToastController";
import { SettingsManager } from "../utils/SettingsManager";
import { LogController } from "./LogController";
import { get } from "svelte/store";
import { isOnline, needsAPIKey, steamGridDBKey } from "../../Stores";
import { CacheController } from "./CacheController";
import { RustInterop } from "./RustInterop";

/**
 * The main controller for the application
 */
export class AppController {
  private static cacheController = new CacheController();

  static async setup(): Promise<void> {
    await SettingsManager.setSettingsPath();
    let settings:AppSettings = await SettingsManager.getSettings();

    if (settings.steamGridDbApiKey != "") {
      steamGridDBKey.set(settings.steamGridDbApiKey);
      needsAPIKey.set(false);
    }
  }

  /**
   * Sets up the AppController.
   */
  static async init(): Promise<void> {
    await LogController.cleanLogFile();

    const appIsOnline = get(isOnline);
    LogController.log(`App initialized. IsOnline: ${appIsOnline}`);

    // TODO: Check if api key is set. if not, prompt user to set it.
    if (get(needsAPIKey)) {
      
    }
  }

  static async getUserSteamApps() {
    const apps = await RustInterop.getSteamApps();

    const appIsOnline = get(isOnline);
    const needsSgdbKey = get(needsAPIKey);

    if (appIsOnline && !needsSgdbKey) {
      
    } else {
      ToastController.showGenericToast("AppId Blacklist will not be generated.");
      if (!isOnline) LogController.warn("App is offline, not generating blacklist");
      if (needsSgdbKey) LogController.warn("App needs SteamGrid api key, not generating blacklist");
    }
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
    

    ToastController.showSuccessToast("Changes discarded!");
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
   * Function run on app closing/refreshing.
   */
  static onDestroy(): void {
    
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