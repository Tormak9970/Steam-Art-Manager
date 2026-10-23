import type { GameStruct } from "@types";
import { restartApp } from "@utils";
import { AppController } from "./AppController";
import { DialogController } from "./utils/DialogController";
import { LogController } from "./utils/LogController";
import { RustInterop } from "./utils/RustInterop";

export class CEFInjectionController {
  private static sharedJSContextWSURL: string | null = null

  /**
   * Starts CEF Remote Debug Injection.
   * @param needsRestart Whether SARM needs to restart.
   */
  static async startCEFInjection(needsRestart: boolean): Promise<void> {
    if (needsRestart) {
      await restartApp(AppController.saveChanges.bind(AppController));
    }

    const cefEnabled = await RustInterop.checkSteamCEFEnabled();
    const steamIsRunning = await RustInterop.checkSteamIsRunning();
    let steamStarted: boolean

    if (!steamIsRunning) {
      steamStarted = await RustInterop.awaitSteamStart();
      LogController.log(`Steam Started: ${steamStarted}`);
    } else if (steamIsRunning && !cefEnabled) {
      await DialogController.message(
        "Steam Needs to be Restarted",
        "INFO",
        "Steam needs to be restarted (SARM will do this for you once you click <b>Ok</b>). Make sure you don't have any games running.",
        "Restart Steam"
      )
      
      steamStarted = await RustInterop.awaitSteamRestart();
      LogController.log(`Steam Restarted: ${steamStarted}`);
    } else {
      steamStarted = true;
    }

    if (!steamStarted) {
      LogController.warn('Failed to inject into the Steam Client!');
      return;
    }
    
    CEFInjectionController.sharedJSContextWSURL = await RustInterop.findSharedJSContext();
  }

  /**
   * Ends CEF Remote Debug Injection.
   */
  static async endCEFInjection(): Promise<void> {
    await restartApp(AppController.saveChanges.bind(AppController));
  }

  static async getUsers() {
    
  }
  
  /**
   * Gets the user's apps using the Steam Client.
   * @returns The user's apps.
   */
  static async getApps(): Promise<GameStruct[] | null> {
    if (CEFInjectionController.sharedJSContextWSURL) {
      return await RustInterop.getSteamClientApps(CEFInjectionController.sharedJSContextWSURL)
    }

    return null
  }
  
  static async getFilterData() {
    
  }
}