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
import { fs, http, path } from "@tauri-apps/api";
import { appCacheDir } from '@tauri-apps/api/path';

import { get, type Unsubscriber } from "svelte/store";
import { SGDB, type SGDBImage } from "../models/SGDB";
import { currentPlatform, dowloadingGridId, steamGridsCache, gridType, GridTypes, steamGridSearchCache, Platforms, selectedGameName, steamGridDBKey, nonSteamGridsCache, selectedSteamGridGameId, steamGridSteamAppIdMap } from "../../Stores";
import { LogController } from "./LogController";

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
   * @param imageURL The url of the image to get.
   * ? Logging complete.
   */
  async getGridImage(appId: number, imageURL: string): Promise<string> {
    LogController.log(`Fetching image ${imageURL}...`);
    const fileName = imageURL.substring(imageURL.lastIndexOf("/") + 1);
    const localImagePath = await path.join(this.gridCacheDirPath, get(gridType), fileName);

    if (!(await fs.exists(localImagePath))) {
      LogController.log(`Fetching image from API.`);

      dowloadingGridId.set(appId);
      const imageData = await http.fetch<Uint8Array>(imageURL, {
        method: "GET",
        responseType: 3
      });
      
      await fs.writeBinaryFile(localImagePath, imageData.data);
      
      dowloadingGridId.set(null);
    } else {
      LogController.log(`Cache found. Fetching image from local file system.`);
    }
    
    return localImagePath;
  }

  /**
   * Gets the grids for a steam game.
   * @param appId The id of the app to get.
   * @param type The selected grid type.
   * @returns A promise resolving to a list of grids.
   * ? Logging complete.
   */
  private async fetchGridsForSteamGame(appId: number, type: GridTypes): Promise<SGDBImage[]> {
    const gridCacheKeys = Object.keys(steamGridsCache);
    if (gridCacheKeys.includes(appId.toString())) {
      const types = Object.keys(steamGridsCache[appId.toString()]);

      if (types.includes(type)) {
        LogController.log(`Using in memory cache for steam ${appId}'s ${type}.`);
        return steamGridsCache[appId.toString()][type];
      } else {
        LogController.log(`Need to fetch steam ${gridType} for ${appId}.`);
        const grids = await this.client[`get${type.includes("Capsule") ? "Grid": (type == GridTypes.HERO ? "Heroe" : type)}sBySteamAppId`](appId);
        steamGridsCache[appId.toString()][type] = grids;
        return grids;
      }
    } else {
      LogController.log(`Need to fetch steam ${gridType} for ${appId}.`);
      const grids = await this.client[`get${type.includes("Capsule") ? "Grid": (type == GridTypes.HERO ? "Heroe" : type)}sBySteamAppId`](appId);
      steamGridsCache[appId.toString()] = {};
      steamGridsCache[appId.toString()][type] = grids;
      return grids;
    }
  }

  /**
   * Gets the grids for a non steam game.
   * @param appId The id of the app to get.
   * @param type The selected grid type.
   * @returns A promise resolving to a list of grids.
   * ? Logging complete.
   */
  private async fetchGridsForNonSteamGame(appId: number, type: GridTypes): Promise<SGDBImage[]> {
    const gridCacheKeys = Object.keys(nonSteamGridsCache);
    if (gridCacheKeys.includes(appId.toString())) {
      const types = Object.keys(nonSteamGridsCache[appId.toString()]);

      if (types.includes(type)) {
        LogController.log(`Using in memory cache for nonSteam ${appId}'s ${type}.`);
        return nonSteamGridsCache[appId.toString()][type];
      } else {
        LogController.log(`Need to fetch nonSteam ${gridType} for ${appId}.`);
        const grids = await this.client[`get${type.includes("Capsule") ? "Grid": (type == GridTypes.HERO ? "Heroe" : type)}sById`](appId);
        nonSteamGridsCache[appId.toString()][type] = grids;
        return grids;
      }
    } else {
      LogController.log(`Need to fetch nonSteam ${gridType} for ${appId}.`);
      const grids = await this.client[`get${type.includes("Capsule") ? "Grid": (type == GridTypes.HERO ? "Heroe" : type)}sById`](appId);
      nonSteamGridsCache[appId.toString()] = {};
      nonSteamGridsCache[appId.toString()][type] = grids;
      return grids;
    }
  }

  /**
   * Gets the current type of grid for the provided app id.
   * @param appId The id of the app to fetch.
   * @param selectedSteamGridId Optional id of the current steamGridGame.
   * @returns A promise resolving to the grids.
   * ? Logging complete.
   */
  async fetchGrids(appId: number, selectedSteamGridId?: string): Promise<SGDBImage[]> {
    LogController.log(`Fetching grids for game ${appId}...`);
    const type = get(gridType);
    const selectedPlatform = get(currentPlatform);
    
    if (selectedPlatform == Platforms.STEAM) {
      const gameName = get(selectedGameName);
      const searchCache = get(steamGridSearchCache);

      let results = searchCache[appId];

      if (!results) {
        results = await this.client.searchGame(gameName);
        searchCache[appId] = results;
      }

      let gameId = steamGridSteamAppIdMap[appId];

      if (!gameId) {
        const gameInfo = await this.client.getGameBySteamAppId(appId);
        gameId = gameInfo.id.toString();
        steamGridSteamAppIdMap[appId] = gameId;
      }
      
      let choosenResult = selectedSteamGridId ? results.find((game) => game.id.toString() == selectedSteamGridId) : results.find((game) => game.id.toString() == gameId);
      if (!choosenResult && results.length > 0) choosenResult = results[0];

      if (choosenResult?.id) {
        selectedSteamGridGameId.set(choosenResult.id.toString());
        steamGridSearchCache.set(searchCache);
        return await this.fetchGridsForNonSteamGame(choosenResult.id, type);
      } else {
        LogController.log(`No results for ${type} for ${gameName}.`);
        return [];
      }
    } else if (selectedPlatform == Platforms.NON_STEAM) {
      const gameName = get(selectedGameName);
      const searchCache = get(steamGridSearchCache);

      let results = searchCache[appId];

      if (!results) {
        results = await this.client.searchGame(gameName);
        searchCache[appId] = results;
      }

      let choosenResult = selectedSteamGridId ? results.find((game) => game.id.toString() == selectedSteamGridId) : results.find((game) => game.name == gameName);
      if (!choosenResult && results.length > 0) choosenResult = results[0];

      if (choosenResult?.id) {
        selectedSteamGridGameId.set(choosenResult.id.toString());
        steamGridSearchCache.set(searchCache);
        return await this.fetchGridsForNonSteamGame(choosenResult.id, type);
      } else {
        LogController.log(`No results for ${type} for ${gameName}.`);
        return [];
      }
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