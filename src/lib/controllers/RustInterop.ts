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
   * @param activeUserId The id of the active user.
   * @returns A promise resolving to the active steam user's grids directory.
   */
  static async getGridsDirectory(activeUserId: string): Promise<string> {
    return await invoke<string>("get_grids_directory", { steamActiveUserId: activeUserId });
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
   * @param activeUserId The id of the active user.
   * @returns A promise resolving to the active steam user's shortcuts.vdf path.
   */
  static async getShortcutsPath(activeUserId: string): Promise<string> {
    return await invoke<string>("get_shortcuts_path", { steamActiveUserId: activeUserId });
  }

  /**
   * Gets the active steam user's library cache directory.
   * @returns A promise resolving to the active steam user's library cache directory.
   */
  static async getLibraryCacheDirectory(): Promise<string> {
    return await invoke<string>("get_library_cache_directory", {});
  }

  /**
   * Gets a list of steam users on this computer.
   * @returns A promise resolving to the list of steam users on this computer.
   */
  static async getSteamUsers(): Promise<{ [id: string]: SteamUser }> {
    return JSON.parse(await invoke<string>("get_steam_users", {}));
  }

  /**
   * Exports the active user's grids to a zip file.
   * @param activeUserId The id of the active user.
   * @returns A promise resolving to true if the operation suceeded, false if it was cancelled.
   */
  static async exportGridsToZip(activeUserId: string): Promise<boolean> {
    return await invoke<boolean>("export_grids_to_zip", { steamActiveUserId: activeUserId });
  }

  /**
   * Imports the active user's grids from a zip file.
   * @param activeUserId The id of the active user.
   * @returns A promise resolving to true if the operation suceeded, false if it was cancelled.
   */
  static async importGridsFromZip(activeUserId: string): Promise<boolean> {
    return await invoke<boolean>("import_grids_from_zip", { steamActiveUserId: activeUserId });
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
   * @param activeUserId The id of the active user.
   * @returns A promise resolving to the contents of the shortcuts.vdf file.
   */
  static async readShortcutsVdf(activeUserId: string): Promise<any> {
    return JSON.parse(await invoke<string>("read_shortcuts_vdf", { steamActiveUserId: activeUserId }));
  }

  /**
   * Saves the user's changes.
   * @param activeUserId The id of the active user.
   * @param currentArt The current changes.
   * @param originalArt The original art dictionary.
   * @param shortcuts The list of shortcuts.
   * @param shortcutIds The list of shortcut ids.
   * @returns A promise resolving to a string of serialized changed tuples.
   */
  static async saveChanges(activeUserId: string, currentArt: { [appid: string]: LibraryCacheEntry }, originalArt: { [appid: string]: LibraryCacheEntry }, shortcuts: SteamShortcut[], shortcutIds: string[]): Promise<ChangedPath[] | { error: string }> {
    const shortcutsObj = {
      "shortcuts": {...shortcuts}
    }
    const res = await invoke<string>("save_changes", { currentArt: JSON.stringify(currentArt), originalArt: JSON.stringify(originalArt), shortcutsStr: JSON.stringify(shortcutsObj), shortcutIdsStr: shortcutIds.join(", "), steamActiveUserId: activeUserId });
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