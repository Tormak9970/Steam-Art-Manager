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
  static async cleanOutLog(logPath:string):Promise<void> {
    await invoke("clean_out_log", {logPath: logPath});
  }

  static async logToFile(message: string, level:LogLevel, logPath:string):Promise<void> {
    await invoke("log_to_file", {message: message, level: level, logPath: logPath});
  }

  static async getActiveUser() {
    const res = await invoke<number>("get_active_user", {});
    console.log(res);
    return res;
  }

  static async getSteamGames() {
    const res = await invoke<string>("get_steam_games", {});
    // console.log(res);
    console.log(JSON.parse(res));
  }
}