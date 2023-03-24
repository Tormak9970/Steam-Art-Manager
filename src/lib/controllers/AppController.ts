import { dialog, fs } from "@tauri-apps/api";
import { ToastController } from "./ToastController";
import { SettingsManager } from "../utils/SettingsManager";
import { LogController } from "./LogController";
import { get } from "svelte/store";
import { appLibraryCache, isOnline, needsAPIKey, steamGames, steamGridDBKey } from "../../Stores";
import { CacheController } from "./CacheController";
import { RustInterop } from "./RustInterop";
import { toast } from "@zerodevx/svelte-toast";
import ConfirmToast from "../../components/toast-modals/ConfirmToast.svelte";
import SetApiKeyToast from "../../components/toast-modals/SetApiKeyToast.svelte";
import { SteamGridController } from "./SteamGridController";
import { Vdf } from "../models/Vdf";
import { Reader } from "../utils/Reader";

/**
 * The main controller for the application
 */
export class AppController {
  private static cacheController = new CacheController();
  private static steamGridController = new SteamGridController(AppController.cacheController);

  /**
   * Sets up the AppController.
   */
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

    AppController.getUserSteamApps();

    if (get(needsAPIKey)) {
      AppController.showApiKeyToast();
    }
  }

  private static setLibraryCache(libraryCacheContents: fs.FileEntry[]) {
    const res: { [appid: string]: LibraryCacheEntry } = {};
    // appLibraryCache.set(libraryCacheContents.map(entry => entry.path));

    appLibraryCache.set(res);
  }

  /**
   * Gets the user's steam apps.
   */
  static async getUserSteamApps(): Promise<void> {
    const id = ToastController.showLoaderToast("Loading games...");
    LogController.log("Getting steam games...");

    const buffer = await fs.readBinaryFile(await RustInterop.getAppinfoPath());
    const vdf = new Vdf(new Reader(buffer), true);
    
    ToastController.remLoaderToast(id);
    ToastController.showSuccessToast("Games Loaded!");
    LogController.log("Steam games loaded");

    const libraryCacheContents = (await fs.readDir(await RustInterop.getLibraryCacheDirectory()));
    AppController.setLibraryCache(libraryCacheContents);
    const realGames = vdf.entries.filter((entry) => libraryCacheContents.some((file) => file.name.includes(entry.id)));

    steamGames.set(realGames.map((game) => {
      return {
        "appid": game.id,
        "name": game.entries.common.name
      } as SteamGame;
    }));
  }

  static hideGame(appId: string): void {

  }

  /**
   * Saves the current changes
   */
  static async saveChanges(): Promise<void> {
    
    ToastController.showSuccessToast("Changes saved!");
    LogController.log("Saved changes.");
  }

  /**
   * Discards the current changes
   */
  static async discardChanges(): Promise<void> {
    
    ToastController.showSuccessToast("Changes discarded!");
    LogController.log("Discarded changes.");
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

  /**
   * Shows a toast prompting the user to set their steamgrid api key.
   */
  static showApiKeyToast(): void {
    // @ts-ignore
    toast.push({
      component: {
        src: SetApiKeyToast,
        sendIdTo: 'toastId'
      },
      target: "top",
      dismissable: false,
      initial: 0,
      intro: { y: -192 },
      theme: {
        '--toastPadding': '0',
        '--toastBackground': 'transparent',
        '--toastMsgPadding': '0'
      }
    });
  }

  /**
   * Shows the empty cache confirm toast.
   */
  static showEmptyCacheToast(): void {
    // @ts-ignore
    toast.push({
      component: {
        src: ConfirmToast,
        props: {
          "message": "Are you sure you want to empty the cache? This will mean refetching all cached game info and images.",
          "onConfirm": AppController.emptyCache.bind(AppController),
          "confirmMessage": "Cache emptied"
        },
        sendIdTo: 'toastId'
      },
      target: "top",
      dismissable: false,
      initial: 0,
      intro: { y: -192 },
      theme: {
        '--toastPadding': '0',
        '--toastBackground': 'transparent',
        '--toastMsgPadding': '0'
      }
    });
  }
}