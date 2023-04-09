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
   * Gets the active steam user's shortcuts.vdf path.
   * @returns A promise resolving to the active steam user's shortcuts.vdf path.
   */
  static async getShortcutsPath(): Promise<string> {
    return await invoke<string>("get_shortcuts_path", {});
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
   * Reads the current user's apps from the appinfo.vdf file.
   * @returns A promise resolving to the contents of the appinfo.vdf file.
   */
  static async readAppinfoVdf(): Promise<any> {
    return JSON.parse(await invoke<string>("read_appinfo_vdf", {}));
  }

  /**
   * Reads the current user's non steam games from the shortcuts.vdf file.
   * @returns A promise resolving to the contents of the shortcuts.vdf file.
   */
  static async readShortcutsVdf(): Promise<any> {
    return JSON.parse(await invoke<string>("read_shortcuts_vdf", {}));
  }

  /**
   * Saves the user's changes.
   * @param currentArt The current changes.
   * @param originalArt The original art dictionary.
   * @returns A promise resolving to a string of serialized changed tuples.
   */
  static async saveChanges(currentArt: { [appid: string]: LibraryCacheEntry }, originalArt: { [appid: string]: LibraryCacheEntry }): Promise<ChangedPath[] | { error: string }> {
    const res = await invoke<string>("save_changes", { currentArt: JSON.stringify(currentArt), originalArt: JSON.stringify(originalArt) });
    return JSON.parse(res);
  }

  /**
   * Adds the steam directory to the fsScope.
   * @returns Whether the scope was successfully added.
   */
  static async addSteamToScope(): Promise<boolean> {
    return await invoke<boolean>("add_steam_to_scope", {});
  }
}