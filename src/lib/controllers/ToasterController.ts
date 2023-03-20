import { toast } from "@zerodevx/svelte-toast";

/**
 * A controller for handling toast messages
 */
export class ToasterController {
  private static getAppToastTheme() {
    return {
      "--toastBackground": "#22aeff",
      "--toastBarBackground": "#227AFF",
      "--toastColor": "rgb(231, 231, 231)",
    };
  }

  private static getSuccessToastTheme() {
    return {
      "--toastBackground": "#27b803",
      "--toastBarBackground": "#108b00",
      "--toastColor": "rgb(231, 231, 231)",
    };
  }

  /**
   * Creates and displays a new loading toast with the provided message
   * @param msg The message to show
   * @returns The id of the created loading toast
   */
  static showLoaderToast(msg: string): number {
    return toast.push(msg, {
      theme: ToasterController.getAppToastTheme(),
      dismissable: false,
      duration: 100000,
    });
  }

  /**
   * Removes the loading toast with the specified id
   * @param loaderId The id of the loading toast
   */
  static remLoaderToast(loaderId: number) {
    toast.pop(loaderId);
  }

  /**
   * Creates and displays a new success toast with the provided message
   * @param msg The message to show
   */
  static showSuccessToast(msg: string) {
    toast.push(msg, {
      theme: ToasterController.getSuccessToastTheme(),
      dismissable: false,
      duration: 1500,
    });
  }

  /**
   * Creates and displays a new generic toast with the provided message and styles
   * @param msg The message to show
   * @param styles Optional styling to apply to the toast
   */
  static showGenericToast(msg: string, styles: object = {}) {
    toast.push(msg, {
      theme: {
        ...ToasterController.getAppToastTheme(),
        ...styles,
      },
    });
  }
}
