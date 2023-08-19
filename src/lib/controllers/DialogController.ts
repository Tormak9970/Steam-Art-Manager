import { dialogModalCancel, dialogModalCancelText, dialogModalConfirm, dialogModalConfirmText, dialogModalMessage, dialogModalTitle, dialogModalType, showDialogModal } from "../../Stores";

/**
 * Controller class for handling dialog modals.
 */
export class DialogController {

  /**
   * Displays a message with a single button.
   * @param title The title of the dialog modal.
   * @param type The type of the dialog modal.
   * @param message The message to display.
   * @param confirmText The text displayed in the button.
   */
  static async message(title: string, type: DialogModalType, message: string, confirmText: string): Promise<boolean> {
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
}