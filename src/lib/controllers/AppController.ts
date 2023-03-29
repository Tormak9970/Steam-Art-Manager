import { dialog, fs } from "@tauri-apps/api";
import { ToastController } from "./ToastController";
import { SettingsManager } from "../utils/SettingsManager";
import { LogController } from "./LogController";
import { get } from "svelte/store";
import { GridTypes, appLibraryCache, canSave, gridType, hiddenGameIds, isOnline, needsAPIKey, originalAppLibraryCache, selectedGameAppId, steamGames, steamGridDBKey } from "../../Stores";
import { CacheController } from "./CacheController";
import { RustInterop } from "./RustInterop";
import { toast } from "@zerodevx/svelte-toast";
import ConfirmToast from "../../components/toast-modals/ConfirmToast.svelte";
import SetApiKeyToast from "../../components/toast-modals/SetApiKeyToast.svelte";
import { SteamGridController } from "./SteamGridController";

const gridTypeLUT = {
  "capsule": GridTypes.CAPSULE,
  "wide_capsule": GridTypes.WIDE_CAPSULE,
  "hero": GridTypes.HERO,
  "icon": GridTypes.ICON,
  "logo": GridTypes.LOGO
}

const libraryCacheLUT = {
  "library_600x900": GridTypes.CAPSULE,
  "header": GridTypes.WIDE_CAPSULE,
  "library_hero": GridTypes.HERO,
  "icon": GridTypes.ICON,
  "logo": GridTypes.LOGO
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

    hiddenGameIds.set(settings.hiddenGameIds);
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
   * Filters and structures the library grids based on the app's needs.
   * @param gridsDirContents The contents of the grids dir.
   * @returns The filtered and structured grids dir.
   */
  private static filterGridsDir(gridsDirContents: fs.FileEntry[]): { [appid: string]: LibraryCacheEntry } {
    let resKeys = [];
    const res: { [appid: string]: LibraryCacheEntry } = {};

    for (const fileEntry of gridsDirContents) {
      const firstUnderscore = fileEntry.name.indexOf("_") > 0 ? fileEntry.name.indexOf("_") : fileEntry.name.indexOf(".") - 1;
      const appId = fileEntry.name.substring(0, firstUnderscore);
      let type = "";
      if (fileEntry.name.indexOf("_") > 0) {
        type = fileEntry.name.substring(firstUnderscore + 1, fileEntry.name.indexOf("."));
      } else {
        type = (fileEntry.name.includes("p")) ? "capsule" : "wide_capsule";
      }

      if (gridTypeLUT[type]) {
        if (!resKeys.includes(appId)) {
          resKeys.push(appId);
          res[appId] = {} as LibraryCacheEntry;
        }
        res[appId][gridTypeLUT[type]] = fileEntry.path;
      }
    }

    return res;
  }

  /**
   * Filters and structures the library cache based on the app's needs.
   * @param libraryCacheContents The contents of the library cache.
   * @param gridsInfos The filtered grid infos.
   * @returns The filtered and structured library cache.
   */
  private static filterLibraryCache(libraryCacheContents: fs.FileEntry[], gridsInfos: { [appid: string]: LibraryCacheEntry }): { [appid: string]: LibraryCacheEntry } {
    let resKeys = Object.keys(gridsInfos);
    const res: { [appid: string]: LibraryCacheEntry } = gridsInfos;

    for (const fileEntry of libraryCacheContents) {
      const firstUnderscore = fileEntry.name.indexOf("_");
      const appId = fileEntry.name.substring(0, firstUnderscore);
      const type = fileEntry.name.substring(firstUnderscore + 1, fileEntry.name.indexOf("."));

      if (libraryCacheLUT[type]) {
        if (!resKeys.includes(appId)) {
          resKeys.push(appId);
          res[appId] = {} as LibraryCacheEntry;
        }
        if (!Object.keys(res[appId]).includes(libraryCacheLUT[type])) res[appId][libraryCacheLUT[type]] = fileEntry.path;
      }
    }

    const entries = Object.entries(res);
    const filtered = entries.filter(([_, entry]) => Object.keys(entry).length >= 4);
    return Object.fromEntries(filtered);
  }

  /**
   * Gets the user's steam apps.
   */
  static async getUserSteamApps(): Promise<void> {
    const id = ToastController.showLoaderToast("Loading games...");
    LogController.log("Getting steam games...");

    const vdf = await RustInterop.readAppinfoVdf();
    
    ToastController.remLoaderToast(id);
    ToastController.showSuccessToast("Games Loaded!");
    LogController.log("Steam games loaded");

    const gridDirContents = (await fs.readDir(await RustInterop.getGridsDirectory()));
    const filteredGrids = AppController.filterGridsDir(gridDirContents);

    const libraryCacheContents = (await fs.readDir(await RustInterop.getLibraryCacheDirectory()));
    const filteredCache = AppController.filterLibraryCache(libraryCacheContents, filteredGrids);
    originalAppLibraryCache.set(filteredCache);
    appLibraryCache.set(filteredCache);

    const filteredKeys = Object.keys(filteredCache);
    const realGames = vdf.entries.filter((entry) => filteredKeys.includes(entry.id.toString()));

    steamGames.set(realGames.map((game) => {
      return {
        "appid": game.id,
        "name": game.entries.common.name.replace(/[^\x00-\x7F]/g, "")
      } as SteamGame;
    }).sort((gameA: SteamGame, gameB: SteamGame) => gameA.name.localeCompare(gameB.name)));
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
    appLibraryCache.set(get(originalAppLibraryCache));
    ToastController.showSuccessToast("Changes discarded!");
    LogController.log("Discarded changes.");
  }


  static async setCustomArt(path: string): Promise<void> {
    const selectedGameId = get(selectedGameAppId);
    const selectedGridType = get(gridType);
    const gameImages = get(appLibraryCache);
    gameImages[selectedGameId][selectedGridType] = path;

    appLibraryCache.set(gameImages);
    canSave.set(true);

    LogController.log(`Set ${selectedGridType} for ${get(steamGames)[selectedGameId]} to ${path}.`);
  }

  /**
   * Prompts the user to select a .zip file containing steam game art.
   */
  static async importGrids(): Promise<void> {
    const succeeded = await RustInterop.importGridsFromZip();
    // TODO: reload appCache

    if (succeeded) {
      ToastController.showSuccessToast("Import successful!");
      //TODO: reload images and empty cache.
    } else {
      ToastController.showWarningToast("Cancelled.");
    }
  }

  /**
   * Exports the user's grids directory to a .zip file and prompts them to save.
   */
  static async exportGrids(): Promise<void> {
    const succeeded = await RustInterop.exportGridsToZip();

    if (succeeded) {
      ToastController.showSuccessToast("Export successful!");
    } else {
      ToastController.showWarningToast("Cancelled.");
    }
  }

  static async emptyCache(): Promise<void> {
    
  }

  /**
   * Function run on app closing/refreshing.
   */
  static onDestroy(): void {
    
  }

  /**
   * Checks if the app can go online, goes online if so, otherwise notifies the user.
   */
  static async tryGoOnline(): Promise<void> {
    if (navigator.onLine) {
      isOnline.set(true);
      ToastController.showSuccessToast("Now Online!");
    } else {
      ToastController.showWarningToast("Can't go online.");
    }
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