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