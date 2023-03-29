import { invoke } from "@tauri-apps/api";

/**
 * The available logging levels.
 */
export enum LogLevel {
  INFO,
  WARN,
  ERROR
}

/**
 * Handles wrapping ipc communication into an easy to use JS bindings.
 * ! Should do no logging here.
 */
export class RustInterop {
  /**
   * Cleans the app's log file.
   */
  static async cleanOutLog(): Promise<void> {
    await invoke("clean_out_log", {});
  }

  /**
   * Logs a message to the app's log file.
   * @param message The message to log.
   * @param level The log level.
   */
  static async logToFile(message: string, level: LogLevel): Promise<void> {
    await invoke("log_to_file", {message: message, level: level});
  }

  /**
   * Gets the active steam user's grids directory.
   * @returns A promise resolving to the active steam user's grids directory.
   */
  static async getGridsDirectory(): Promise<string> {
    return await invoke<string>("get_grids_directory", {});
  }

  /**
   * Gets the active steam user's appinfo.vdf path.
   * @returns A promise resolving to the active steam user's appinfo.vdf path.
   */
  static async getAppinfoPath(): Promise<string> {
    return await invoke<string>("get_appinfo_path", {});
  }

  /**
   * Gets the active steam user's library cache directory.
   * @returns A promise resolving to the active steam user's library cache directory.
   */
  static async getLibraryCacheDirectory(): Promise<string> {
    return await invoke<string>("get_library_cache_directory", {});
  }

  /**
   * Gets the active steam user's id.
   * @returns A promise resolving to the active steam user's id, or 0 if it wasn't found.
   */
  static async getActiveUser(): Promise<number> {
    return await invoke<number>("get_active_user", {});
  }

  /**
   * Gets the active user's steam app list.
   * @returns A promise resolving to a list of the active user's steam apps.
   */
  static async getSteamApps(): Promise<SteamRegistryApp[]> {
    const res = await invoke<string>("get_steam_apps", {});
    return JSON.parse(res);
  }

  /**
   * Exports the active user's grids to a zip file.
   * @returns A promise resolving to true if the operation suceeded, false if it was cancelled.
   */
  static async exportGridsToZip(): Promise<boolean> {
    return await invoke<boolean>("export_grids_to_zip", {});
  }

  /**
   * Imports the active user's grids from a zip file.
   * @returns A promise resolving to true if the operation suceeded, false if it was cancelled.
   */
  static async importGridsFromZip(): Promise<boolean> {
    return await invoke<boolean>("import_grids_from_zip", {});
  }

  /**
   * Imports the active user's grids from a zip file.
   * @returns A promise resolving to true if the operation suceeded, false if it was cancelled.
   */
  static async readAppinfoVdf(): Promise<any> {
    return JSON.parse(await invoke<string>("read_appinfo_vdf", {}));
  }

  /**
   * Saves the user's changes.
   * @param currentArt The current changes.
   * @param originalArt The original art dictionary.
   * @returns A promise resolving to true if the save was successfull, false otherwise.
   */
  static async saveChanges(currentArt: { [appid: string]: LibraryCacheEntry }, originalArt: { [appid: string]: LibraryCacheEntry }): Promise<boolean> {
    return await invoke<boolean>("save_changes", { current_art: JSON.stringify(currentArt), original_art: JSON.stringify(originalArt) });
  }
}