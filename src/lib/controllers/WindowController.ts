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

/**
 * Gets a Blob from an image url.
 * @param imageUrl The url of the image to get.
 * @returns A promise resolving to the Blob.
 */
// async function getImageBlob(imageUrl: string): Promise<Blob> {
//   const response = await fetch(imageUrl)
//   return response.blob()
// }
/**
 * Opens the save dialog for the selected image.
 * @param src The image source.
 */
// async function saveImageAs(src: string): Promise<void> {
//   const blob = await getImageBlob(src);
//   const destPath = await dialog.save({ title: "Save Image", defaultPath: `image.${blob.type.substring(blob.type.indexOf("/") + 1)}` })
//   await fs.writeBinaryFile(destPath, await blob.arrayBuffer());
// }
/**
 * Reloads the app.
 */
// async function reloadApp(): Promise<void> {
//   await AppController.reload();
// }
/**
 * Opens the inspector for the main window.
 */
// async function inspectElement(): Promise<void> {
//   await invoke("open_main_dev_tools");
// }

/**
 * Controller class for managing app windows.
 */
export class WindowController {
  static mainWindow = WebviewWindow.getByLabel("main");

  static async registerContextMenuListeners(): Promise<void> {

  }

  static async destroyContextMenuListeners(): Promise<void> {

  }

  static async onContextMenuClicked(): Promise<void> {
    
  }
}