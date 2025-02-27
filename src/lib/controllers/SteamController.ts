import { fetch } from "@tauri-apps/plugin-http";
import { get } from "svelte/store";

import { activeUserId, appLibraryCache, isOnline, manualSteamGames, needsSteamKey, nonSteamGames, originalAppLibraryCache, originalSteamShortcuts, requestTimeoutLength, showErrorSnackbar, showInfoSnackbar, steamGames, steamKey, steamShortcuts, unfilteredLibraryCache } from "@stores/AppState";

import { LogController } from "./utils/LogController";
import { RustInterop } from "./utils/RustInterop";

import { exit } from "@tauri-apps/plugin-process";
import { type GameStruct, type LibraryCacheEntry } from "@types";
import { XMLParser } from "fast-xml-parser";
import { DialogController } from "./utils/DialogController";

export class SteamController {
  private static xmlParser = new XMLParser();

  /**
   * Gets the Steam grid cache data.
   * @param shortcuts The list of non steam games.
   * @returns A promise resolving to the Steam grid cache data.
   */
  static async getCacheData(steamApps: GameStruct[], shortcuts: GameStruct[]): Promise<{ [appid: string]: LibraryCacheEntry }> {
    const shortcutIds = Object.values(shortcuts).map((shortcut) => shortcut.appid.toString());
    const [ unfilteredCache, filteredCache ] = await RustInterop.getCacheData(get(activeUserId).toString(), shortcutIds, steamApps);

    unfilteredLibraryCache.set(unfilteredCache);
    originalAppLibraryCache.set(structuredClone(filteredCache));
    appLibraryCache.set(filteredCache);

    return filteredCache;
  }

  /**
   * Gets the current user's steam games by reading the appinfo.vdf.
   * @returns A promise resolving to a list of steam games.
   * ? Logging complete.
   */
  private static async getGamesFromAppinfo(ids: string[]): Promise<GameStruct[]> {
    // LogController.log("Loading games from appinfo.vdf...");

    const vdf = await RustInterop.readAppinfoVdf();

    return vdf.entries.filter((entry: any) => ids.includes(entry.appid)).map((entry: any) => {
      const libraryAssets = entry.common.library_assets_full;
      
      return {
        appid: entry.appid,
        name: typeof entry.common.name === "string" ? entry.common.name.replace(/[^\x00-\x7F]/g, "") : entry.common.name.toString(),
        gridInfo: {
          icon: entry.common.icon ? (entry.common.icon + ".jpg") : "",
          capsule: libraryAssets?.library_capsule?.image.english ?? "",
          wideCapsule: libraryAssets?.library_header?.image.english ?? entry.common?.header_image?.english ?? "",
          hero: libraryAssets?.library_hero?.image.english ?? "",
          logo: libraryAssets?.library_logo?.image.english ?? "",
        }
      };
    }).sort((gameA: GameStruct, gameB: GameStruct) => gameA.name.localeCompare(gameB.name));
  }

  /**
   * Gets the current user's steam games from their community profile.
   * @param bUserId The u64 id of the current user.
   * @returns A promise resolving to a list of steam games.
   * ? Logging complete.
   */
  private static async getGamesFromSteamCommunity(bUserId: bigint): Promise<string[]> {
    const requestTimeout = get(requestTimeoutLength);
    // LogController.log("Loading games from Steam Community page...");

    const res = await fetch(`https://steamcommunity.com/profiles/${bUserId}/games?xml=1`, {
      method: "GET",
      signal: AbortSignal.timeout(requestTimeout)
    });
    
    if (res.ok) {
      const profileGames = SteamController.xmlParser.parse(await res.text());

      return profileGames.gamesList.games.game.filter((game: any) => !game.name.toLowerCase().includes("soundtrack")).map((game: any) => game.appID);
    } else {
      const err = SteamController.xmlParser.parse(await res.text());

      get(showErrorSnackbar)({ message: "You Steam profile is private" });
      LogController.warn(`Error loading games from the user's Steam profile: Status ${res.status}. Message: ${JSON.stringify(err)}.`);
      return [];
    }
  }

  /**
   * Gets the current user's steam games from the Steam Web API.
   * @param bUserId The u64 id of the current user.
   * @returns A promise resolving to a list of steam games.
   * ? Logging complete.
   */
  private static async getGamesFromSteamAPI(bUserId: bigint): Promise<string[]> {
    const requestTimeout = get(requestTimeoutLength);
    const res = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${get(steamKey)}&steamid=${bUserId}&format=json&include_appinfo=true&include_played_free_games=true`, {
      method: "GET",
      signal: AbortSignal.timeout(requestTimeout)
    });

    if (res.ok) {
      return (await res.json()).response.games.map((game: any) => game.appid);
    } else {
      const err = SteamController.xmlParser.parse(await res.text());

      get(showErrorSnackbar)({ message: "Check your Steam API Key" });
      LogController.warn(`Error loading games from the Steam API: Status ${res.status}. Message: ${JSON.stringify(err)}. User should check their Steam API Key.`);
      return [];
    }
  }

  /**
   * Gets the current user's steam games by reading the localconfig.vdf.
   * @returns A promise resolving to a list of steam games.
   * ? Logging complete.
   */
  private static async filterByLocalConfig(): Promise<string[]> {
    const userId = get(activeUserId);
    return await RustInterop.readLocalconfigVdf(userId.toString());
  }

  /**
   * Loads the user's Steam apps.
   * @returns The list of steam apps.
   * ? Logging complete.
   */
  static async getSteamApps(): Promise<GameStruct[]> {
    const online = get(isOnline);
    const needsSteamAPIKey = get(needsSteamKey);

    const userId = get(activeUserId);
    const bUserId = BigInt(userId) + 76561197960265728n;

    let ids: string[] = [];
    
    // * Try loading games from the Steam API
    if (online && !needsSteamAPIKey) {
      ids = await this.getGamesFromSteamAPI(bUserId);
      
      if (ids.length > 0) {
        LogController.log(`Loaded ${ids.length} games from Steam API.`);
      }
    }
    
    // * Try loading games using the user's Steam Profile.
    if (ids.length === 0 && online) {
      try {
        DialogController.showProgressModal("Fetching games", "Loading games listed on your public steam profile...");
        ids = (await this.getGamesFromSteamCommunity(bUserId));
        
        if (ids.length > 0) {
          LogController.log(`Loaded ${ids.length} games from Steam Community page.`);
        }
      } catch (e: any) {
        LogController.error(e.message);
      }

      DialogController.hideProgressModal();
    }
    
    // * Try loading games from the file system
    if (ids.length === 0) {
      DialogController.showProgressModal("Fetching games", "Loading games listed on your localconfig.vdf...");
      ids = await this.filterByLocalConfig();
      
      if (ids.length > 0) {
        LogController.log(`Loaded ${ids.length} games from localconfig.vdf.`);
      }
      
      DialogController.hideProgressModal();
    }
    
    const games = await SteamController.getGamesFromAppinfo(ids);

    return games;
  }

  /**
   * Gets the user's apps.
   * ? Logging complete.
   */
  static async getUserApps(): Promise<void> {
    const userId = get(activeUserId);

    const libraryCacheDir = await RustInterop.getLibraryCacheDirectory();
    if (libraryCacheDir.startsWith("DNE")) {
      await DialogController.message("LibraryCache Did Not Exist!", "ERROR", `SARM was unable to read your librarycache folder. The path ${libraryCacheDir.substring(3)} did not exist. Please open Steam and go to the library tab so it caches a few game grids.`, "Ok");
      await exit(0);
    }

    const [ shortcuts, steamApps ] = await Promise.all([
      RustInterop.readShortcutsVdf(userId.toString()),
      SteamController.getSteamApps(),
    ]);
    
    originalSteamShortcuts.set(structuredClone(Object.values(shortcuts)));
    steamShortcuts.set(Object.values(shortcuts));
    
    const structuredShortcuts = Object.values(shortcuts).map((shortcut: any) => {
      return {
        "appid": shortcut.appid,
        "name": shortcut.AppName ?? shortcut.appName ?? shortcut.appname
      };
    });
    nonSteamGames.set(structuredShortcuts);

    
    const filteredCache = await SteamController.getCacheData(steamApps, structuredShortcuts);
    const filteredKeys = Object.keys(filteredCache);
      

    // * Set the global state with the loaded values.
    const games = steamApps.filter((entry: GameStruct) => filteredKeys.includes(entry.appid.toString()));
    steamGames.set(games);

    const originalManualGames = get(manualSteamGames);
    const manualGames = originalManualGames.filter((manualGame) => {
      const matchingSteamGame = games.find((sGame) => sGame.appid === manualGame.appid);
      if (matchingSteamGame) {
        LogController.warn(`Found manually added game with the same appid (${manualGame.appid}) as ${matchingSteamGame.name}. Removing it`);
      }

      return !matchingSteamGame;
    });

    if (manualGames.length !== originalManualGames.length) {
      manualSteamGames.set(structuredClone(manualGames));
      get(showErrorSnackbar)({ message: `Removed ${Math.abs(manualGames.length - originalManualGames.length)} duplicate manual games!` });
    }
    
    if (games.length > 0 || structuredShortcuts.length > 0) {
      get(showInfoSnackbar)({ message: "Games loaded" });
    } else {
      get(showErrorSnackbar)({ message: "Failed to load games" });
    }
  }
}