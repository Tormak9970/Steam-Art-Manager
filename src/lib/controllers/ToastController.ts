import { toast } from "@zerodevx/svelte-toast";

/**
 * A controller for handling toast messages.
 */
export class ToastController {
  private static getAppToastTheme(): any {
    return {
      "--toastBackground": "#22aeff",
      "--toastBarBackground": "#227AFF",
      "--toastColor": "rgb(231, 231, 231)",
    };
  }

  private static getSuccessToastTheme(): any {
    return {
      "--toastBackground": "#27b803",
      "--toastBarBackground": "#108b00",
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
