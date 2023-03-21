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
  static async cleanOutLog():Promise<void> {
    await invoke("clean_out_log", {});
  }

  static async logToFile(message: string, level:LogLevel):Promise<void> {
    await invoke("log_to_file", {message: message, level: level});
  }

  static async getActiveUser() {
    const res = await invoke<number>("get_active_user", {});
    return res;
  }

  static async getSteamGames() {
    const res = await invoke<string>("get_steam_games", {});
    // console.log(JSON.parse(res));
    return JSON.parse(res)
  }
}