import { fs, http, path } from "@tauri-apps/api";
import { appCacheDir } from '@tauri-apps/api/path';

import { get, type Unsubscriber } from "svelte/store";
import { SGDB, type SGDBImage } from "../models/SGDB";
import { gridsCache, gridType, steamGridDBKey } from "../../Stores";

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
   */
  private async init(): Promise<void> {
    this.appCacheDirPath = await appCacheDir();
    this.gridCacheDirPath = await path.join(this.appCacheDirPath, "grids");

    if (!(await fs.exists(this.gridCacheDirPath))) await fs.createDir(this.gridCacheDirPath);

    this.apiKeyUnsub = steamGridDBKey.subscribe((key) => {
      if (key != "") {
        this.client = new SGDB(key);
        this.key = key;
      } else {
        this.client = null;
        this.key = null;
      }
    });
  }

  //* The page parameter will be useful for pagnation

  /**
   * Empties the grids cache
   */
  async invalidateCache(): Promise<void> {

  }

  /**
   * Gets a image from steamGrid's cdn.
   * @param imageToGet The url of the image to get.
   */
  async getGridImage(imageToGet: string) {

  }

  /**
   * Gets the current type of grid for the provided app id.
   * @param appId The id of the app to fetch.
   * @returns A promise resolving to the grids.
   */
  async fetchGrids(appId: number): Promise<SGDBImage[]> {
    const type = get(gridType);
    const gridCacheKey = Object.keys(gridsCache);
    
    if (gridCacheKey.includes(appId.toString())) {
      const types = Object.keys(gridsCache[appId.toString()]);

      if (types.includes(type)) {
        return gridsCache[appId.toString()][type];
      } else {
        const grids = await this.client[`get${type.includes("Capsule") ? "Grids": type}BySteamAppId`](appId);
        gridsCache[appId.toString()][type] = grids;
        return grids;
      }
    } else {
      const grids = await this.client[`get${type.includes("Capsule") ? "Grids": type}BySteamAppId`](appId);
      gridsCache[appId.toString()] = {};
      gridsCache[appId.toString()][type] = grids;
      return grids;
    }
  }
  
  /**
   * Function to run when the app closes.
   */
  onDestroy() {
    this.apiKeyUnsub();
  }
}