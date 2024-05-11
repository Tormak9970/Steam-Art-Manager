/**
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
import { LogLevel, RustInterop } from "./RustInterop";

/**
 * Controller class that handles all logging done by the app.
 * ! Should do no logging here.
 */
export class LogController {
  private static APP_NAME = "SARM";
  private static APP_THEME_COLOR = "#04e200";
  private static APP_INFO_COLOR = "#1abc9c";
  private static APP_WARN_COLOR = "#e3c907";
  private static APP_ERROR_COLOR = "#c70808";


  /**
   * Cleans the app"s log file.
   */
  static async cleanLogFile(): Promise<void> {
    await RustInterop.cleanOutLog();
  }

  /**
   * Logs a message with level [INFO] to the core log file.
   * @param message Message to log.
   */
  static async log(message:string): Promise<void> {
    if (IS_DEBUG) {
      console.log(
        `%c ${LogController.APP_NAME} %c INFO %c`,
        `background: ${LogController.APP_THEME_COLOR}; color: black;`,
        `background: ${LogController.APP_INFO_COLOR}; color: black;`,
        "background: transparent;",
        message
      );
    }

    await RustInterop.logToCoreFile(message, LogLevel.INFO);
  }

  /**
   * Logs a message with level [WARNING] to the core log file.
   * @param message Message to log.
   */
  static async warn(message:string): Promise<void> {
    if (IS_DEBUG) {
      console.warn(
        `%c ${LogController.APP_NAME} %c WARNING %c`,
        `background: ${LogController.APP_THEME_COLOR}; color: black;`,
        `background: ${LogController.APP_WARN_COLOR}; color: black;`,
        "background: transparent;",
        message
      );
    }

    await RustInterop.logToCoreFile(message, LogLevel.WARN);
  }

  /**
   * Logs a message with level [ERROR] to the core log file.
   * @param message Message to log.
   */
  static async error(message:string): Promise<void> {
    if (IS_DEBUG) {
      console.error(
        `%c ${LogController.APP_NAME} %c ERROR %c`,
        `background: ${LogController.APP_THEME_COLOR}; color: black;`,
        `background: ${LogController.APP_ERROR_COLOR}; color: black;`,
        "background: transparent;",
        message
      );
    }

    await RustInterop.logToCoreFile(message, LogLevel.ERROR);
  }


  /**
   * Logs a message with level [INFO] to the batch apply log file.
   * @param message Message to log.
   */
  static async batchApplyLog(message:string): Promise<void> {
    await RustInterop.logToBatchApplyFile(message, LogLevel.INFO);
  }

  /**
   * Logs a message with level [WARNING] to the batch apply log file.
   * @param message Message to log.
   */
  static async batchApplyWarn(message:string): Promise<void> {
    await RustInterop.logToBatchApplyFile(message, LogLevel.WARN);
  }

  /**
   * Logs a message with level [ERROR] to the batch apply log file.
   * @param message Message to log.
   */
  static async batchApplyError(message:string): Promise<void> {
    await RustInterop.logToBatchApplyFile(message, LogLevel.ERROR);
  }
}