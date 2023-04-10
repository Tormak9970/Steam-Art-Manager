/**
 * Steam Art Manager is a tool for setting the artwork of your Steam library.
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

import { WebviewWindow } from "@tauri-apps/api/window";
import { LogController } from "./LogController";
import { focusedWindow } from "../../Stores";

/**
 * Controller class for managing app windows.
 */
export class WindowController {
  private static mainWindow = WebviewWindow.getByLabel('main');
  private static settingsWindow = WebviewWindow.getByLabel('settings');

  /**
   * Closes the window with the provided label.
   * @param title The title of the window to close.
   * ? Logging Complete.
   */
  static async closeWindowByTitle(title: string): Promise<void> {
    LogController.log(`Closing ${title} window.`);
    const targetWindow = WebviewWindow.getByLabel(title.toLowerCase());
    await targetWindow.hide();
    await targetWindow.setFocus();
  }

  /**
   * Opens the settings window.
   * ? Logging Complete.
   */
  static async openSettingsWindow(): Promise<void> {
    LogController.log("Opening settings window.");
    await this.settingsWindow.show();
    await this.settingsWindow.setFocus();
    focusedWindow.set("settings");
  }

  /**
   * Closes the settings window.
   * ? Logging Complete.
   */
  static async closeSettingsWindow(): Promise<void> {
    LogController.log("Closing settings window.");
    await this.settingsWindow.hide();
    focusedWindow.set("main");
  }
}