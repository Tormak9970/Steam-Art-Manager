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
import { toast } from "@zerodevx/svelte-toast";

/**
 * Controller class for handling toast messages.
 */
export class ToastController {
  /**
   * Helper function to get the generic toast styles.
   * @returns The generic theme.
   */
  private static getAppToastTheme(): any {
    return {
      "--toastBackground": "#22aeff",
      "--toastBarBackground": "#227AFF",
      "--toastColor": "rgb(231, 231, 231)",
    };
  }

  /**
   * Helper function to get the success toast styles.
   * @returns The success theme.
   */
  private static getSuccessToastTheme(): any {
    return {
      "--toastBackground": "#27b803",
      "--toastBarBackground": "#108b00",
      "--toastColor": "rgb(231, 231, 231)",
    };
  }

  /**
   * Helper function to get the warning toast styles.
   * @returns The warning theme.
   */
  private static getWarningToastTheme(): any {
    return {
      "--toastBackground": "#e24a4a",
      "--toastBarBackground": "#e13525",
      "--toastColor": "rgb(231, 231, 231)",
    };
  }

  /**
   * Creates and displays a new loading toast with the provided message.
   * @param msg The message to show.
   * @returns The id of the created loading toast.
   */
  static showLoaderToast(msg: string): number {
    return toast.push(msg, {
      theme: ToastController.getAppToastTheme(),
      dismissable: false,
      duration: 100000,
    });
  }

  /**
   * Removes the loading toast with the specified id.
   * @param loaderId The id of the loading toast.
   */
  static remLoaderToast(loaderId: number): void {
    toast.pop(loaderId);
  }

  /**
   * Creates and displays a new success toast with the provided message.
   * @param msg The message to show.
   */
  static showSuccessToast(msg: string): void {
    toast.push(msg, {
      theme: ToastController.getSuccessToastTheme(),
      dismissable: false,
      duration: 1500,
    });
  }

  /**
   * Creates and displays a new warning toast with the provided message.
   * @param msg The message to show.
   */
  static showWarningToast(msg: string): void {
    toast.push(msg, {
      theme: ToastController.getWarningToastTheme(),
      dismissable: false,
      duration: 1500,
    });
  }

  /**
   * Creates and displays a new generic toast with the provided message and styles.
   * @param msg The message to show.
   * @param styles Optional styling to apply to the toast.
   */
  static showGenericToast(msg: string, styles: object = {}): void {
    toast.push(msg, {
      theme: {
        ...ToastController.getAppToastTheme(),
        ...styles,
      },
    });
  }
}
