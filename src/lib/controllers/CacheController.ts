import { fs, path } from "@tauri-apps/api";
import { appCacheDir } from '@tauri-apps/api/path';

/**
 * Controller class for handling caching of requests.
 */
export class CacheController {
  private appCacheDirPath: string;
  private infoCacheDirPath: string;
  private gridCacheDirPath: string;

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

    this.infoCacheDirPath = await path.join(this.appCacheDirPath, "game-info");
    this.gridCacheDirPath = await path.join(this.appCacheDirPath, "grids");

    if (!(await fs.exists(this.infoCacheDirPath))) await fs.createDir(this.infoCacheDirPath);
    if (!(await fs.exists(this.gridCacheDirPath))) await fs.createDir(this.gridCacheDirPath);
  }

  invalidateCache() {

  }

  async fetchGameInfoWithCache() {

  }

  async fetchGameInfo() {

  }

  async fetchGridsWithCache() {

  }

  async fetchGrids() {

  }
}