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
import { GridTypes, Platforms, activeUserId, appLibraryCache, canSave, currentPlatform, gridType, hiddenGameIds, isOnline, loadingGames, needsSGDBAPIKey, needsSteamKey, nonSteamGames, originalAppLibraryCache, originalSteamShortcuts, selectedGameAppId, selectedGameName, steamGames, steamGridDBKey, steamKey, steamShortcuts, steamUsers } from "../../Stores";
import { CacheController } from "./CacheController";
import { RustInterop } from "./RustInterop";
import type { SGDBImage } from "../models/SGDB";
import { xml2json } from "../utils/xml2json";
import { WindowController } from "./WindowController";

import { createTippy, type Tippy } from 'svelte-tippy';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/svg-arrow.css';
import { hideAll, type Instance, type Props } from "tippy.js";

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
  private static tippyInstance = null;

  static tippy = createTippy({
    hideOnClick: false,
    duration: 100
  });

  static onTippyShow(instance: Instance<Props>): void {
    if (AppController.tippyInstance) {
      hideAll();
    }

    AppController.tippyInstance = instance;
  }

  /**
   * Sets up the AppController.
   * ? Logging complete.
   */
  static async setup(): Promise<void> {
    WindowController.mainWindow.setFocus();

    const users = await RustInterop.getSteamUsers();
    steamUsers.set(users);

    const activeUser = Object.values(users).find((user) => user.MostRecent == "1");
    activeUserId.set(parseInt(activeUser.id32));
    
    await SettingsManager.setSettingsPath();
    let settings: AppSettings = await SettingsManager.getSettings();

    if (settings.steamGridDbApiKey != "") {
      steamGridDBKey.set(settings.steamGridDbApiKey);
      needsSGDBAPIKey.set(false);
    }
    
    if (settings.steamApiKeyMap[activeUser.id32] && settings.steamApiKeyMap[activeUser.id32] != "") {
      steamKey.set(settings.steamApiKeyMap[activeUser.id32]);
      needsSteamKey.set(false);
    }

    hiddenGameIds.set(settings.hiddenGameIds);

    if (activeUser.id32 == "0") {
      ToastController.showGenericToast("User id was 0, try opening steam then restart the manager")
    }

    LogController.log("App setup complete.");
  }

  /**
   * Sets up the AppController.
   * ? Logging complete.
   */
  static async init(): Promise<void> {
    const appIsOnline = get(isOnline);
    LogController.log(`App loaded. IsOnline: ${appIsOnline}.`);

    loadingGames.set(true);
    AppController.getUserApps().then(() => {
      loadingGames.set(false);
    });

    if (get(needsSGDBAPIKey)) {
      WindowController.openSettingsWindow();
    }
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
   * @param shortcuts The list of loaded shortcuts
   * @returns The filtered and structured library cache.
   * ? Logging complete.
   */
  private static filterLibraryCache(libraryCacheContents: fs.FileEntry[], gridsInfos: { [appid: string]: LibraryCacheEntry }, shortcuts: GameStruct[]): { [appid: string]: LibraryCacheEntry } {
    let resKeys = Object.keys(gridsInfos);
    const shortcutIds = Object.values(shortcuts).map((shortcut) => shortcut.appid.toString());
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
    const filtered = entries.filter(([appId, entry]) => Object.keys(entry).length >= 4 || shortcutIds.includes(appId));
    return Object.fromEntries(filtered);
  }

  /**
   * Gets the steam game image data.
   * @param shortcuts The list of non steam games.
   * @returns A promise resolving to the image data.
   */
  private static async getCacheData(shortcuts: GameStruct[]): Promise<{ [appid: string]: LibraryCacheEntry }> {
    const gridDirContents = (await fs.readDir(await RustInterop.getGridsDirectory(get(activeUserId).toString())));
    const filteredGrids = AppController.filterGridsDir(gridDirContents);
    LogController.log("Grids loaded.");

    const libraryCacheContents = (await fs.readDir(await RustInterop.getLibraryCacheDirectory()));
    const filteredCache = AppController.filterLibraryCache(libraryCacheContents, filteredGrids, shortcuts);
    LogController.log("Library Cache loaded.");

    return filteredCache;
  }

  /**
   * Gets the current user's steam games from their community profile.
   * @param bUserId The u64 id of the current user.
   * @returns A promise resolving to a list of steam games.
   * ? Logging complete.
   */
  private static async getGamesFromSteamCommunity(bUserId: BigInt): Promise<GameStruct[]> {
    LogController.log(`Loading games from Steam Community page...`);

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
    }).sort((gameA: GameStruct, gameB: GameStruct) => gameA.name.localeCompare(gameB.name));
  }

  /**
   * Gets the current user's steam games from the Steam Web API.
   * @param bUserId The u64 id of the current user.
   * @returns A promise resolving to a list of steam games.
   * ? Logging complete.
   */
  private static async getGamesFromSteamAPI(bUserId: BigInt): Promise<GameStruct[]> {
    LogController.log(`Loading games from Steam API...`);

    const res = await http.fetch<any>(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${get(steamKey)}&steamid=${bUserId}&format=json&include_appinfo=true&include_played_free_games=true`);

    if (res.ok) {
      return res.data.response.games.map((game: any) => {
        return {
          "appid": game.appid,
          "name": game.name
        }
      }).sort((gameA: GameStruct, gameB: GameStruct) => gameA.name.localeCompare(gameB.name));
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
   * ? Logging complete.
   */
  private static async getGamesFromAppinfo(): Promise<GameStruct[]> {
    LogController.log(`Loading games from appinfo.vdf...`);

    const vdf = await RustInterop.readAppinfoVdf();

    return vdf.entries.map((game: any) => {
      return {
        "appid": game.id,
        "name": game.entries.common.name.replace(/[^\x00-\x7F]/g, "")
      } as GameStruct;
    }).sort((gameA: GameStruct, gameB: GameStruct) => gameA.name.localeCompare(gameB.name));
  }

  /**
   * Gets the user's apps.
   * ? Logging complete.
   */
  static async getUserApps(): Promise<void> {
    const online = get(isOnline);
    const needsSteamAPIKey = get(needsSteamKey);
    const id = ToastController.showLoaderToast("Loading games...");
    
    const userId = get(activeUserId);
    const bUserId = BigInt(userId) + 76561197960265728n;

    LogController.log("Loading non-steam games...");
    const shortcuts = await RustInterop.readShortcutsVdf(userId.toString());
    originalSteamShortcuts.set(JSON.parse(JSON.stringify(Object.values(shortcuts))));
    steamShortcuts.set(Object.values(shortcuts));
    
    const structuredShortcuts = Object.values(shortcuts).map((shortcut: any) => {
      return {
        "appid": shortcut.appid,
        "name": shortcut.AppName
      };
    });
    nonSteamGames.set(structuredShortcuts);
    LogController.log("Loaded non-steam games.");

    LogController.log("Getting steam games...");

    const filteredCache = await AppController.getCacheData(structuredShortcuts);

    originalAppLibraryCache.set(JSON.parse(JSON.stringify(filteredCache)));
    appLibraryCache.set(filteredCache);

    const filteredKeys = Object.keys(filteredCache);

    if (online && !needsSteamAPIKey) {
      const apiGames = (await this.getGamesFromSteamAPI(bUserId)).filter((entry: GameStruct) => filteredKeys.includes(entry.appid.toString()));
      console.log("Steam API Games:", apiGames);
      steamGames.set(apiGames);
      
      LogController.log(`Loaded ${apiGames.length} games from Steam API.`);
      LogController.log("Steam games loaded.");
    } else if (online) {
      try {
        const publicGames = (await this.getGamesFromSteamCommunity(bUserId)).filter((entry: GameStruct) => filteredKeys.includes(entry.appid.toString()) && !entry.name.toLowerCase().includes("soundtrack"));
        console.log("Public Games:", publicGames);
        steamGames.set(publicGames);
        
        LogController.log(`Loaded ${publicGames.length} games from Steam Community page.`);
        LogController.log("Steam games loaded.");
      } catch (err: any) {
        LogController.log(`Error occured while loading games from Steam Community page, notifying user.`);
        ToastController.showWarningToast("You profile is private");
        // TODO: consider prompting user here
        const appinfoGames = (await this.getGamesFromAppinfo()).filter((entry: GameStruct) => filteredKeys.includes(entry.appid.toString()));
        console.log("Appinfo Games:", appinfoGames);
        steamGames.set(appinfoGames);
        
        LogController.log(`Loaded ${appinfoGames.length} games from appinfo.vdf.`);
        LogController.log("Steam games loaded.");
      }
    } else {
      const appinfoGames = (await this.getGamesFromAppinfo()).filter((entry: GameStruct) => filteredKeys.includes(entry.appid.toString()));
      console.log("Appinfo Games:", appinfoGames);
      steamGames.set(appinfoGames);
      
      LogController.log(`Loaded ${appinfoGames.length} games from appinfo.vdf.`);
      LogController.log("Steam games loaded.");
    }
    
    ToastController.remLoaderToast(id);
    ToastController.showSuccessToast("Games Loaded!");
  }

  /**
   * Saves the current changes
   * ? Logging complete.
   */
  static async saveChanges(): Promise<void> {
    LogController.log("Saving changes...");

    const originalCache = get(originalAppLibraryCache);
    const libraryCache = get(appLibraryCache);
    const shortcuts = get(steamShortcuts);
    const shortcutIds = Object.values(shortcuts).map((shortcut) => shortcut.appid.toString());

    const changedPaths = await RustInterop.saveChanges(get(activeUserId).toString(), libraryCache, originalCache, shortcuts, shortcutIds);
    
    if ((changedPaths as any).error !== undefined) {
      ToastController.showSuccessToast("Changes failed.");
      LogController.log("Changes failed.");
    } else {
      for (const changedPath of (changedPaths as ChangedPath[])) {
        libraryCache[changedPath.appId][changedPath.gridType] = changedPath.targetPath;
        if (changedPath.gridType == GridTypes.ICON && shortcutIds.includes(changedPath.appId)) {
          const shortcut = shortcuts.find((s) => s.appid.toString() == changedPath.appId);
          shortcut.icon = changedPath.targetPath;
        }
      }
      originalAppLibraryCache.set(JSON.parse(JSON.stringify(libraryCache)));
      appLibraryCache.set(libraryCache);
      
      originalSteamShortcuts.set(JSON.parse(JSON.stringify(shortcuts)));
      steamShortcuts.set(shortcuts);
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
    const originalCache = get(originalAppLibraryCache);
    appLibraryCache.set(JSON.parse(JSON.stringify(originalCache)));

    const originalShortcuts = get(originalSteamShortcuts);
    steamShortcuts.set(JSON.parse(JSON.stringify(originalShortcuts)));

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

    if (get(currentPlatform) == Platforms.NON_STEAM) {
      const shortcuts = get(steamShortcuts);
      const shortcut = shortcuts.find((s) => s.appid == selectedGameId);
      shortcut.icon = path;
      steamShortcuts.set(shortcuts);
    }

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
    
    if (get(currentPlatform) == Platforms.NON_STEAM) {
      const shortcuts = get(steamShortcuts);
      const shortcut = shortcuts.find((s) => s.appid == selectedGameId);
      shortcut.icon = localPath;
      steamShortcuts.set(shortcuts);
    }

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
    const succeeded = await RustInterop.importGridsFromZip(get(activeUserId).toString());

    if (succeeded) {
      ToastController.showSuccessToast("Import successful!");
      LogController.log("Successfully imported user's grids.");

      const filteredCache = await AppController.getCacheData(get(nonSteamGames));
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
    const succeeded = await RustInterop.exportGridsToZip(get(activeUserId).toString());

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
   * @param selectedSteamGridName Optional name of the current steamGridGame's name.
   * @returns A promise resolving to a list of the results.
   * ? Logging complete.
   */
  static async getSteamGridArt(appId: number, selectedSteamGridName?: string): Promise<SGDBImage[]> {
    return await AppController.cacheController.fetchGrids(appId, selectedSteamGridName);
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
   * Changes the currently selected steam user.
   * @param userPersonaName The name of the new user.
   * ? Logging complete.
   */
  static async changeSteamUser(userPersonaName: string): Promise<void> {
    const users = get(steamUsers);
    const user = Object.values(users).find((user) => user.PersonaName == userPersonaName);
    const oldUserId = get(activeUserId);
    const userId = parseInt(user.id32);

    if (userId != oldUserId) {
      const shouldContinue = await dialog.confirm("Switching users will discard your changes, are you sure you want to continue?", {
        title: "Confirm user change",
        type: "warning"
      });

      if (shouldContinue) {
        await AppController.discardChanges();

        activeUserId.set(userId);

        const settings = await SettingsManager.getSettings();
        if (settings.steamApiKeyMap[userId] && settings.steamApiKeyMap[userId] != "") {
          steamKey.set(settings.steamApiKeyMap[userId]);
        } else {
          steamKey.set("");
          needsSteamKey.set(true);
          await dialog.message("No Steam Key found for this user. Consider adding one in settings.", {
            title: "Missing Steam API Key"
          });
        }

        loadingGames.set(true);
        AppController.getUserApps().then(() => {
          loadingGames.set(false);
          LogController.log(`Switched user to ${user.AccountName} id: ${userId}.`);
          ToastController.showSuccessToast("Switched User!");
        });
      } else {
        LogController.log(`Cancelled user switch to ${user.AccountName} id: ${userId}.`);
        ToastController.showGenericToast("Cancelled.");
      }
    } else {
      LogController.log(`New user id ${userId} matched old id ${oldUserId}.`);
    }
  }
}