import { fs, http, path } from "@tauri-apps/api";
import { appCacheDir } from '@tauri-apps/api/path';

import { get, type Unsubscriber } from "svelte/store";
import { SGDB, type SGDBImage } from "../models/SGDB";
import { dowloadingGridId, gridsCache, gridType, GridTypes, steamGridDBKey } from "../../Stores";
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
   * Gets the current type of grid for the provided app id.
   * @param appId The id of the app to fetch.
   * @returns A promise resolving to the grids.
   * ? Logging complete.
   */
  async fetchGrids(appId: number): Promise<SGDBImage[]> {
    LogController.log(`Fetching grids for game ${appId}...`);
    const type = get(gridType);
    const gridCacheKeys = Object.keys(gridsCache);
    
    if (gridCacheKeys.includes(appId.toString())) {
      const types = Object.keys(gridsCache[appId.toString()]);

      if (types.includes(type)) {
        LogController.log(`Using in memory cache for ${appId}'s ${type}.`);
        return gridsCache[appId.toString()][type];
      } else {
        LogController.log(`Need to fetch ${type} for ${appId}.`);
        const grids = await this.client[`get${type.includes("Capsule") ? "Grid": (type == GridTypes.HERO ? "Heroe" : type)}sBySteamAppId`](appId);
        gridsCache[appId.toString()][type] = grids;
        return grids;
      }
    } else {
      LogController.log(`Need to fetch ${type} for ${appId}.`);
      const grids = await this.client[`get${type.includes("Capsule") ? "Grid": (type == GridTypes.HERO ? "Heroe" : type)}sBySteamAppId`](appId);
      gridsCache[appId.toString()] = {};
      gridsCache[appId.toString()][type] = grids;
      return grids;
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