/**
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
import { LogLevel, RustInterop } from "./RustInterop";

/**
 * Controller that handles all logging done by the app.
 * ! Should do no logging here.
 */
export class LogController {
  /**
   * Cleans the app's log file.
   */
  static async cleanLogFile(): Promise<void> {
    await RustInterop.cleanOutLog();
  }

  /**
   * Logs a message with level [INFO] to the app's log file.
   * @param message Message to log.
   */
  static async log(message:string): Promise<void> {
    await RustInterop.logToFile(message, LogLevel.INFO);
  }

  /**
   * Logs a message with level [WARNING] to the app's log file.
   * @param message Message to log.
   */
  static async warn(message:string): Promise<void> {
    await RustInterop.logToFile(message, LogLevel.WARN);
  }

  /**
   * Logs a message with level [ERROR] to the app's log file.
   * @param message Message to log.
   */
  static async error(message:string): Promise<void> {
    await RustInterop.logToFile(message, LogLevel.ERROR);
  }
}