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
import { dialog, process } from "@tauri-apps/api";
import { ToastController } from "./ToastController";
import { SettingsManager } from "../utils/SettingsManager";
import { LogController } from "./LogController";
import { get } from "svelte/store";
import { GridTypes, Platforms, activeUserId, appLibraryCache, canSave, currentPlatform, customGameNames, dbFilters, gamesSize, gridType, gridsSize, hiddenGameIds, isOnline, loadingGames, loadingSettings, manualSteamGames, needsSGDBAPIKey, needsSteamKey, nonSteamGames, optionsSize, originalAppLibraryCache, originalLogoPositions, originalSteamShortcuts, renderGamesInList, selectedCleanGridsPreset, selectedGameAppId, selectedGameName, selectedManualGamesAddMethod, showHidden, steamGames, steamGridDBKey, steamKey, steamLogoPositions, steamShortcuts, steamUsers, theme } from "../../stores/AppState";
import { cleanConflicts, gameSearchModalCancel, gameSearchModalDefault, gameSearchModalSelect, gridModalInfo, showCleanConflictDialog, showGameSearchModal, showGridModal, showSettingsModal } from "../../stores/Modals";
import { CacheController } from "./CacheController";
import { RustInterop } from "./RustInterop";
import type { SGDBGame, SGDBImage } from "../models/SGDB";

import { createTippy } from "svelte-tippy";
import "tippy.js/dist/tippy.css"
import { hideAll, type Instance, type Props } from "tippy.js";
import { exit } from "@tauri-apps/api/process";
import { DialogController } from "./DialogController";
import { SteamController } from "./SteamController";
import { findSteamPath } from "../utils/Utils";

/**
 * The main controller for the application.
 */
export class AppController {
  private static cacheController: CacheController = null;
  private static tippyInstance = null;

  static tippy = createTippy({
    hideOnClick: false,
    duration: 100,
    theme: "sarm",
    arrow: true
  });

  static onTippyShow(instance: Instance<Props>): void {
    if (AppController.tippyInstance) {
      hideAll();
    }

    AppController.tippyInstance = instance;
  }

  /**
   * Loads the app's settings.
   */
  private static async loadSettings(): Promise<void> {
    await SettingsManager.setSettingsPath();
    const settings: AppSettings = await SettingsManager.getSettings();

    theme.set(settings.theme);
    document.body.setAttribute("data-theme", settings.theme === 0 ? "dark" : "light");

    renderGamesInList.set(settings.windowSettings.main.gameViewType === 1);
    showHidden.set(settings.showHiddenGames);
    dbFilters.set(settings.windowSettings.main.filters);

    optionsSize.set(settings.windowSettings.main.panels.options);
    gamesSize.set(settings.windowSettings.main.panels.games);
    gridsSize.set(settings.windowSettings.main.panels.grids);

    gridType.set(settings.windowSettings.main.type as GridTypes);

    selectedCleanGridsPreset.set(settings.windowSettings.cleanGrids.preset);
    selectedManualGamesAddMethod.set(settings.windowSettings.manageManualGames.method);

    await findSteamPath(settings.steamInstallPath);

    const users = await RustInterop.getSteamUsers();
    const cleanedUsers: { [id: string]: SteamUser } = {};

    if (Object.keys(users).length === 0) {
      await DialogController.message(
        "No Steam Users Found",
        "ERROR",
        "No Steam users were found while reading the loginusers file. Typically this is because you have not logged in to Steam yet. Please log in at least once, then restart SARM.",
        "Ok",
      );
      await exit(0);
    }

    // ? need to clean the data here bc props can vary in terms of case
    for (const [ id, user ] of Object.entries(users)) {
      const userKeys = Object.keys(user);
      const lowerCaseUser = Object.fromEntries(userKeys.map((key: string) => [ key.toLowerCase(), user[key] ]));

      cleanedUsers[id] = {
        id64: lowerCaseUser.id64,
        id32: lowerCaseUser.id32,
        AccountName: lowerCaseUser.accountname,
        PersonaName: lowerCaseUser.personaname,
        RememberPassword: lowerCaseUser.rememberpassword,
        WantsOfflineMode: lowerCaseUser.wantsofflinemode,
        SkipOfflineModeWarning: lowerCaseUser.skipofflinemodewarning,
        AllowAutoLogin: lowerCaseUser.allowautologin,
        MostRecent: lowerCaseUser.mostrecent,
        Timestamp: lowerCaseUser.timestamp
      }
    }

    steamUsers.set(cleanedUsers);

    const usersList = Object.values(cleanedUsers);

    if (usersList.length === 0) {
      await dialog.message("No Steam Users found. SARM won't work without at least one user. Try signing into Steam after SARM closes.", { title: "No Users Detected", type: "error" });
      LogController.error("Expected to find at least 1 Steam user but found 0.");
      await process.exit(0);
    }

    const activeUser = usersList.find((user) => user.MostRecent === "1") ?? usersList[0];
    activeUserId.set(parseInt(activeUser.id32));

    if (settings.steamGridDbApiKey !== "") {
      steamGridDBKey.set(settings.steamGridDbApiKey);
      needsSGDBAPIKey.set(false);
    }
    
    if (settings.steamApiKeyMap[activeUser.id32] && settings.steamApiKeyMap[activeUser.id32] !== "") {
      steamKey.set(settings.steamApiKeyMap[activeUser.id32]);
      needsSteamKey.set(false);
    }

    if (settings.manualSteamGames.length > 0) {
      manualSteamGames.set(settings.manualSteamGames);
      LogController.log(`Loaded ${settings.manualSteamGames.length} manually added games.`);
    }

    customGameNames.set(settings.customGameNames);
    LogController.log(`Loaded ${Object.keys(settings.customGameNames).length} custom game names.`);

    hiddenGameIds.set(settings.hiddenGameIds);

    if (activeUser.id32 === "0") {
      ToastController.showGenericToast("User id was 0, try opening steam then restart the manager");
    }

    loadingSettings.set(false);
  }

  /**
   * Sets up the AppController.
   * ? Logging complete.
   */
  static async setup(): Promise<void> {
    AppController.cacheController = new CacheController();

    await AppController.loadSettings();

    LogController.log("App setup complete.");
  }

  /**
   * Sets up the AppController.
   * ? Logging complete.
   */
  static async init(): Promise<void> {
    const appIsOnline = get(isOnline);
    LogController.log(`App loaded. IsOnline: ${appIsOnline}.`);

    loadingGames.set(true);
    SteamController.getUserApps().then(() => {
      loadingGames.set(false);
    });

    if (get(needsSGDBAPIKey)) {
      showSettingsModal.set(true);
    }
  }

  /**
   * Saves the current changes
   * ? Logging complete.
   */
  static async saveChanges(): Promise<void> {
    LogController.log("Saving changes...");

    const originalCache = get(originalAppLibraryCache);
    const libraryCache = get(appLibraryCache);
    const shortcuts = get(steamShortcuts);
    const shortcutIds = Object.values(shortcuts).map((shortcut) => shortcut.appid.toString());

    const shortcutEntries = shortcuts.map((shortcut) => [ shortcut.appid, shortcut.icon ]);
    const shortcutIcons = Object.fromEntries(shortcutEntries);

    const originalIconEntries = get(originalSteamShortcuts).map((shortcut) => [ shortcut.appid, shortcut.icon ]);
    const originalShortcutIcons = Object.fromEntries(originalIconEntries);

    const originalLogoPos = get(originalLogoPositions);
    const steamLogoPos = get(steamLogoPositions);
    const logoPosStrings = {};

    for (const [ appid, steamLogo ] of Object.entries(steamLogoPos)) {
      const originalPos = originalLogoPos[appid]?.logoPosition;
      const logoPos = steamLogo.logoPosition;

      if (!logoPos) continue;
      if (logoPos.nHeightPct !== originalPos?.nHeightPct || logoPos.nWidthPct !== originalPos?.nWidthPct || logoPos.pinnedPosition !== originalPos?.pinnedPosition) {
        logoPosStrings[appid] = logoPos.pinnedPosition === "REMOVE" ? "REMOVE" : JSON.stringify(steamLogo);
      }
    }

    const changedPaths = await RustInterop.saveChanges(get(activeUserId).toString(), libraryCache, originalCache, shortcuts, shortcutIcons, originalShortcutIcons, logoPosStrings);
    
    if ((changedPaths as any).error !== undefined) {
      ToastController.showSuccessToast("Changes failed.");
      LogController.log("Changes failed.");
    } else {
      for (const changedPath of (changedPaths as ChangedPath[])) {
        libraryCache[changedPath.appId][changedPath.gridType] = changedPath.targetPath === "REMOVE" ? "" : changedPath.targetPath;
        if (changedPath.gridType === GridTypes.ICON && shortcutIds.includes(changedPath.appId)) {
          const shortcut = shortcuts.find((s) => s.appid.toString() === changedPath.appId);
          shortcut.icon = changedPath.targetPath === "REMOVE" ? "" : changedPath.targetPath;
        }
      }
      originalAppLibraryCache.set(JSON.parse(JSON.stringify(libraryCache)));
      appLibraryCache.set(libraryCache);
      
      originalSteamShortcuts.set(JSON.parse(JSON.stringify(shortcuts)));
      steamShortcuts.set(shortcuts);

      let logoPosEntries = Object.entries(steamLogoPos);
      logoPosEntries = logoPosEntries.filter(([ appid, logoPos ]) => {
        return logoPos.logoPosition && logoPos.logoPosition.pinnedPosition !== "REMOVE"
      });

      originalLogoPositions.set(JSON.parse(JSON.stringify(Object.fromEntries(logoPosEntries))));
      steamLogoPositions.set(JSON.parse(JSON.stringify(Object.fromEntries(logoPosEntries))));
      ToastController.showSuccessToast("Changes saved!");
      LogController.log("Saved changes.");
    }

    canSave.set(false);
  }

  /**
   * Discards the current changes
   * ? Logging complete.
   */
  static discardChanges(): void {
    const originalCache = get(originalAppLibraryCache);
    appLibraryCache.set(JSON.parse(JSON.stringify(originalCache)));

    const originalShortcuts = get(originalSteamShortcuts);
    steamShortcuts.set(JSON.parse(JSON.stringify(originalShortcuts)));

    const originalPositions = get(originalLogoPositions);
    steamLogoPositions.set(JSON.parse(JSON.stringify(originalPositions)));

    ToastController.showSuccessToast("Changes discarded!");
    LogController.log("Discarded changes.");
    
    canSave.set(false);
  }

  /**
   * Discard changes for a given app.
   * @param appId The id of the app to clear changes for.
   */
  static discardChangesForGame(appId: number): void {
    const originalCache = get(originalAppLibraryCache);
    const originalLogoCache = get(originalLogoPositions);
    const originalShortcuts = get(originalSteamShortcuts);

    const appCache = get(appLibraryCache);
    const logoPositionCache = get(steamLogoPositions);
    const shortcuts = get(steamShortcuts);
    const platform = get(currentPlatform);

    if (platform === Platforms.NON_STEAM) {
      let shortcutToEdit = shortcuts.find((shortcut) => shortcut.appid === appId);
      const targetShortcut = originalShortcuts.find((shortcut) => shortcut.appid === appId);
      shortcutToEdit = targetShortcut;
      steamShortcuts.set(JSON.parse(JSON.stringify(shortcuts)));
    }
    
    appCache[appId] = originalCache[appId];
    appLibraryCache.set(JSON.parse(JSON.stringify(appCache)));
    
    logoPositionCache[appId] = originalLogoPositions[appId];
    steamLogoPositions.set(JSON.parse(JSON.stringify(logoPositionCache)));

    ToastController.showSuccessToast("Discarded!");
    LogController.log(`Discarded changes for ${appId}.`);
    
    canSave.set(!((JSON.stringify(originalCache) === JSON.stringify(appCache)) && (JSON.stringify(originalLogoCache) === JSON.stringify(logoPositionCache))));
  }

  /**
   * Clears all custom grids for a given app.
   * @param appId The id of the app to clear art for.
   */
  static clearCustomArtForGame(appId: number): void {
    const appCache = get(appLibraryCache);
    const shortcuts = get(steamShortcuts);
    const platform = get(currentPlatform);

    if (platform === Platforms.NON_STEAM) {
      const shortcutToEdit = shortcuts.find((shortcut) => shortcut.appid === appId);
      shortcutToEdit.icon = "";
      steamShortcuts.set(JSON.parse(JSON.stringify(shortcuts)));
    }

    appCache[appId] = {
      "Capsule": "REMOVE",
      "Wide Capsule": "REMOVE",
      "Hero": "REMOVE",
      "Logo": "REMOVE",
      "Icon": "REMOVE"
    };
    appLibraryCache.set(JSON.parse(JSON.stringify(appCache)));

    ToastController.showSuccessToast("Cleared!");
    LogController.log(`Cleared grids for ${appId}.`);
    
    canSave.set(true);
  }

  /**
   * Clears the custom name for a given app.
   * @param appId The id of the app to clear the name of.
   */
  static clearCustomNameForGame(appId: number): void {
    const customNames = get(customGameNames);
    delete customNames[appId];
    customGameNames.set(customNames);
    LogController.log(`Cleared custom name for ${appId}`);
  }

  /**
   * Clears the logo position for a given app.
   * @param appid The id of the app to clear the logo position of.
   */
  static clearLogoPosition(appid: number): void {
    const logoPositionCache = get(steamLogoPositions);

    logoPositionCache[appid].logoPosition.pinnedPosition = "REMOVE";
    steamLogoPositions.set(JSON.parse(JSON.stringify(logoPositionCache)));

    LogController.log(`Cleared logo position for ${appid}`);

    canSave.set(true);
  }

  /**
   * Clears all custom grids.
   */
  static clearAllGrids(): void {
    const sGames = get(steamGames);
    const manualSGames = get(manualSteamGames);
    const nonSGames = get(steamShortcuts);
    const games = [ ...sGames, ...manualSGames, ...nonSGames ];

    const appCache = get(appLibraryCache);
    const shortcuts = get(steamShortcuts);
    const platform = get(currentPlatform);

    for (const game of games) {
      if (platform === Platforms.NON_STEAM) {
        const shortcutToEdit = shortcuts.find((shortcut) => shortcut.appid === game.appid);
        shortcutToEdit.icon = "";
      }
  
      appCache[game.appid] = {
        "Capsule": "REMOVE",
        "Wide Capsule": "REMOVE",
        "Hero": "REMOVE",
        "Logo": "REMOVE",
        "Icon": "REMOVE"
      };
    }
    
    steamShortcuts.set(JSON.parse(JSON.stringify(shortcuts)));
    appLibraryCache.set(JSON.parse(JSON.stringify(appCache)));

    ToastController.showSuccessToast("Cleared all grids!");
    LogController.log("Cleared all grids.");
    
    canSave.set(true);
  }

  /**
   * Opens a SteamGridDB image for viewing.
   * @param grid The grid info of the grid to view.
   */
  static viewSteamGridImage(grid: SGDBImage): void {
    showGridModal.set(true);
    gridModalInfo.set(grid);
  }

  /**
   * Sets the provided art for the current game and grid type.
   * @param path The path of the new art.
   * ? Logging complete.
   */
  static setCustomArt(path: string): void {
    const type = get(gridType);
    const selectedGameId = get(selectedGameAppId);
    const gameName = get(selectedGameName);
    const selectedGridType = get(gridType);
    const gameImages = get(appLibraryCache);

    if (!gameImages[selectedGameId]) {
      // @ts-ignore
      gameImages[selectedGameId] = {};
    }
    
    gameImages[selectedGameId][selectedGridType] = path;

    if (get(currentPlatform) === Platforms.NON_STEAM && type === GridTypes.ICON) {
      const shortcuts = get(steamShortcuts);
      const shortcut = shortcuts.find((s) => s.appid === selectedGameId);
      shortcut.icon = path;
      steamShortcuts.set(shortcuts);
    }

    appLibraryCache.set(gameImages);
    canSave.set(true);

    LogController.log(`Set ${selectedGridType} for ${gameName} (${selectedGameId}) to ${path}.`);
  }

  /**
   * Sets the image for a game to the provided image.
   * @param appId The id of the grid.
   * @param url The url of the SteamGridDB image.
   * ? Logging complete.
   */
  static async setSteamGridArt(appId: number, url: URL): Promise<void> {
    let imgUrl = url.toString();
    if (imgUrl.endsWith("?")) imgUrl = imgUrl.substring(0, imgUrl.length - 1);
    
    const selectedGameId = get(selectedGameAppId);
    const gameName = get(selectedGameName);
    const selectedGridType = get(gridType);
    const gameImages = get(appLibraryCache);

    const localPath = await AppController.cacheController.getGridImage(appId, imgUrl);
    
    if (localPath) {

      if (!gameImages[selectedGameId]) {
        // @ts-ignore
        gameImages[selectedGameId] = {};
      }

      gameImages[selectedGameId][selectedGridType] = localPath;
      
      if (get(currentPlatform) === Platforms.NON_STEAM && selectedGridType === GridTypes.ICON) {
        const shortcuts = get(steamShortcuts);
        const shortcut = shortcuts.find((s) => s.appid === selectedGameId);
        shortcut.icon = localPath;
        steamShortcuts.set(shortcuts);
      }

      appLibraryCache.set(gameImages);
      canSave.set(true);

      LogController.log(`Set ${selectedGridType} for ${gameName} (${selectedGameId}) to ${localPath}.`);
    } else {
      LogController.log(`Failed to set ${selectedGridType} for ${gameName} (${selectedGameId}) to ${localPath}.`);
    }
  }

  /**
   * Sets the logo position for the provided game.
   * @param appId The id of the app to save the logo position for.
   * @param pinPosition The position of the logo.
   * @param heightPct The height percentage.
   * @param widthPct The width percentage.
   * ? Logging complete.
   */
  static setLogoPosition(appId: number, pinPosition: LogoPinPositions, heightPct: number, widthPct: number): void {
    const logoPositions = get(steamLogoPositions);

    const currentPos = logoPositions[appId];
    logoPositions[appId] = {
      nVersion: currentPos?.nVersion ?? 1,
      logoPosition: {
        pinnedPosition: pinPosition,
        nHeightPct: heightPct,
        nWidthPct: widthPct
      }
    }

    steamLogoPositions.set(logoPositions);

    canSave.set(true);

    LogController.log(`Updated logo position for game ${appId}`);
  }

  /**
   * Batch applies grids to the provided games.
   * @param appIds The list of game ids.
   * ? Logging Complete.
   */
  static async batchApplyGrids(appIds: string[]): Promise<void> {
    ToastController.showGenericToast("Starting Batch Apply...");
    LogController.batchApplyLog(`Starting batch apply for ${appIds.length} games...`);
    await AppController.cacheController.batchApplyGrids(appIds);
  }

  /**
   * Prompts the user to select a .zip file containing steam game art.
   * ? Logging complete.
   */
  static async importGrids(): Promise<void> {
    LogController.log("Prompting user to grids.");
    const shortcuts = get(steamShortcuts);
    const idsMapEntries: [string, string][] = Object.entries(shortcuts).map(([ shortcutId, shortcut ]) => { return [ shortcut.AppName, shortcutId ]; });
    const shortcutIdsMap = Object.fromEntries(idsMapEntries);

    const [ succeeded, iconsToSet ] = await RustInterop.importGridsFromZip(get(activeUserId).toString(), shortcutIdsMap);

    if (succeeded) {
      const shortcuts = get(steamShortcuts);
      const shortcutIds = Object.values(shortcuts).map((shortcut) => shortcut.appid.toString());
      
      for (const [ id, path ] of Object.entries(iconsToSet)) {
        if (shortcutIds.includes(id)) {
          const shortcut = shortcuts.find((s) => s.appid.toString() === id);
          shortcut.icon = path;
        }
      }

      ToastController.showSuccessToast("Import successful!");
      LogController.log("Successfully imported user's grids.");
      
      await AppController.saveChanges();

      const filteredCache = await SteamController.getCacheData(get(nonSteamGames));
      originalAppLibraryCache.set(filteredCache);
      appLibraryCache.set(filteredCache);
    } else {
      ToastController.showWarningToast("Cancelled.");
      LogController.log("Import grids cancelled.");
    }
  }

  /**
   * Exports the user's grids directory to a .zip file and prompts them to save.
   * ? Logging complete.
   */
  static async exportGrids(): Promise<void> {
    LogController.log("Prompting user to export.");
    const shortcuts = get(steamShortcuts);
    const games = get(steamGames);
    const manualGames = get(manualSteamGames);

    let platformEntries: [string, string][] = shortcuts.map((shortcut) => { return [ shortcut.appid.toString(), "nonsteam" ]; });
    platformEntries = platformEntries.concat([ ...games, ...manualGames ].map((game) => { return [ game.appid.toString(), "steam" ]; }));
    const platformIdMap = Object.fromEntries(platformEntries);

    const namesMapEntries: [string, string][] = Object.entries(shortcuts).map(([ shortcutId, shortcut ]) => { return [ shortcutId, shortcut.AppName ]; });
    const shortcutNamesMap = Object.fromEntries(namesMapEntries);

    const success = await RustInterop.exportGridsToZip(get(activeUserId).toString(), platformIdMap, shortcutNamesMap);

    if (success) {
      ToastController.showSuccessToast("Export successful!");
      LogController.log("Successfully exported user's grids.");
    } else {
      ToastController.showWarningToast("Cancelled.");
      LogController.log("Export grids cancelled.");
    }
  }

  /**
   * Gets a list of grids for the provided game.
   * @param appId The id of the app to get.
   * @param page The page of results to get.
   * @param selectedSteamGridId Optional id of the current steamGridGame.
   * @param isCustomName Whether the app name is custom or not.
   * @returns A promise resolving to a list of the results.
   * ? Logging complete.
   */
  static async getSteamGridArt(appId: number, page: number, selectedSteamGridId: string | null, isCustomName: boolean): Promise<SGDBImage[]> {
    return await AppController.cacheController.fetchGrids(appId, get(selectedGameName), page, get(currentPlatform), true, selectedSteamGridId, isCustomName);
  }

  /**
   * Searches SGDB for the provided query.
   * @param query The search query to use.
   * @returns A promise resolving to the results array, or null if it timed out.
   */
  static async searchSGDBForGame(query: string): Promise<SGDBGame[] | null> {
    return await AppController.cacheController.searchForGame(query);
  }

  /**
   * Shows the game search modal and returns the result.
   * @param defaultName The currently selected game name.
   * @returns A promise resolving to a tuple of [gameName, gameId] or null, based on the user's selection.
   */
  static async getIdForSearchQuery(defaultName: string): Promise<SGDBGame | null> {
    return new Promise<SGDBGame | null>((resolve) => {
      gameSearchModalDefault.set(defaultName);
      gameSearchModalSelect.set((game: SGDBGame) => {
        resolve(game);
      });
      gameSearchModalCancel.set(() => resolve(null));
      showGameSearchModal.set(true);
    });
  }

  /**
   * Looks through the grids in the user's grid folder, and deletes any for games that no longer exist.
   * @param preset The selected preset for cleaning.
   * @param selectedGameIds The list of ids of games to delete grids for.
   */
  static async cleanDeadGrids(preset: "clean" | "custom", selectedGameIds: string[], ): Promise<void> {
    const appids = [
      ...get(steamGames).map((game) => game.appid.toString()),
      ...get(nonSteamGames).map((game) => game.appid.toString()),
      ...get(manualSteamGames).map((game) => game.appid.toString()),
    ];

    const conflicts = await RustInterop.cleanGrids(get(activeUserId).toString(), preset as string, appids, selectedGameIds);
    
    if (conflicts.length > 0) {
      cleanConflicts.set(conflicts);
      showCleanConflictDialog.set(true);
    } else {
      ToastController.showSuccessToast("Finished cleaning!");
      LogController.log("Finished cleaning!");
    }
  }

  /**
   * Gets the steam apps with start menu tiles.
   * @returns A record of appid -> iconPath.
   */
  static async getAppTiles(): Promise<Record<string, string>> {
    return await RustInterop.getAppsWithTiles();
  }

  /**
   * Sets the current app icons to their app tiles.
   * @param appIconsPaths The record of appid -> iconPath.
   * @param appTilePaths The record of appid -> tilePath.
   * @returns An array containing the ids of any tiles that failed to be updated
   */
  static async setAppTiles(appIconsPaths: Record<string, string>, appTilePaths: Record<string, string>): Promise<string[]> {
    return await RustInterop.writeAppTiles(appIconsPaths, appTilePaths);
  }

  /**
   * Function run on app closing/refreshing.
   * ? Logging complete.
   */
  static async destroy(): Promise<void> {
    await AppController.cacheController.destroy();
    LogController.log("App destroyed.");
  }

  /**
   * Checks if the app can go online, goes online if so, otherwise notifies the user.
   * ? Logging complete.
   */
  static tryGoOnline(): void {
    LogController.log("Attempting to go online...");
    if (navigator.onLine) {
      isOnline.set(true);
      ToastController.showSuccessToast("Now Online!");
      LogController.log("Attempted succeeded. Now online.")
    } else {
      ToastController.showWarningToast("Can't go online.");
      LogController.log("Attempt failed. Continuing in offline mode.");
    }
  }

  /**
   * Reloads the app.
   * ? Logging complete.
   */
  static async reload(): Promise<void> {
    const shouldReload = await DialogController.ask("Warning!", "WARNING", "Are you sure you want to reload? Any changes will be lost!", "Ok", "Cancel");
    if (shouldReload) {
      LogController.log("Reloading...");
      await process.relaunch();
    }
  }

  /**
   * Prompts the user to decide if they want to continue offline.
   * @returns A promise resolving to the user's decisions.
   * ? Logging complete.
   */
  static async promptOffline(): Promise<boolean> {
    LogController.log("Notifying user that they are offline...");
    return await dialog.ask("You are offline. Steam Art Manager won't work properly/fully. Do you want to continue?", {
      title: "No Internet Connection",
      type: "warning"
    });
  }

  /**
   * Changes the currently selected steam user.
   * @param userId The id of the new user.
   * ? Logging complete.
   */
  static async changeSteamUser(userId: string): Promise<void> {
    const users = get(steamUsers);
    const user = Object.values(users).find((user) => user.id32 === userId);
    const oldUserId = get(activeUserId).toString();

    if (userId !== oldUserId) {
      const shouldContinue = await dialog.confirm("Switching users will discard your changes, are you sure you want to continue?", {
        title: "Confirm user change",
        type: "warning"
      });

      if (shouldContinue) {
        AppController.discardChanges();

        activeUserId.set(parseInt(userId));

        const settings = await SettingsManager.getSettings();
        if (settings.steamApiKeyMap[userId] && settings.steamApiKeyMap[userId] !== "") {
          steamKey.set(settings.steamApiKeyMap[userId]);
        } else {
          steamKey.set("");
          needsSteamKey.set(true);
          await dialog.message("No Steam Key found for this user. Consider adding one in settings.", {
            title: "Missing Steam API Key"
          });
        }

        loadingGames.set(true);
        SteamController.getUserApps().then(() => {
          loadingGames.set(false);
          LogController.log(`Switched user to ${user.AccountName} id: ${userId}.`);
          ToastController.showSuccessToast("Switched User!");
        });
      } else {
        LogController.log(`Cancelled user switch to ${user.AccountName} id: ${userId}.`);
        ToastController.showGenericToast("Cancelled.");
      }
    } else {
      LogController.log(`New user id ${userId} matched old id ${oldUserId}.`);
    }
  }

  /**
   * Checks if the sgdb api client is initialized.
   * @returns True if the sgdb api client is initialized.
   */
  static sgdbClientInitialized(): boolean {
    return !!AppController.cacheController?.client;
  }
}