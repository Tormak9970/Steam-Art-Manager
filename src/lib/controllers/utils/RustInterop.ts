/**
 * Steam Art Manager is a tool for setting the artwork of your Steam library.
 * Copyright (C) 2024 Travis Lane (Tormak)
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
import { steamInstallPath } from "@stores/AppState";
import { invoke } from "@tauri-apps/api/core";
import type { ChangedPath, CleanConflict, GameStruct, GridTypesMap, LibraryCacheEntry, SteamShortcut, SteamUser } from "@types";
import { get } from "svelte/store";

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

  private static get steamPath() {
    return get(steamInstallPath);
  }

  /**
   * Checks if steam is installed, and if so, it adds it to the file access scope.
   */
  static async addSteamToScope(): Promise<string> {
    return await invoke<string>("add_steam_to_scope", {});
  }

  /**
   * Adds the provided path to the file access scope.
   */
  static async addPathToScope(path: string): Promise<boolean> {
    return await invoke<boolean>("add_path_to_scope", { targetPath: path });
  }

  /**
   * Cleans the app's log file.
   */
  static async cleanOutLog(): Promise<void> {
    await invoke("clean_out_log", {});
  }

  /**
   * Logs a message to the core log file.
   * @param message The message to log.
   * @param level The log level.
   */
  static async logToCoreFile(message: string, level: LogLevel): Promise<void> {
    await invoke("log_to_core_file", { message: message, level: level });
  }

  /**
   * Toggles the window dev tools on/off.
   * @param enable Whether to enable or disable the window dev tools.
   */
  static async toggleDevTools(enable: boolean): Promise<void> {
    await invoke("toggle_dev_tools", { enable: enable });
  }

  /**
   * Logs a message to the batch apply log file.
   * @param message The message to log.
   * @param level The log level.
   */
  static async logToBatchApplyFile(message: string, level: LogLevel): Promise<void> {
    await invoke("log_to_batch_apply_file", { message: message, level: level });
  }

  /**
   * Gets the active steam user's grids directory.
   * @param activeUserId The id of the active user.
   * @returns A promise resolving to the active steam user's grids directory.
   */
  static async getGridsDirectory(activeUserId: string): Promise<string> {
    return await invoke<string>("get_grids_directory", { steamPath: RustInterop.steamPath, steamActiveUserId: activeUserId });
  }

  /**
   * Gets the active steam user's appinfo.vdf path.
   * @returns A promise resolving to the active steam user's appinfo.vdf path.
   */
  static async getAppinfoPath(): Promise<string> {
    return await invoke<string>("get_appinfo_path", { steamPath: RustInterop.steamPath });
  }

  /**
   * Gets the active steam user's shortcuts.vdf path.
   * @param activeUserId The id of the active user.
   * @returns A promise resolving to the active steam user's shortcuts.vdf path.
   */
  static async getShortcutsPath(activeUserId: string): Promise<string> {
    return await invoke<string>("get_shortcuts_path", { steamPath: RustInterop.steamPath, steamActiveUserId: activeUserId });
  }

  /**
   * Gets the active steam user's localconfig.vdf path.
   * @param activeUserId The id of the active user.
   * @returns A promise resolving to the active steam user's localconfig.vdf path.
   */
  static async getLocalconfigPath(activeUserId: string): Promise<string> {
    return await invoke<string>("get_localconfig_path", { steamPath: RustInterop.steamPath, steamActiveUserId: activeUserId });
  }

  /**
   * Gets the sourcemods directory path.
   * @returns A promise resolving to the sourcemods path.
   */
  static async getSourcemodPath(): Promise<string> {
    return await invoke<string>("get_sourcemod_path", { steamPath: RustInterop.steamPath });
  }

  /**
   * Gets the goldsrc path.
   * @returns A promise resolving to the goldsrc path.
   */
  static async getGoldsrcPath(activeUserId: string): Promise<string> {
    return await invoke<string>("get_goldsrc_path", { steamPath: RustInterop.steamPath });
  }

  /**
   * Gets the active steam user's library cache directory.
   * @returns A promise resolving to the active steam user's library cache directory.
   */
  static async getLibraryCacheDirectory(): Promise<string> {
    console.log(RustInterop.steamPath)
    return await invoke<string>("get_library_cache_directory", { steamPath: RustInterop.steamPath });
  }
  
  /**
   * Gets the user's previously selected grids.
   * @param cacheDir The directory where the selected grids are stored.
   * @returns The selected grids map.
   */
  static async getSelectedGridsCacheData(cacheDir: string): Promise<Record<string, GridTypesMap<string[]>>> {
    return await invoke<Record<string, GridTypesMap<string[]>>>("load_selected_cache", { cacheDir });
  }
  
  /**
   * Gets the user's cache data..
   * @param activeUserId The id of the active user.
   * @param shortcutIds The list of shortcut ids.
   * @param steamApps The loaded steamApps
   * @returns A promise resolving to the user's cache data.
   */
  static async getCacheData(activeUserId: string, shortcutIds: string[], steamApps: GameStruct[]): Promise<[Record<string, LibraryCacheEntry>, Record<string, LibraryCacheEntry>]> {
    const appsMap = Object.fromEntries(steamApps.map((app) => [app.appid, app.gridInfo]));
    return await invoke<[Record<string, LibraryCacheEntry>, Record<string, LibraryCacheEntry>]>("get_cache_data", { steamPath: RustInterop.steamPath, steamActiveUserId: activeUserId, shortcutIds, steamApps: appsMap });
  }

  /**
   * Gets a list of steam users on this computer.
   * @returns A promise resolving to the list of steam users on this computer.
   */
  static async getSteamUsers(): Promise<Record<string, SteamUser>> {
    return JSON.parse(await invoke<string>("get_steam_users", { steamPath: RustInterop.steamPath }));
  }

  /**
   * Exports the active user's grids to a zip file.
   * @param activeUserId The id of the active user.
   * @param platformIdMap A map of game/app ids to their platform.
   * @param idNameMap A map of shortcut ids to their name.
   * @returns A promise resolving to true if the operation suceeded, false if it was cancelled.
   */
  static async exportGridsToZip(activeUserId: string, platformIdMap: Record<string, string>, idNameMap: Record<string, string>): Promise<boolean> {
    return await invoke<boolean>("export_grids_to_zip", {
      steamPath: RustInterop.steamPath,
      steamActiveUserId: activeUserId,
      platformIdMap: platformIdMap,
      idNameMap: idNameMap
    });
  }

  /**
   * Imports the active user's grids from a zip file.
   * @param activeUserId The id of the active user.
   * @param nameIdMap A map of shortcut names to their id.
   * @returns A promise resolving to a tuple of (success, map of shortcut icons that need to be written).
   */
  static async importGridsFromZip(activeUserId: string, nameIdMap: Record<string, string>): Promise<[boolean, Record<string, string>]> {
    const res = await invoke<[boolean, Record<string, string>]>("import_grids_from_zip", {
      steamPath: RustInterop.steamPath,
      steamActiveUserId: activeUserId,
      nameIdMap: nameIdMap
    });

    return res;
  }

  /**
   * Reads the current user's apps from the appinfo.vdf file.
   * @returns A promise resolving to the contents of the appinfo.vdf file.
   */
  static async readAppinfoVdf(): Promise<any> {
    return JSON.parse(await invoke<string>("read_appinfo_vdf", { steamPath: RustInterop.steamPath }));
  }

  /**
   * Reads the current user's non steam games from the shortcuts.vdf file.
   * @param activeUserId The id of the active user.
   * @returns A promise resolving to the contents of the shortcuts.vdf file.
   */
  static async readShortcutsVdf(activeUserId: string): Promise<any> {
    return JSON.parse(await invoke<string>("read_shortcuts_vdf", { steamPath: RustInterop.steamPath, steamActiveUserId: activeUserId }));
  }

  /**
   * Reads the current user's non steam games from the localconfig.vdf file.
   * @param activeUserId The id of the active user.
   * @returns A promise resolving to the contents of the localconfig.vdf file.
   */
  static async readLocalconfigVdf(activeUserId: string): Promise<any> {
    return JSON.parse(await invoke<string>("read_localconfig_vdf", { steamPath: RustInterop.steamPath, steamActiveUserId: activeUserId }));
  }

  /**
   * Saves the user's changes.
   * @param activeUserId The id of the active user.
   * @param currentArt The current changes.
   * @param originalArt The original art dictionary.
   * @param shortcuts The list of shortcuts.
   * @param shortcutIcons The map of shortcutIds to updated icons.
   * @param originalShortcutIcons The map of shortcutIds to original icons.
   * @returns A promise resolving to a string of serialized changed tuples.
   */
  static async saveChanges(activeUserId: string, currentArt: Record<string, LibraryCacheEntry>, originalArt: Record<string, LibraryCacheEntry>, shortcuts: SteamShortcut[], shortcutIcons: Record<string, string>, originalShortcutIcons: Record<string, string>): Promise<ChangedPath[] | { error: string }> {
    const shortcutsObj = {
      "shortcuts": { ...shortcuts }
    }
    const res = await invoke<string>("save_changes", { steamPath: RustInterop.steamPath, currentArt: JSON.stringify(currentArt), originalArt: JSON.stringify(originalArt), shortcutsStr: JSON.stringify(shortcutsObj), steamActiveUserId: activeUserId, shortcutIcons: shortcutIcons, originalShortcutIcons: originalShortcutIcons });
    return JSON.parse(res);
  }

  /**
   * Writes changes to the steam shortcuts.
   * @param activeUserId The id of the active user.
   * @param shortcuts The list of shortcuts.
   * @returns A promise resolving to true if the write was successful.
   */
  static async writeShortcuts(activeUserId: string, shortcuts: SteamShortcut[]): Promise<boolean> {
    const shortcutsObj = {
      "shortcuts": { ...shortcuts }
    }
    const res = await invoke<string>("write_shortcuts", { steamPath: RustInterop.steamPath, shortcutsStr: JSON.stringify(shortcutsObj), steamActiveUserId: activeUserId });
    return JSON.parse(res);
  }

  /**
   * Downloads a file to the provided destination from a given url.
   * @param gridUrl The url of the grid to download.
   * @param destPath The path to write the file to.
   * @param timeout The time before the request times out.
   * @returns A promise resolving to true if the file was successfully downloaded.
   */
  static async downloadGrid(gridUrl: string, destPath: string, timeout: number): Promise<string> {
    let timedOut = false;

    setTimeout(() => timedOut = true, timeout - 1);

    const status = await invoke<string>("download_grid", { gridUrl: gridUrl, destPath: destPath, timeout: timeout });

    return timedOut ? "timedOut" : status;
  }

  /**
   * Copies a file to the provided destination from a given source.
   * @param sourcePath The path to copy from.
   * @param destPath The path to write the file to.
   * @returns A promise resolving to true if the file was successfully copied.
   */
  static async copyCachedGrid(sourcePath: string, destPath: string): Promise<boolean> {
    return await invoke<boolean>("copy_grid_to_selected", { sourcePath, destPath });
  }

  /**
   * Cleans the grids directory.
   * @param steamActiveUserId The id of the active user.
   * @param preset The selected cleaning preset.
   * @param allAppids The list of all known appids;
   * @param selectedGameIds The list of game ids to clean.
   * @returns A promise resolving to an array of CleanConflicts.
   */
  static async cleanGrids(steamActiveUserId: string, preset: string, allAppids: string[], selectedGameIds: string[]): Promise<CleanConflict[]> {
    return JSON.parse(await invoke<string>("clean_grids", { steamPath: RustInterop.steamPath, steamActiveUserId: steamActiveUserId, preset: preset, allAppids: JSON.stringify(allAppids), selectedGameIds: JSON.stringify(selectedGameIds) }));
  }

  /**
   * Gets the steam apps with start menu tiles.
   * @returns A record of appid -> iconPath.
   */
  static async getAppsWithTiles(): Promise<Record<string, string>> {
    const res = await invoke<string>("get_apps_with_tiles");
    return JSON.parse(res);
  }

  /**
   * Writes the current app icons to their app tiles.
   * @param appIconsPaths The record of appid -> iconPath.
   * @param appTilePaths The record of appid -> tilePath.
   * @returns An array containing the ids of any tiles that failed to be updated
   */
  static async writeAppTiles(appIconsPaths: Record<string, string>, appTilePaths: Record<string, string>): Promise<string[]> {
    return JSON.parse(await invoke<string>("write_app_tiles", { newTilesStr: JSON.stringify(appIconsPaths), tilePathsStr: JSON.stringify(appTilePaths) }));
  }

  /**
   * Checks if the provided path is a valid steam installation.
   * @param targetPath The path to validate.
   * @returns True if the path is a valid steam install.
   */
  static async validateSteamPath(targetPath: string): Promise<boolean> {
    return await invoke<boolean>("validate_steam_path", { targetPath: targetPath.toLowerCase() });
  }
}