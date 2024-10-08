import { dialogModalCancel, dialogModalCancelText, dialogModalConfirm, dialogModalConfirmText, dialogModalMessage, dialogModalTitle, dialogModalType, progressModalMessage, progressModalTitle, showDialogModal, showProgressModal } from "@stores/Modals";
import type { DialogModalType } from "@types";
import { LogController } from "./LogController";

/**
 * Controller class for handling dialog modals.
 */
export class DialogController {

  /**
   * Logs the title of a shown dialog based on its type.
   * @param type The type of message to log.
   * @param title The title of the dialog.
   */
  private static async logByType(type: DialogModalType, title: string) {
    switch (type) {
      case "INFO":
        await LogController.log(title);
        break;
      case "WARNING":
        await LogController.warn(title);
        break;
      case "ERROR":
        await LogController.error(title);
        break;
    }
  }

  /**
   * Displays a message with a single button.
   * @param title The title of the dialog modal.
   * @param type The type of the dialog modal.
   * @param message The message to display.
   * @param confirmText The text displayed in the button.
   */
  static async message(title: string, type: DialogModalType, message: string, confirmText: string): Promise<boolean> {
    await DialogController.logByType(type, title);
    return new Promise((resolve) => {
      dialogModalTitle.set(title);
      dialogModalType.set(type);
      dialogModalMessage.set(message);
      dialogModalConfirmText.set(confirmText);
      dialogModalConfirm.set(async () => resolve(true));
      dialogModalCancelText.set("");
      dialogModalCancel.set(async () => {});

      showDialogModal.set(true);
    });
  }

  /**
   * Asks the user for input on a decision.
   * @param title The title of the dialog modal.
   * @param type The type of the dialog modal.
   * @param message The message of the dialog modal.
   * @param confirmText The text displayed for the confirm action.
   * @param cancelText The text displayed for the cancel action.
   */
  static async ask(title: string, type: DialogModalType, message: string, confirmText: string, cancelText: string): Promise<boolean> {
    await DialogController.logByType(type, title);
    return new Promise((resolve) => {
      dialogModalTitle.set(title);
      
      dialogModalType.set(type);
      dialogModalMessage.set(message);
      dialogModalConfirmText.set(confirmText);
      dialogModalConfirm.set(async () => resolve(true));
      dialogModalCancelText.set(cancelText);
      dialogModalCancel.set(async () => resolve(false));

      showDialogModal.set(true);
    });
  }

  /**
   * Shows the progress modal with the provided title and message.
   * @param title The title of the progress modal.
   * @param message The body of the progress modal.
   */
  static showProgressModal(title: string, message: string) {
    progressModalTitle.set(title);
    progressModalMessage.set(message);
    showProgressModal.set(true);
  }

  /**
   * Hides the progress modal.
   */
  static hideProgressModal() {
    showProgressModal.set(false);
    progressModalTitle.set("");
    progressModalMessage.set("");
  }
}