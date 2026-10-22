
export class CEFInjectionController {
  private static async checkIfCEFDebugEnabled(): Promise<boolean> {
    return false
  }

  private static async addCEFDebugFile(): Promise<void> {

  }
  
  private static async removeCEFDebugFile(): Promise<void> {

  }

  /**
   * Starts CEF Remote Debug Injection.
   * @param needsRestart Whether SARM needs to restart.
   */
  static async startCEFInjection(needsRestart: boolean): Promise<void> {
    // TODO: Check if CEF Debug file exists
      // TODO: if !exists 
        // TODO: if steamRunning
          // TODO: prompt user to shut down steam
        // TODO: call addCEFDebugFile()

    if (needsRestart) {
      // TODO: restart sarm
    }
    
    // TODO: if !steamRunning
      // TODO: if startSteamOnLaunch
        // TODO: start automatically
      // TODO: else
        // TODO: prompt user to start steam (mention they can do this automatically in settings), then click "I've started it"

    // TODO: call getDataFromCEF
    
    // ! Add setting for automatically start steam if not running when SARM Launched. Dependent on CEF setting
      // ! add 'linked UI' for related setting
  }

  /**
   * Ends CEF Remote Debug Injection.
   */
  static async endCEFInjection(): Promise<void> {
    // TODO: Ask users if they would like to turn of CEF Remote Debug for Steam
      // TODO: explain that if they don't know what that means they should turn it off
        // TODO: disable if yes

    // TODO: Notify that SARM needs to restart, and ask if they want to save changes
    // TODO: restart
  }

  static async getDataFromCEF() {
    
  }
}