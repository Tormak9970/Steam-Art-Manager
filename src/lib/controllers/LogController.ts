import { LogLevel, RustInterop } from "./RustInterop";

/**
 * Controller that handles all logging done by the app.
 */
export class LogController {
  async cleanLogFile(): Promise<void> {
    await RustInterop.cleanOutLog();
  }

  async log(message:string): Promise<void> {
    await RustInterop.logToFile(message, LogLevel.INFO);
  }

  async warn(message:string): Promise<void> {
    await RustInterop.logToFile(message, LogLevel.WARN);
  }

  async error(message:string): Promise<void> {
    await RustInterop.logToFile(message, LogLevel.ERROR);
  }
}