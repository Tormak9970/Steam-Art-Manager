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
import { fs, path } from "@tauri-apps/api";
import { appCacheDir } from '@tauri-apps/api/path';

import { get, type Unsubscriber } from "svelte/store";
import { SGDB, type SGDBGame, type SGDBImage } from "../models/SGDB";
import { dowloadingGridId, gridType, GridTypes, steamGridSearchCache, Platforms, selectedGameName, steamGridDBKey, gridsCache, selectedSteamGridGameId, steamGridSteamAppIdMap, selectedResultPage, canSave, appLibraryCache, steamGames, nonSteamGames, steamShortcuts, dbFilters, requestTimeoutLength, manualSteamGames } from "../../stores/AppState";
import { batchApplyWasCancelled, showBatchApplyProgress, batchApplyProgress, batchApplyMessage  } from "../../stores/Modals";
import { LogController } from "./LogController";
import { RustInterop } from "./RustInterop";
import { ToastController } from "./ToastController";
import { filterGrids } from "../utils/Utils";


/**
 * Logs to the app's log file or the batch file.
 * @param message The message to log.
 * @param useCoreFile Whether or not to log to the core file.
 */
function logToFile(message: string, useCoreFile: boolean): void {
  if (useCoreFile) {
    LogController.log(message);
  } else {
    LogController.batchApplyLog(message);
  }
}

/**
 * Logs a warning to the app's log file or the batch file.
 * @param message The message to log.
 * @param useCoreFile Whether or not to log to the core file.
 */
function logWarnToFile(message: string, useCoreFile: boolean): void {
  if (useCoreFile) {
    LogController.warn(message);
  } else {
    LogController.batchApplyWarn(message);
  }
}

/**
 * Logs an error to the app's log file or the batch file.
 * @param message The message to log.
 * @param useCoreFile Whether or not to log to the core file.
 */
function logErrorToFile(message: string, useCoreFile: boolean): void {
  if (useCoreFile) {
    LogController.error(message);
  } else {
    LogController.batchApplyError(message);
  }
}

/**
 * Controller class for handling caching of requests.
 */
export class CacheController {
  private appCacheDirPath: string;
  private gridCacheDirPath: string;

  apiKeyUnsub: Unsubscriber;
  client: SGDB;
  key: string;

  /**
   * Creates a new CacheController.
   */
  constructor() {
    this.init();
  }

  /**
   * Initializes the CacheController.
   * ? Logging complete.
   */
  private async init(): Promise<void> {
    LogController.log("Initializing CacheController...");
    
    this.appCacheDirPath = await appCacheDir();
    if (!(await fs.exists(this.appCacheDirPath))) {
      await fs.createDir(this.appCacheDirPath);
      LogController.log("Created cache dir.");
    } else {
      LogController.log("Found cache dir.");
    }

    this.gridCacheDirPath = await path.join(this.appCacheDirPath, "grids");
    if (!(await fs.exists(this.gridCacheDirPath))) {
      await fs.createDir(this.gridCacheDirPath);
      LogController.log("Created grids cache dir.");
    } else {
      LogController.log("Found grids cache dir.");
    }
    
    const capsuleCacheDir = await path.join(this.gridCacheDirPath, GridTypes.CAPSULE);
    if (!(await fs.exists(capsuleCacheDir))) {
      await fs.createDir(capsuleCacheDir);
      LogController.log("Created Capsule cache dir.");
    } else {
      LogController.log("Found Capsule cache dir.");
    }

    const wideCapsuleCacheDir = await path.join(this.gridCacheDirPath, GridTypes.WIDE_CAPSULE);
    if (!(await fs.exists(wideCapsuleCacheDir))) {
      await fs.createDir(wideCapsuleCacheDir);
      LogController.log("Created Wide Capsule cache dir.");
    } else {
      LogController.log("Found Wide Capsule cache dir.");
    }

    const heroCacheDir = await path.join(this.gridCacheDirPath, GridTypes.HERO);
    if (!(await fs.exists(heroCacheDir))) {
      await fs.createDir(heroCacheDir);
      LogController.log("Created Hero cache dir.");
    } else {
      LogController.log("Found Hero cache dir.");
    }

    const logoCacheDir = await path.join(this.gridCacheDirPath, GridTypes.LOGO);
    if (!(await fs.exists(logoCacheDir))) {
      await fs.createDir(logoCacheDir);
      LogController.log("Created Logo cache dir.");
    } else {
      LogController.log("Found Logo cache dir.");
    }

    const iconCacheDir = await path.join(this.gridCacheDirPath, GridTypes.ICON);
    if (!(await fs.exists(iconCacheDir))) {
      await fs.createDir(iconCacheDir);
      LogController.log("Created Icon cache dir.");
    } else {
      LogController.log("Found Icon cache dir.");
    }

    this.apiKeyUnsub = steamGridDBKey.subscribe((key) => {
      if (key != "") {
        this.client = new SGDB(key);
        this.key = key;
      } else {
        this.client = null;
        this.key = null;
      }
    });
    
    LogController.log("Initialized CacheController.");
  }

  /**
   * Gets a image from steamGrid's cdn.
   * @param appid The id of the app whose grid is being fetched.
   * @param imageURL The url of the image to get.
   * @param useCoreFile Whether or not to log to the core log file.
   * ? Logging complete.
   */
  async getGridImage(appId: number, imageURL: string, useCoreFile = true): Promise<string> {
    const requestTimeout = get(requestTimeoutLength);
    logToFile(`Fetching image ${imageURL}...`, useCoreFile);
    const fileName = imageURL.substring(imageURL.lastIndexOf("/") + 1);
    const localImagePath = await path.join(this.gridCacheDirPath, get(gridType), fileName);

    if (!(await fs.exists(localImagePath))) {
      logToFile(`Fetching image from API.`, useCoreFile);

      dowloadingGridId.set(appId);
      const status = await RustInterop.downloadGrid(imageURL, localImagePath, requestTimeout);

      // const imageData = await http.fetch<Uint8Array>(imageURL, {
      //   method: "GET",
      //   responseType: 3,
      //   timeout: requestTimeout
      // });
      
      // await fs.writeBinaryFile(localImagePath, imageData.data);
      
      dowloadingGridId.set(null);

      switch (status) {
        case "sucess": {
          LogController.warn(`Request for ${imageURL} succeeded.`);
        }
        case "timedOut": {
          ToastController.showWarningToast(`Grid requested timed out`);
          logWarnToFile(`Request for ${imageURL} timed out after ${requestTimeout / 1000} seconds.`, useCoreFile);
          return null;
        }
        case "failed": {
          ToastController.showWarningToast("Failed to set grid.");
          logWarnToFile(`Request for ${imageURL} failed.`, useCoreFile);
          return null;
        }
      }
    } else {
      logToFile(`Cache found. Fetching image from local file system.`, useCoreFile);
    }
    
    return localImagePath;
  }

  /**
   * Gets the grids for a non steam game.
   * @param appId The id of the app to get.
   * @param type The selected grid type.
   * @param page The page of results to get.
   * @param useCoreFile Whether or not to use the core log file.
   * @returns A promise resolving to a list of grids.
   * ? Logging complete.
   */
  private async fetchGridsForGame(appId: number, type: GridTypes, page: number, useCoreFile: boolean): Promise<SGDBImage[]> {
    const gridCacheKeys = Object.keys(gridsCache);
    
    try {
      if (gridCacheKeys.includes(appId.toString())) {
        const types = Object.keys(gridsCache[appId.toString()]);
  
        if (types.includes(type)) {
          const pages = Object.keys(gridsCache[appId.toString()][type]);
  
          if (pages.includes(page.toString())) {
            logToFile(`Using in memory cache for nonSteam ${appId}'s ${type}.`, useCoreFile);
            return gridsCache[appId.toString()][type][page];
          } else {
            logToFile(`Need to fetch nonSteam ${type} for ${appId}.`, useCoreFile);
            const grids = await this.client[`get${type.includes("Capsule") ? "Grid": (type == GridTypes.HERO ? "Heroe" : type)}sById`](appId, undefined, undefined, undefined, ["static", "animated"], "any", "any", "any", page);
            gridsCache[appId.toString()][type][page.toString()] = grids;
            return grids;
          }
        } else {
          logToFile(`Need to fetch nonSteam ${type} for ${appId}.`, useCoreFile);
          const grids = await this.client[`get${type.includes("Capsule") ? "Grid": (type == GridTypes.HERO ? "Heroe" : type)}sById`](appId, undefined, undefined, undefined, ["static", "animated"], "any", "any", "any", page);
          gridsCache[appId.toString()][type] = {};
          gridsCache[appId.toString()][type][page.toString()] = grids;
          return grids;
        }
      } else {
        logToFile(`Need to fetch nonSteam ${type} for ${appId}.`, useCoreFile);
        const grids = await this.client[`get${type.includes("Capsule") ? "Grid": (type == GridTypes.HERO ? "Heroe" : type)}sById`](appId, undefined, undefined, undefined, ["static", "animated"], "any", "any", "any", page);
        gridsCache[appId.toString()] = {};
        gridsCache[appId.toString()][type] = {};
        gridsCache[appId.toString()][type][page.toString()] = grids;
        return grids;
      }
    } catch (e: any) {
      logErrorToFile(`Error fetching grids for non steam game: ${appId}. Error: ${e.message}.`, useCoreFile);
      ToastController.showWarningToast("Error fetching grids for game.");
      return [];
    }
  }

  /**
   * ! Placeholder until SGDB API V3 is live.
   * Gets the number of result pages for each game in the results list.
   * @param results The SGDBGame array.
   * @param platform The platform of the games.
   * @param type The type of grids to get.
   * ! Logging Needed?
   */
  private async getNumPages(results: SGDBGame[], platform: Platforms, type: GridTypes): Promise<void> {
    results = results.map((game) => {
      game.numResultPages = 1;
      return game;
    });
  }

  /**
   * ! This is bad for the SGDB API.
   * Gets the number of result pages for each game in the results list.
   * @param results The SGDBGame array.
   * @param platform The platform of the games.
   * @param type The type of grids to get.
   * @param useCoreFile Whether or not to use the core log file.
   * ? Logging complete.
   */
  private async cacheAllGridsForGame(results: SGDBGame[], platform: Platforms, type: GridTypes, useCoreFile: boolean): Promise<void> {
    LogController.log(`Caching all grids for results and determining numPages...`);

    results = await Promise.all(results.map(async (game) => {
      let numPages = 0;

      while (true) {
        try {
          const grids = await this.fetchGridsForGame(game.id, type, numPages, useCoreFile);
          if (grids.length > 0) {
            numPages++;
          } else {
            break;
          }
        } catch (e: any) {
          console.log(e);
          break;
        }
      }

      game.numResultPages = numPages;
      LogController.log(`Found ${numPages} pages for ${game.name}.`);
      return game;
    }));

    LogController.log(`Cached all grids for results and determined numPages.`);
  }

  /**
   * Gets the current type of grid for the provided app id.
   * @param appId The id of the app to fetch.
   * @param gameName The name of the game to fetch grids for.
   * @param page The page of results to get.
   * @param selectedPlatform The game's platforms.
   * @param useCoreFile Whether or not to use the core log file.
   * @param selectedSteamGridId Optional id of the current steamGridGame.
   * @returns A promise resolving to the grids.
   * ? Logging complete.
   */
  async fetchGrids(appId: number, gameName: string, page: number, selectedPlatform: Platforms, useCoreFile: boolean, selectedSteamGridId?: string): Promise<SGDBImage[]> {
    logToFile(`Fetching grids for game ${appId}...`, useCoreFile);

    const type = get(gridType);
    
    if (selectedPlatform == Platforms.STEAM) {
      const searchCache = get(steamGridSearchCache);

      let results = searchCache[appId];

      if (!results) {
        try {
          results = await this.client.searchGame(gameName);
          await this.getNumPages(results, Platforms.STEAM, type);
          // await this.cacheAllGridsForGame(results, Platforms.STEAM, type, useCoreFile);
          searchCache[appId] = results;
        } catch (e: any) {
          logErrorToFile(`Error searching for game on SGDB. Game: ${gameName}. Platform: ${selectedPlatform}. Error: ${e.message}.`, useCoreFile);
          ToastController.showWarningToast("Error searching for game on SGDB.");
          return [];
        }
      }

      let gameId = steamGridSteamAppIdMap[appId];

      if (!gameId) {
        try {
          const gameInfo = await this.client.getGameBySteamAppId(appId);
          gameId = gameInfo.id.toString();
          steamGridSteamAppIdMap[appId] = gameId;
        } catch (e: any) {
          logErrorToFile(`Error getting game from SGDB by steam id. Game: ${gameName}. AppId: ${appId}. Error: ${e.message}.`, useCoreFile);
          ToastController.showWarningToast("Error getting game from SGDB.");
          return [];
        }
      }
      
      let choosenResult = selectedSteamGridId ? results.find((game) => game.id.toString() == selectedSteamGridId) : null;
      choosenResult ||= results.find((game) => game.id.toString() == gameId);
      if (!choosenResult && results.length > 0) choosenResult = results[0];

      if (choosenResult?.id) {
        if (useCoreFile) selectedSteamGridGameId.set(choosenResult.id.toString());
        steamGridSearchCache.set(searchCache);
        return await this.fetchGridsForGame(choosenResult.id, type, page, useCoreFile);
      } else {
        logToFile(`No results for ${type} for ${gameName}.`, useCoreFile);
        return [];
      }
    } else if (selectedPlatform == Platforms.NON_STEAM) {
      const searchCache = get(steamGridSearchCache);

      let results = searchCache[appId];

      if (!results) {
        try {
          results = await this.client.searchGame(gameName);
          await this.getNumPages(results, Platforms.NON_STEAM, type);
          // await this.cacheAllGridsForGame(results, Platforms.STEAM, type, useCoreFile);
          searchCache[appId] = results;
        } catch (e: any) {
          logErrorToFile(`Error searching for game on SGDB. Game: ${gameName}. Platform: ${selectedPlatform}. Error: ${e.message}.`, useCoreFile);
          ToastController.showWarningToast("Error searching for game on SGDB.");
          return [];
        }
      }

      let choosenResult = selectedSteamGridId ? results.find((game) => game.id.toString() == selectedSteamGridId) : results.find((game) => game.name == gameName);
      if (!choosenResult && results.length > 0) choosenResult = results[0];

      if (choosenResult?.id) {
        if (useCoreFile) selectedSteamGridGameId.set(choosenResult.id.toString());
        steamGridSearchCache.set(searchCache);
        return await this.fetchGridsForGame(choosenResult.id, type, page, useCoreFile);
      } else {
        logToFile(`No results for ${type} for ${gameName}.`, useCoreFile);
        return [];
      }
    }
  }

  /**
   * Batch applies grids to the provided games.
   * @param appIds The list of ids.
   * ? Logging Complete.
   */
  async batchApplyGrids(appIds: string[]): Promise<void> {
    LogController.batchApplyLog(`\n`);
    
    const steamGameList = get(steamGames);
    const manualSteamGameList = get(manualSteamGames);
    const steamGameNameEntries = [...steamGameList, ...manualSteamGameList].map((game: GameStruct) => [game.appid, game.name]);
    const steamGameNameMap = Object.fromEntries(steamGameNameEntries);

    const nonSteamGamesList = get(nonSteamGames);
    const nonSteamGameNameEntries = nonSteamGamesList.map((game: GameStruct) => [game.appid, game.name]);
    const nonSteamGameNameMap = Object.fromEntries(nonSteamGameNameEntries);

    const gridsCopy = JSON.parse(JSON.stringify(get(appLibraryCache)));
    const shortcutsCopy = JSON.parse(JSON.stringify(get(steamShortcuts)));
    const selectedGridType = get(gridType);
    const filters = get(dbFilters);

    let numFinished = 0;
    let totalGrids = appIds.length;
    let shortcutsNeedUpdate = false;
    let wasCancelled = false;

    for (const appid of appIds) {
      if (get(batchApplyWasCancelled)) {
        wasCancelled = true;
        break;
      } else {
        const appidInt = parseInt(appid);
        let gameName: string;
        let isSteamGame = true;
        let message: string;

        if (steamGameNameMap[appid]) {
          gameName = steamGameNameMap[appid];
        } else {
          isSteamGame = false;
          gameName = nonSteamGameNameMap[appid];
        }

        const grids = await this.fetchGrids(appidInt, gameName, 0, isSteamGame ? Platforms.STEAM : Platforms.NON_STEAM, false);
        const filtered = filterGrids(grids, selectedGridType, filters, gameName, false);
        
        if (filtered.length > 0) {
          const grid = filtered[0];

          // @ts-ignore
          if (!gridsCopy[appid]) gridsCopy[appid] = {};
          
          let imgUrl = grid.url.toString();
          if (imgUrl.endsWith("?")) imgUrl = imgUrl.substring(0, imgUrl.length - 1);

          const localPath = await this.getGridImage(appidInt, imgUrl, false);
          
          if (localPath) {
            if (!isSteamGame && selectedGridType == GridTypes.ICON) {
              shortcutsNeedUpdate = true;
              const shortcut = shortcutsCopy.find((s) => s.appid == appidInt);
              shortcut.icon = localPath;
            }
  
            gridsCopy[appid][selectedGridType] = localPath;
            
            message = `Applied ${selectedGridType} to ${gameName}.`;
          } else {
            message = `Failed to applied ${selectedGridType} to ${gameName}.`;
          }
        } else {
          message = `No ${selectedGridType == GridTypes.HERO ? `${selectedGridType}e` : selectedGridType}s with these filters for ${gameName}.`;
        }

        batchApplyMessage.set(message);
        LogController.batchApplyLog(message);
        LogController.batchApplyLog(`\n`);

        numFinished++;
        batchApplyProgress.set((numFinished / totalGrids) * 100);
      }
    }

    if (wasCancelled) {
      ToastController.showGenericToast("Batch Apply Cancelled.");
      LogController.batchApplyLog(`Batch Apply Cancelled.`);
      showBatchApplyProgress.set(false);
      batchApplyProgress.set(0);
      batchApplyMessage.set("Starting batch job...");
      batchApplyWasCancelled.set(false);
    } else {
      appLibraryCache.set(gridsCopy);
      
      if (shortcutsNeedUpdate) steamShortcuts.set(shortcutsCopy);

      canSave.set(true);

      ToastController.showSuccessToast("Batch Apply Complete!");
      LogController.batchApplyLog(`\n`);
      LogController.batchApplyLog(`Finished batch apply for ${appIds.length} games.`);
    }
  }

  /**
   * Empties the grids cache.
   * ? Logging complete.
   */
  private async invalidateCache(): Promise<void> {
    LogController.log("Clearing cache...");
    await fs.removeDir(this.gridCacheDirPath, { recursive: true });
    LogController.log("Cleared cache.");
  }
  
  /**
   * Function to run when the app closes.
   * ? Logging complete.
   */
  async destroy() {
    LogController.log("Destroying CacheController...");
    this.apiKeyUnsub();
    await this.invalidateCache();
    LogController.log("CacheController destroyed.");
  }
}