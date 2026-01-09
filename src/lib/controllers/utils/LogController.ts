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
    console.log(
      `%c ${LogController.APP_NAME} %c INFO %c`,
      `background: ${LogController.APP_THEME_COLOR}; color: black;`,
      `background: ${LogController.APP_INFO_COLOR}; color: black;`,
      "background: transparent;",
      message
    );

    await RustInterop.logToCoreFile(message, LogLevel.INFO);
  }

  /**
   * Logs a message with level [WARNING] to the core log file.
   * @param message Message to log.
   */
  static async warn(message:string): Promise<void> {
    console.warn(
      `%c ${LogController.APP_NAME} %c WARNING %c`,
      `background: ${LogController.APP_THEME_COLOR}; color: black;`,
      `background: ${LogController.APP_WARN_COLOR}; color: black;`,
      "background: transparent;",
      message
    );

    await RustInterop.logToCoreFile(message, LogLevel.WARN);
  }

  /**
   * Logs a message with level [ERROR] to the core log file.
   * @param message Message to log.
   */
  static async error(message:string): Promise<void> {
    const captureErr = new Error();
    Error.captureStackTrace(captureErr, LogController.error);
    const stackLines = captureErr.stack?.split("\n") ?? [];
    const callerLine = stackLines[1];
  
    // Regex to match file path, line, and column
    const regex = /([^\/\\]+?)(?:\?.*?)?:(\d+):(\d+)/;
    const match = callerLine.match(regex);
  
    if (!match) {
      console.log(message);
      return;
    }
  
    const [, file, line, column] = match;

    console.error(
      `%c ${LogController.APP_NAME} %c ERROR %c [${file}:${line}:${column}] %c`,
      `background: ${LogController.APP_THEME_COLOR}; color: black;`,
      `background: ${LogController.APP_ERROR_COLOR}; color: black;`,
      "background: transparent;",
      "background: transparent;",
      message
    );

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