import { fs, http, path } from "@tauri-apps/api";
import { appCacheDir } from '@tauri-apps/api/path';

import { get, type Unsubscriber } from "svelte/store";
import { SGDB, type SGDBImage } from "../models/SGDB";
import { gridType, steamGridDBKey } from "../../Stores";

/**
 * Controller class for handling caching of requests.
 */
export class CacheController {
  private appCacheDirPath: string;
  private gameInfoCacheDirPath: string;
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

    this.gameInfoCacheDirPath = await path.join(this.appCacheDirPath, "game-info");
    this.gridCacheDirPath = await path.join(this.appCacheDirPath, "grids");

    if (!(await fs.exists(this.gameInfoCacheDirPath))) await fs.createDir(this.gameInfoCacheDirPath);
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
   * Caches the appInfo json.
   */
  async cacheGameInfos(): Promise<void> {
    const games = null;
  }

  async invalidateCache(): Promise<void> {

  }

  async fetchGridsWithoutCache() {

  }

  async fetchGrids(appId: number): Promise<SGDBImage[]> {
    const type = get(gridType);
    // TODO: check in memory request cache.
    let cachedData = false;

    if (cachedData) {

    } else {
      const grids = await this.client[`get${type.indexOf("Capsule") ? "Grids": type}BySteamAppId`](appId);
      // TODO: update in memory request cache.
      return grids;
    }
  }
  
  onDestroy() {
    this.apiKeyUnsub();
  }
}