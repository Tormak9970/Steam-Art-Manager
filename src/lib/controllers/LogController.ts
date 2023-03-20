import { LogLevel, RustInterop } from "./RustInterop";

/**
 * Controller that handles all logging done by the app.
 */
export class LogController {
  private logPath:string;

  setFilePath(logPath:string): void {
    this.logPath = logPath;
  }

  async cleanLogFile(): Promise<void> {
    await RustInterop.cleanOutLog(this.logPath);
  }

  async log(message:string): Promise<void> {
    await RustInterop.logToFile(message, LogLevel.INFO, this.logPath);
  }

  async warn(message:string): Promise<void> {
    await RustInterop.logToFile(message, LogLevel.WARN, this.logPath);
  }

  async error(message:string): Promise<void> {
    await RustInterop.logToFile(message, LogLevel.ERROR, this.logPath);
  }
}