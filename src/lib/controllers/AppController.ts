import { dialog, fs } from "@tauri-apps/api";
import { ToastController } from "./ToastController";
import { SettingsManager } from "../utils/SettingsManager";
import { LogController } from "./LogController";
import { get } from "svelte/store";
import { GridTypes, appLibraryCache, isOnline, needsAPIKey, steamGames, steamGridDBKey } from "../../Stores";
import { CacheController } from "./CacheController";
import { RustInterop } from "./RustInterop";
import { toast } from "@zerodevx/svelte-toast";
import ConfirmToast from "../../components/toast-modals/ConfirmToast.svelte";
import SetApiKeyToast from "../../components/toast-modals/SetApiKeyToast.svelte";
import { SteamGridController } from "./SteamGridController";
import { Vdf } from "../models/Vdf";
import { Reader } from "../utils/Reader";

const typeLUT = {
  "library_600x900": GridTypes.GRIDS,
  "library_hero": GridTypes.HEROS,
  "icon": GridTypes.ICONS,
  "logo": GridTypes.LOGOS
}

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

  /**
   * Filters and structures the library cache based on the app's needs.
   * @param libraryCacheContents The contents of the library cache.
   * @returns The filtered and structured library cache.
   */
  private static filterLibraryCache(libraryCacheContents: fs.FileEntry[]): { [appid: string]: LibraryCacheEntry } {
    let resKeys = [];
    const res: { [appid: string]: LibraryCacheEntry } = {};

    for (const fileEntry of libraryCacheContents) {
      const firstUnderscore = fileEntry.name.indexOf("_");
      const appId = fileEntry.name.substring(0, firstUnderscore);
      const type = fileEntry.name.substring(firstUnderscore + 1, fileEntry.name.indexOf("."));

      if (typeLUT[type]) {
        if (!resKeys.includes(appId)) {
          resKeys.push(appId);
          res[appId] = {} as LibraryCacheEntry;
        }
        res[appId][typeLUT[type]] = fileEntry.path;
      }
    }

    const entries = Object.entries(res);
    const filtered = entries.filter(([_, entry]) => Object.keys(entry).length == 4);
    return Object.fromEntries(filtered);
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
    const filteredCache = AppController.filterLibraryCache(libraryCacheContents);
    appLibraryCache.set(filteredCache);

    const filteredKeys = Object.keys(filteredCache);
    const realGames = vdf.entries.filter((entry) => filteredKeys.includes(entry.id.toString()));

    steamGames.set(realGames.map((game) => {
      return {
        "appid": game.id,
        "name": game.entries.common.name.replace(/[^\x00-\x7F]/g, "")
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