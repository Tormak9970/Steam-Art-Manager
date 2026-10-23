import { startSteamOnLaunch } from "@stores/AppState";
import { restartApp } from "@utils";
import { get } from "svelte/store";
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
    const cefEnabled = await RustInterop.checkSteamCEFEnabled();
    const steamIsRunning = await RustInterop.checkSteamIsRunning();
    let steamStarted: boolean

    if (!cefEnabled) {
      await RustInterop.enableSteamCEFDebugging();
    }

    if (needsRestart) {
      await restartApp(AppController.saveChanges.bind(AppController));
    }

    if (!steamIsRunning) {
      if (!get(startSteamOnLaunch)) {
        await DialogController.message(
          "Steam Needs to be Running",
          "INFO",
          "You have the <b>Use Steam Client</b> setting enabled, which means Steam needs to be running. Please start Steam. Once it loads click the button below. You can enabled the <b>Start Steam on Launch</b> setting to do this automatically in the future.",
          "Steam is Now Running"
        )
      }
      
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
    
    // TODO: may need to attempt this multiple times.
    CEFInjectionController.sharedJSContextWSURL = await RustInterop.findSharedJSContext();
    console.log('sharedJSContextWSURL:', CEFInjectionController.sharedJSContextWSURL);
  }

  /**
   * Ends CEF Remote Debug Injection.
   */
  static async endCEFInjection(): Promise<void> {
    const disableCEF = await DialogController.ask(
      "Disable Steam Remote Debugging?",
      "INFO",
      "Do you want to disable Steam CEF Remote Debugging? If you don't know what that is, selecting <b>Yes</b> is recommended. This has no impact on day to day usage of Steam.",
      "Yes",
      "No"
    );
        
    if (disableCEF) {
      await RustInterop.disableSteamCEFDebugging();
    }

    await restartApp(AppController.saveChanges.bind(AppController));
  }

  static async getUsers() {
    
  }
  
  static async getApps() {
    
  }
  
  static async getFilterData() {
    
  }
}