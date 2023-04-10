/**
 * Steam Art Manager is a tool for setting the artwork of your Steam library.
 * Copyright (C) 2023 Travis Lane (Tormak)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>
 */
import { dialog, fs, http } from "@tauri-apps/api";
import { ToastController } from "./ToastController";
import { SettingsManager } from "../utils/SettingsManager";
import { LogController } from "./LogController";
import { get } from "svelte/store";
import { GridTypes, appLibraryCache, canSave, gridType, hiddenGameIds, isOnline, needsSGDBAPIKey, needsSteamKey, originalAppLibraryCache, selectedGameAppId, selectedGameName, steamGames, steamGridDBKey, steamKey } from "../../Stores";
import { CacheController } from "./CacheController";
import { RustInterop } from "./RustInterop";
import { toast } from "@zerodevx/svelte-toast";
import SetApiKeyToast from "../../components/toast-modals/SetApiKeyToast.svelte";
import type { SGDBImage } from "../models/SGDB";
import { xml2json } from "../utils/xml2json";

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
  private static domParser = new DOMParser();

  /**
   * Sets up the AppController.
   * ? Logging complete.
   */
  static async setup(): Promise<void> {
    await SettingsManager.setSettingsPath();
    let settings: AppSettings = await SettingsManager.getSettings();

    if (settings.steamGridDbApiKey != "") {
      steamGridDBKey.set(settings.steamGridDbApiKey);
      needsSGDBAPIKey.set(false);
    }
    
    if (settings.steamApiKey != "") {
      steamKey.set(settings.steamApiKey);
      needsSteamKey.set(false);
    }

    hiddenGameIds.set(settings.hiddenGameIds);
    LogController.log("App setup complete.");
  }

  /**
   * Sets up the AppController.
   * ? Logging complete.
   */
  static async init(): Promise<void> {
    const appIsOnline = get(isOnline);
    LogController.log(`App loaded. IsOnline: ${appIsOnline}.`);

    AppController.getUserSteamApps();

    if (get(needsSGDBAPIKey)) {
      AppController.showApiKeyToast();
    }

    const shortcuts = await RustInterop.readShortcutsVdf();
    console.log("Shortcuts:", shortcuts);
  }
  
  /**
   * Filters and structures the library grids based on the app's needs.
   * @param gridsDirContents The contents of the grids dir.
   * @returns The filtered and structured grids dir.
   * ? Logging complete.
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
   * ? Logging complete.
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
   * Gets the steam game image data.
   * @returns A promise resolving to the image data.
   */
  private static async getCacheData(): Promise<{ [appid: string]: LibraryCacheEntry }> {
    const gridDirContents = (await fs.readDir(await RustInterop.getGridsDirectory()));
    const filteredGrids = AppController.filterGridsDir(gridDirContents);
    LogController.log("Grids loaded.");

    const libraryCacheContents = (await fs.readDir(await RustInterop.getLibraryCacheDirectory()));
    const filteredCache = AppController.filterLibraryCache(libraryCacheContents, filteredGrids);
    LogController.log("Library Cache loaded.");

    return filteredCache;
  }

  /**
   * Gets the current user's steam games from their community profile.
   * @param bUserId The u64 id of the current user.
   * @returns A promise resolving to a list of steam games.
   */
  private static async getGamesFromSteamCommunity(bUserId: BigInt): Promise<SteamGame[]> {
    const publicGamesXml = await http.fetch<string>(`https://steamcommunity.com/profiles/${bUserId}/games?xml=1`, {
      method: "GET",
      responseType: http.ResponseType.Text
    });
    const xmlData = AppController.domParser.parseFromString(publicGamesXml.data, "text/xml");
    const jsonStr = xml2json(xmlData, "");
    const games = JSON.parse(jsonStr);

    return games.gamesList.games.game.map((game: any) => {
      return {
        "appid": parseInt(game.appID),
        "name": game.name["#cdata"]
      }
    }).sort((gameA: SteamGame, gameB: SteamGame) => gameA.name.localeCompare(gameB.name));
  }

  /**
   * Gets the current user's steam games from the Steam Web API.
   * @param bUserId The u64 id of the current user.
   * @returns A promise resolving to a list of steam games.
   */
  private static async getGamesFromSteamAPI(bUserId: BigInt): Promise<SteamGame[]> {
    const res = await http.fetch<any>(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${get(steamKey)}&steamid=${bUserId}&format=json&include_appinfo=true&include_played_free_games=true`);

    if (res.ok) {
      console.log(res);
      return Object.entries(res.data.response).map(([appid, game]: [any, any]) => {
        return {
          "appid": appid,
          "name": game.name
        }
      }).sort((gameA: SteamGame, gameB: SteamGame) => gameA.name.localeCompare(gameB.name));
    } else {
      const xmlData = AppController.domParser.parseFromString(res.data, "text/xml");
      const jsonStr = xml2json(xmlData, "");
      const err = JSON.parse(jsonStr);

      console.error(`Fetch Error: Status ${res.status}. Message: ${JSON.stringify(err)}.`);
      ToastController.showWarningToast("Check your Steam API Key");
      LogController.warn(`Fetch Error: Status ${res.status}. Message: ${JSON.stringify(err)}. User should check their Steam API Key.`);
      return [];
    }
  }

  /**
   * Gets the current user's steam games by reading the appinfo.vdf.
   * @returns A promise resolving to a list of steam games.
   */
  private static async getGamesFromAppinfo(): Promise<SteamGame[]> {
    const vdf = await RustInterop.readAppinfoVdf();

    return vdf.entries.map((game: any) => {
      return {
        "appid": game.id,
        "name": game.entries.common.name.replace(/[^\x00-\x7F]/g, "")
      } as SteamGame;
    }).sort((gameA: SteamGame, gameB: SteamGame) => gameA.name.localeCompare(gameB.name));
  }

  /**
   * Gets the user's steam apps.
   * ? Logging complete.
   */
  static async getUserSteamApps(): Promise<void> {
    const online = get(isOnline);
    const needsSteamAPIKey = get(needsSteamKey);
    const id = ToastController.showLoaderToast("Loading games...");
    LogController.log("Getting steam games...");

    const filteredCache = await AppController.getCacheData();

    originalAppLibraryCache.set(JSON.parse(JSON.stringify(filteredCache)));
    appLibraryCache.set(filteredCache);

    const filteredKeys = Object.keys(filteredCache);
    
    const userId = await RustInterop.getActiveUser();
    const bUserId = BigInt(userId) + 76561197960265728n
    
    const publicGames = (await this.getGamesFromSteamCommunity(bUserId)).filter((entry: SteamGame) => filteredKeys.includes(entry.appid.toString()) && !entry.name.toLowerCase().includes("soundtrack"));
    console.log("Public Games:", publicGames);

    const apiGames = (await this.getGamesFromSteamAPI(bUserId)).filter((entry: SteamGame) => filteredKeys.includes(entry.appid.toString()));
    console.log("Steam API Games:", apiGames);

    const appinfoGames = (await this.getGamesFromAppinfo()).filter((entry: SteamGame) => filteredKeys.includes(entry.appid.toString()));
    console.log("Appinfo Games:", appinfoGames);

    if (online && !needsSteamAPIKey) {
      // get games from steam api
    } else if (online) {
      // TODO: check if profile is visible
      const profileIsVisible = false;
      if (profileIsVisible) {
        // get games from steam community
      } else {
        // prompt user saying their profile is not visible, and to either change that, provide a SteamAPI key, or use the flawed method
      }
    } else {
      //prompt user saying they are offline, and ask if they want to use the flawed method, warning it is especially unreliable for large libraries.
    }

    steamGames.set(publicGames);
    
    ToastController.remLoaderToast(id);
    ToastController.showSuccessToast("Games Loaded!");
    LogController.log("Steam games loaded.");
  }

  /**
   * Saves the current changes
   * ? Logging complete.
   */
  static async saveChanges(): Promise<void> {
    LogController.log("Saving changes...");

    const originalCache = get(originalAppLibraryCache);
    const libraryCache = get(appLibraryCache);
    const changedPaths = await RustInterop.saveChanges(libraryCache, originalCache);
    
    if ((changedPaths as any).error !== undefined) {
      ToastController.showSuccessToast("Changes failed.");
      LogController.log("Changes failed.");
    } else {
      for (const changedPath of (changedPaths as ChangedPath[])) {
        libraryCache[changedPath.appId][changedPath.gridType] = changedPath.targetPath;
      }
      originalAppLibraryCache.set(libraryCache);
      appLibraryCache.set(libraryCache);
      ToastController.showSuccessToast("Changes saved!");
      LogController.log("Saved changes.");
    }

    canSave.set(false);
  }

  /**
   * Discards the current changes
   * ? Logging complete.
   */
  static async discardChanges(): Promise<void> {
    const originalImgs = get(originalAppLibraryCache);
    appLibraryCache.set({...originalImgs});

    ToastController.showSuccessToast("Changes discarded!");
    LogController.log("Discarded changes.");
    
    canSave.set(false);
  }

  /**
   * Sets the provided art for the current game and grid type.
   * @param path The path of the new art.
   * ? Logging complete.
   */
  static async setCustomArt(path: string): Promise<void> {
    const selectedGameId = get(selectedGameAppId);
    const gameName = get(selectedGameName);
    const selectedGridType = get(gridType);
    const gameImages = get(appLibraryCache);
    gameImages[selectedGameId][selectedGridType] = path;

    appLibraryCache.set(gameImages);
    canSave.set(true);

    LogController.log(`Set ${selectedGridType} for ${gameName} (${selectedGameId}) to ${path}.`);
  }

  /**
   * Sets the image for a game to the provided image.
   * @param appId The id of the grid.
   * @param url The url of the SteamGridDB image.
   * ? Logging complete.
   */
  static async setSteamGridArt(appId: number, url: URL): Promise<void> {
    const localPath = await AppController.cacheController.getGridImage(appId, url.toString());
    
    const selectedGameId = get(selectedGameAppId);
    const gameName = get(selectedGameName);
    const selectedGridType = get(gridType);
    const gameImages = get(appLibraryCache);
    gameImages[selectedGameId][selectedGridType] = localPath;

    appLibraryCache.set(gameImages);
    canSave.set(true);

    LogController.log(`Set ${selectedGridType} for ${gameName} (${selectedGameId}) to ${localPath}.`);
  }

  /**
   * Prompts the user to select a .zip file containing steam game art.
   * ? Logging complete.
   */
  static async importGrids(): Promise<void> {
    LogController.log("Prompting user to grids.");
    const succeeded = await RustInterop.importGridsFromZip();

    if (succeeded) {
      ToastController.showSuccessToast("Import successful!");
      LogController.log("Successfully imported user's grids.");

      const filteredCache = await AppController.getCacheData();
      originalAppLibraryCache.set(filteredCache);
      appLibraryCache.set(filteredCache);
    } else {
      ToastController.showWarningToast("Cancelled.");
      LogController.log("Import grids cancelled.");
    }
  }

  /**
   * Exports the user's grids directory to a .zip file and prompts them to save.
   * ? Logging complete.
   */
  static async exportGrids(): Promise<void> {
    LogController.log("Prompting user to export.");
    const succeeded = await RustInterop.exportGridsToZip();

    if (succeeded) {
      ToastController.showSuccessToast("Export successful!");
      LogController.log("Successfully exported user's grids.");
    } else {
      ToastController.showWarningToast("Cancelled.");
      LogController.log("Export grids cancelled.");
    }
  }

  /**
   * Gets a list of grids for the provided game.
   * @param appId The id of the app to get.
   * @returns A promise resolving to a list of the results.
   * ? Logging complete.
   */
  static async getSteamGridArt(appId: number): Promise<SGDBImage[]> {
    return await AppController.cacheController.fetchGrids(appId);
  }

  /**
   * Function run on app closing/refreshing.
   * ? Logging complete.
   */
  static async destroy(): Promise<void> {
    await AppController.cacheController.destroy();
    LogController.log("App destroyed.");
  }

  /**
   * Checks if the app can go online, goes online if so, otherwise notifies the user.
   * ? Logging complete.
   */
  static async tryGoOnline(): Promise<void> {
    LogController.log("Attempting to go online...");
    if (navigator.onLine) {
      isOnline.set(true);
      ToastController.showSuccessToast("Now Online!");
      LogController.log("Attempted succeeded. Now online.")
    } else {
      ToastController.showWarningToast("Can't go online.");
      LogController.log("Attempt failed. Continuing in offline mode.");
    }
  }

  /**
   * Reloads the app.
   * ? Logging complete.
   */
  static async reload(): Promise<void> {
    LogController.log(`Reloading...`);
    await AppController.init();
  }

  /**
   * Prompts the user to decide if they want to continue offline.
   * @returns A promise resolving to the user's decisions.
   * ? Logging complete.
   */
  static async promptOffline(): Promise<boolean> {
    LogController.log("Notifying user that they are offline...");
    return await dialog.ask("You are offline. Steam Art Manager won't work properly/fully. Do you want to continue?", {
      title: "No Internet Connection",
      type: "warning"
    });
  }

  /**
   * Shows a toast prompting the user to set their steamgrid api key.
   * ? Logging complete.
   */
  static showApiKeyToast(): void {
    LogController.log("Showing setApiKey toast.");
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
}