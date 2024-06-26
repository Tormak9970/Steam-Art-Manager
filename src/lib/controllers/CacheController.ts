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
import { appCacheDir } from "@tauri-apps/api/path";

import { get, type Unsubscriber } from "svelte/store";
import { RequestError, SGDB, type SGDBGame, type SGDBImage } from "../models/SGDB";
import { dowloadingGridId, gridType, GridTypes, steamGridSearchCache, Platforms, steamGridDBKey, gridsCache, lastPageCache, selectedSteamGridGameId, steamGridSteamAppIdMap, canSave, appLibraryCache, steamGames, nonSteamGames, steamShortcuts, dbFilters, requestTimeoutLength, manualSteamGames } from "../../stores/AppState";
import { batchApplyWasCancelled, showBatchApplyProgress, batchApplyProgress, batchApplyMessage  } from "../../stores/Modals";
import { LogController } from "./LogController";
import { RustInterop } from "./RustInterop";
import { ToastController } from "./ToastController";
import { filterGrids, getPageNumberForGame } from "../utils/Utils";


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
   * Creates a directory if it does not exist.
   * @param path The path to check.
   * @param dirName The name to output in the logging statements.
   */
  private async createDirIfNotExists(path: string, dirName: string): Promise<void> {
    try {
      if (!(await fs.exists(path))) {
        await fs.createDir(path);
        LogController.log(`Created ${dirName} dir.`);
      } else {
        LogController.log(`Found ${dirName} dir.`);
      }
    } catch(e) {
      LogController.error(e.message);
      ToastController.showWarningToast(`Unable to add ${dirName} dir to scope`);
    }
  }

  /**
   * Initializes the CacheController.
   * ? Logging complete.
   */
  private async init(): Promise<void> {
    LogController.log("Initializing CacheController...");
    
    this.appCacheDirPath = await appCacheDir();
    await this.createDirIfNotExists(this.appCacheDirPath, "cache");

    this.gridCacheDirPath = await path.join(this.appCacheDirPath, "grids");
    await this.createDirIfNotExists(this.gridCacheDirPath, "grids cache");
    
    const capsuleCacheDir = await path.join(this.gridCacheDirPath, GridTypes.CAPSULE);
    await this.createDirIfNotExists(capsuleCacheDir, "Capsule cache");

    const wideCapsuleCacheDir = await path.join(this.gridCacheDirPath, GridTypes.WIDE_CAPSULE);
    await this.createDirIfNotExists(wideCapsuleCacheDir, "Wide Capsule cache");

    const heroCacheDir = await path.join(this.gridCacheDirPath, GridTypes.HERO);
    await this.createDirIfNotExists(heroCacheDir, "Hero cache");

    const logoCacheDir = await path.join(this.gridCacheDirPath, GridTypes.LOGO);
    await this.createDirIfNotExists(logoCacheDir, "Logo cache");

    const iconCacheDir = await path.join(this.gridCacheDirPath, GridTypes.ICON);
    await this.createDirIfNotExists(iconCacheDir, "Icon cache");

    this.apiKeyUnsub = steamGridDBKey.subscribe((key) => {
      if (key !== "") {
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
      logToFile("Fetching image from API.", useCoreFile);

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
        case "sucess":
          LogController.warn(`Request for ${imageURL} succeeded.`);
          break;
        case "timedOut":
          ToastController.showWarningToast("Grid requested timed out");
          logWarnToFile(`Request for ${imageURL} timed out after ${requestTimeout / 1000} seconds.`, useCoreFile);
          return null;
        case "failed":
          ToastController.showWarningToast("Failed to set grid.");
          logWarnToFile(`Request for ${imageURL} failed.`, useCoreFile);
          return null;
      }
    } else {
      logToFile("Cache found. Fetching image from local file system.", useCoreFile);
    }
    
    return localImagePath;
  }

  /**
   * Gets the grids for a non steam game.
   * @param steamGridAppId The sgdb appId of the app to get.
   * @param type The selected grid type.
   * @param page The page of results to get.
   * @param lastPageCached The last page that was cached.
   * @param useCoreFile Whether or not to use the core log file.
   * @returns A promise resolving to a list of grids.
   * ? Logging complete.
   */
  private async fetchGridsForGame(steamGridAppId: number, type: GridTypes, page: number, lastPageCached: number, useCoreFile: boolean): Promise<SGDBImage[]> {
    const gridCacheKeys = Object.keys(gridsCache);
    
    try {
      if (gridCacheKeys.includes(steamGridAppId.toString())) {
        const types = Object.keys(gridsCache[steamGridAppId.toString()]);
  
        if (types.includes(type)) {
          if (lastPageCached === page) {
            logToFile(`Already fetched page #${page} of ${type} for ${steamGridAppId}.`, useCoreFile);
          } else {
            logToFile(`Need to fetch page ${page} of ${type} for ${steamGridAppId}.`, useCoreFile);
            const grids = await this.client[`get${type.includes("Capsule") ? "Grid": (type === GridTypes.HERO ? "Heroe" : type)}sById`](steamGridAppId, undefined, undefined, undefined, [ "static", "animated" ], "any", "any", "any", page);
            gridsCache[steamGridAppId.toString()][type] = gridsCache[steamGridAppId.toString()][type].concat(grids);
          }
        } else {
          logToFile(`Need to fetch ${type} for ${steamGridAppId}.`, useCoreFile);
          const grids = await this.client[`get${type.includes("Capsule") ? "Grid": (type === GridTypes.HERO ? "Heroe" : type)}sById`](steamGridAppId, undefined, undefined, undefined, [ "static", "animated" ], "any", "any", "any", page);
          gridsCache[steamGridAppId.toString()][type] = grids;
        }
      } else {
        logToFile(`Need to fetch ${type} for ${steamGridAppId}.`, useCoreFile);
        const grids = await this.client[`get${type.includes("Capsule") ? "Grid": (type === GridTypes.HERO ? "Heroe" : type)}sById`](steamGridAppId, undefined, undefined, undefined, [ "static", "animated" ], "any", "any", "any", page);
        gridsCache[steamGridAppId.toString()] = {};
        gridsCache[steamGridAppId.toString()][type] = grids;
      }

      return gridsCache[steamGridAppId.toString()][type];
    } catch (e: any) {
      logErrorToFile(`Error fetching grids for game: ${steamGridAppId}. Error: ${e.message}.`, useCoreFile);
      ToastController.showWarningToast("Error fetching grids for game.");
      return [];
    }
  }

  /**
   * Gets the sgdb game id for the provided game.
   * @param appId The id of the app to fetch.
   * @param gameName The name of the game to fetch grids for.
   * @param selectedPlatform The game's platforms.
   * @param useCoreFile Whether or not to use the core log file.
   * @param isCustomName Whether the app name is custom or not.
   * @returns A promise resolving to the grids.
   * ? Logging complete.
   */
  async chooseSteamGridGameId(appId: number, gameName: string, selectedPlatform: Platforms, useCoreFile: boolean, isCustomName?: boolean): Promise<string> {
    logToFile(`Finding SGDB game for ${appId}...`, useCoreFile);

    const type = get(gridType);
    const searchCache = get(steamGridSearchCache);

    let results = searchCache[appId];

    if (!results) {
      try {
        results = await this.client.searchGame(gameName);
        searchCache[appId] = results;
      } catch (e: any) {
        logErrorToFile(`Error searching for game on SGDB. Game: ${gameName}. Platform: ${selectedPlatform}. Error: ${e.message}.`, useCoreFile);
        ToastController.showWarningToast("Error searching for game on SGDB.");
        return "None";
      }
    }

    let chosenResult: SGDBGame;
    
    if (selectedPlatform === Platforms.STEAM && !isCustomName) {
      let gameId = steamGridSteamAppIdMap[appId];

      if (!gameId) {
        try {
          const gameInfo = await this.client.getGameBySteamAppId(appId);
          gameId = gameInfo.id.toString();
          steamGridSteamAppIdMap[appId] = gameId;
        } catch (e: any) {
          logErrorToFile(`Error getting game from SGDB by steam id. Game: ${gameName}. AppId: ${appId}. Error: ${e.message}.`, useCoreFile);
          ToastController.showWarningToast("Error getting game from SGDB.");
          return "None";
        }
      }
      
      chosenResult = results.find((game) => game.id.toString() === gameId);
      if (!chosenResult && results.length > 0) chosenResult = results[0];
    } else {
      chosenResult = results.find((game) => game.name === gameName);
      if (!chosenResult && results.length > 0) chosenResult = results[0];
    }

    if (chosenResult?.id) {
      steamGridSearchCache.set(searchCache);
      return chosenResult.id.toString();
    } else {
      logToFile(`No results for ${type} for ${gameName}.`, useCoreFile);
      return "None";
    }
  }

  /**
   * Gets the current type of grid for the provided app id.
   * @param appId The id of the app to fetch.
   * @param page The page of results to get.
   * @param useCoreFile Whether or not to use the core log file.
   * @param selectedSteamGridId Optional id of the current steamGridGame.
   * @returns A promise resolving to the grids.
   * ? Logging complete.
   */
  async fetchGrids(appId: number, page: number, useCoreFile: boolean, selectedSteamGridId: string): Promise<SGDBImage[]> {
    logToFile(`Fetching grids for game ${appId}...`, useCoreFile);
    const type = get(gridType);

    return await this.fetchGridsForGame(parseInt(selectedSteamGridId), type, page, getPageNumberForGame(selectedSteamGridId, type), useCoreFile);
  }

  /**
   * Searches SGDB for the provided query.
   * @param query The search query to use.
   * @returns A promise resolving to the results array, or null if the request timed out.
   */
  async searchForGame(query: string): Promise<SGDBGame[] | null> {
    try {
      return await this.client.searchGame(query);
    } catch (e: any) {
      const error = e as RequestError;
      LogController.warn(`SGDB Search Request "${query}" timed out. Message: ${error.message}`);
      return null;
    }
  }

  /**
   * Batch applies grids to the provided games.
   * @param appIds The list of ids.
   * ? Logging Complete.
   */
  async batchApplyGrids(appIds: string[]): Promise<void> {
    LogController.batchApplyLog("\n");
    
    const steamGameList = get(steamGames);
    const manualSteamGameList = get(manualSteamGames);
    const steamGameNameEntries = [ ...steamGameList, ...manualSteamGameList ].map((game: GameStruct) => [ game.appid, game.name ]);
    const steamGameNameMap = Object.fromEntries(steamGameNameEntries);

    const nonSteamGamesList = get(nonSteamGames);
    const nonSteamGameNameEntries = nonSteamGamesList.map((game: GameStruct) => [ game.appid, game.name ]);
    const nonSteamGameNameMap = Object.fromEntries(nonSteamGameNameEntries);

    const gridsCopy = JSON.parse(JSON.stringify(get(appLibraryCache)));
    const shortcutsCopy = JSON.parse(JSON.stringify(get(steamShortcuts)));
    const selectedGridType = get(gridType);
    const filters = get(dbFilters);

    let numFinished = 0;
    const totalGrids = appIds.length;
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

        const sgdbGameId = await this.chooseSteamGridGameId(appidInt, gameName, isSteamGame ? Platforms.STEAM : Platforms.NON_STEAM, false);
        const grids = await this.fetchGrids(appidInt, 0, false, sgdbGameId);
        const filtered = filterGrids(grids, selectedGridType, filters, gameName, false);
        
        if (filtered.length > 0) {
          const grid = filtered[0];

          // @ts-ignore
          if (!gridsCopy[appid]) gridsCopy[appid] = {};
          
          let imgUrl = grid.url.toString();
          if (imgUrl.endsWith("?")) imgUrl = imgUrl.substring(0, imgUrl.length - 1);

          const localPath = await this.getGridImage(appidInt, imgUrl, false);
          
          if (localPath) {
            if (!isSteamGame && selectedGridType === GridTypes.ICON) {
              shortcutsNeedUpdate = true;
              const shortcut = shortcutsCopy.find((s: SteamShortcut) => s.appid === appidInt);
              shortcut.icon = localPath;
            }
  
            gridsCopy[appid][selectedGridType] = localPath;
            
            message = `Applied ${selectedGridType} to ${gameName}.`;
          } else {
            message = `Failed to applied ${selectedGridType} to ${gameName}.`;
          }
        } else {
          message = `No ${selectedGridType === GridTypes.HERO ? `${selectedGridType}e` : selectedGridType}s with these filters for ${gameName}.`;
        }

        batchApplyMessage.set(message);
        LogController.batchApplyLog(message);
        LogController.batchApplyLog("\n");

        numFinished++;
        batchApplyProgress.set((numFinished / totalGrids) * 100);
      }
    }

    if (wasCancelled) {
      ToastController.showGenericToast("Batch Apply Cancelled.");
      LogController.batchApplyLog("Batch Apply Cancelled.");
      showBatchApplyProgress.set(false);
      batchApplyProgress.set(0);
      batchApplyMessage.set("Starting batch job...");
      batchApplyWasCancelled.set(false);
    } else {
      appLibraryCache.set(gridsCopy);
      
      if (shortcutsNeedUpdate) steamShortcuts.set(shortcutsCopy);

      canSave.set(true);

      ToastController.showSuccessToast("Batch Apply Complete!");
      LogController.batchApplyLog("\n");
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