import { invoke } from "@tauri-apps/api";

export enum LogLevel {
  INFO,
  WARN,
  ERROR
}

/**
 * Handles wrapping ipc communication into an easy to use JS bindings.
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
   * Gets the active steam user's id.
   * @returns A promise resolving to the active steam user's id, or 0 if it wasn't found/
   */
  static async getActiveUser(): Promise<number> {
    const res = await invoke<number>("get_active_user", {});
    return res;
  }

  /**
   * Gets the active user's steam app list.
   * @returns A promise resolving to a list of the active user's steam apps.
   */
  static async getSteamApps(): Promise<SteamRegistryApp[]> {
    const res = await invoke<string>("get_steam_apps", {});
    return JSON.parse(res);
  }
}