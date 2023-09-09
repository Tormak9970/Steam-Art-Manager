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

import { PhysicalPosition, PhysicalSize, WebviewWindow } from "@tauri-apps/api/window";
import { ctxMenuSourceIsImage, ctxMenuSourceSrc } from "../../stores/AppState";

/**
 * Controller class for managing app windows.
 */
export class WindowController {
  static mainWindow = WebviewWindow.getByLabel('main');
  static contextMenuWindow = WebviewWindow.getByLabel('context-menu');

  private static async calcContextMenuHeightFromEvent(e: PointerEvent): Promise<void> {
    // Add entry for reload
    let numElements = 1;

    // Add entry for inspector
    if (IS_DEBUG) numElements += 1;

    // Add entry for saving an image
    const currentSrc = (e.target as HTMLImageElement).currentSrc;
    if (currentSrc) {
      numElements += 1;
      ctxMenuSourceIsImage.set(true);
      ctxMenuSourceSrc.set(currentSrc);
    }

    await this.contextMenuWindow.setSize(new PhysicalSize(120, 5 + 30 * numElements));
  }

  /**
   * Shows the context menu window.
   * @param e The pointer event that triggered the call.
   */
  static async showContextMenu(e: PointerEvent): Promise<void> {
    await WindowController.calcContextMenuHeightFromEvent(e);

    const mainWindowPosition = await WindowController.mainWindow.innerPosition();
    await WindowController.contextMenuWindow.setPosition(new PhysicalPosition(mainWindowPosition.x + e.clientX, mainWindowPosition.y + e.clientY));

    await WindowController.contextMenuWindow.show();
    await WindowController.contextMenuWindow.setFocus();
  }

  /**
   * Closes the context menu window.
   */
  static async closeContextMenu(): Promise<void> {
    ctxMenuSourceIsImage.set(false);
    ctxMenuSourceSrc.set(null);
    await WindowController.contextMenuWindow.hide();
  }
}