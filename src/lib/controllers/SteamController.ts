import * as fs from "@tauri-apps/plugin-fs";
import { fetch } from "@tauri-apps/plugin-http";
import { get } from "svelte/store";

import { activeUserId, appLibraryCache, isOnline, manualSteamGames, needsSteamKey, nonSteamGames, originalAppLibraryCache, originalLogoPositions, originalSteamShortcuts, requestTimeoutLength, steamGames, steamKey, steamLogoPositions, steamShortcuts, unfilteredLibraryCache } from "@stores/AppState";

import { LogController } from "./utils/LogController";
import { RustInterop } from "./utils/RustInterop";
import { ToastController } from "./utils/ToastController";

import { path } from "@tauri-apps/api";
import { exit } from "@tauri-apps/plugin-process";
import { GridTypes, type GameStruct, type LibraryCacheEntry, type SteamLogoConfig } from "@types";
import { XMLParser } from "fast-xml-parser";
import { DialogController } from "./utils/DialogController";

type LUTMap = Record<string, GridTypes>;

const gridTypeLUT: LUTMap = {
  "capsule": GridTypes.CAPSULE,
  "wide_capsule": GridTypes.WIDE_CAPSULE,
  "hero": GridTypes.HERO,
  "icon": GridTypes.ICON,
  "logo": GridTypes.LOGO
}

const libraryCacheLUT: LUTMap = {
  "library_600x900": GridTypes.CAPSULE,
  "header": GridTypes.WIDE_CAPSULE,
  "library_hero": GridTypes.HERO,
  "icon": GridTypes.ICON,
  "logo": GridTypes.LOGO
}

export class SteamController {
  private static domParser = new DOMParser();
  private static xmlParser = new XMLParser();
  
  /**
   * Caches the steam game logo configs.
   * @param logoConfigPaths The list of logoConfig paths.
   * ? Logging complete.
   */
  private static async cacheLogoConfigs(logoConfigPaths: string[]): Promise<void> {
    const configs: Record<string, SteamLogoConfig> = {};

    for (const configPath of logoConfigPaths) {
      const fileName = await path.basename(configPath);
      const id = parseInt(fileName.substring(0, fileName.lastIndexOf(".")));

      if (!isNaN(id)) {
        const contents = await fs.readTextFile(configPath);
        const jsonContents = JSON.parse(contents);
        if (jsonContents.logoPosition) configs[id.toString()] = jsonContents;
      }
    }

    originalLogoPositions.set(structuredClone(configs));
    steamLogoPositions.set(structuredClone(configs));

    LogController.log(`Cached logo positions for ${Object.entries(configs).length} games.`);
  }

  /**
   * Gets the steam game image data.
   * @param shortcuts The list of non steam games.
   * @param gridsDir The grids directory.
   * @param gridDirContents The contents of the grids dir.
   * @param libraryCacheDir The library cache directory.
   * @param libraryCacheContents The contents of the library cache dir.
   * @returns A promise resolving to the image data.
   */
  static async getCacheData(shortcuts: GameStruct[]): Promise<{ [appid: string]: LibraryCacheEntry }> {
    const shortcutIds = Object.values(shortcuts).map((shortcut) => shortcut.appid.toString());
    const [ unfilteredCache, filteredCache, logoConfigPaths ] = await RustInterop.getCacheData(get(activeUserId).toString(), shortcutIds);

    unfilteredLibraryCache.set(unfilteredCache);
    originalAppLibraryCache.set(structuredClone(filteredCache));
    appLibraryCache.set(filteredCache);
    
    await SteamController.cacheLogoConfigs(logoConfigPaths);

    return filteredCache;
  }

  /**
   * Gets the current user's steam games from their community profile.
   * @param bUserId The u64 id of the current user.
   * @returns A promise resolving to a list of steam games.
   * ? Logging complete.
   */
  private static async getGamesFromSteamCommunity(bUserId: bigint): Promise<GameStruct[]> {
    const requestTimeout = get(requestTimeoutLength);
    // LogController.log("Loading games from Steam Community page...");

    const res = await fetch(`https://steamcommunity.com/profiles/${bUserId}/games?xml=1`, {
      method: "GET",
      signal: AbortSignal.timeout(requestTimeout)
    });
    
    if (res.ok) {
      const games = SteamController.xmlParser.parse(await res.text());

      return games.gamesList.games.game.map((game: any) => {
        return {
          "appid": parseInt(game.appID),
          "name": game.name
        }
      }).sort((gameA: GameStruct, gameB: GameStruct) => gameA.name.localeCompare(gameB.name));
    } else {
      const err = SteamController.xmlParser.parse(await res.text());

      ToastController.showWarningToast("You Steam profile is private");
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
  private static async getGamesFromSteamAPI(bUserId: bigint): Promise<GameStruct[]> {
    const requestTimeout = get(requestTimeoutLength);
    // LogController.log("Loading games from Steam API...");

    const res = await fetch(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${get(steamKey)}&steamid=${bUserId}&format=json&include_appinfo=true&include_played_free_games=true`, {
      method: "GET",
      signal: AbortSignal.timeout(requestTimeout)
    });

    if (res.ok) {
      return (await res.json()).response.games.map((game: any) => {
        return {
          "appid": game.appid,
          "name": game.name
        }
      }).sort((gameA: GameStruct, gameB: GameStruct) => gameA.name.localeCompare(gameB.name));
    } else {
      const err = SteamController.xmlParser.parse(await res.text());

      ToastController.showWarningToast("Check your Steam API Key");
      LogController.warn(`Error loading games from the Steam API: Status ${res.status}. Message: ${JSON.stringify(err)}. User should check their Steam API Key.`);
      return [];
    }
  }

  /**
   * Gets the current user's steam games by reading the appinfo.vdf.
   * @returns A promise resolving to a list of steam games.
   * ? Logging complete.
   */
  private static async getGamesFromAppinfo(): Promise<GameStruct[]> {
    // LogController.log("Loading games from appinfo.vdf...");

    const vdf = await RustInterop.readAppinfoVdf();

    return vdf.entries.map((game: any) => {
      return {
        appid: game.appid,
        name: typeof game.common.name === "string" ? game.common.name.replace(/[^\x00-\x7F]/g, "") : game.common.name.toString()
      };
    }).sort((gameA: GameStruct, gameB: GameStruct) => gameA.name.localeCompare(gameB.name));
  }

  /**
   * Gets the current user's steam games by reading the localconfig.vdf.
   * @returns A promise resolving to a list of steam games.
   * ? Logging complete.
   */
  private static async getGamesFromLocalconfig(): Promise<GameStruct[]> {
    // LogController.log("Loading games from localconfig.vdf...");

    const userId = get(activeUserId);
    const appInfoGames = await SteamController.getGamesFromAppinfo();
    const localConfigAppIds: string[] = await RustInterop.readLocalconfigVdf(userId.toString());
    return appInfoGames.filter((game) => localConfigAppIds.includes(game.appid.toString()));
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

    let games: GameStruct[] = [];
    
    // * Try loading games from the Steam API
    if (online && !needsSteamAPIKey) {
      games = await this.getGamesFromSteamAPI(bUserId);
      
      if (games.length > 0) {
        LogController.log(`Loaded ${games.length} games from Steam API.`);
      }
    }
    
    // * Try loading games using the user's Steam Profile.
    if (games.length === 0 && online) {
      try {
        DialogController.showProgressModal("Fetching games", "Loading games listed on your public steam profile...");
        games = (await this.getGamesFromSteamCommunity(bUserId)).filter((entry: GameStruct) => !entry.name.toLowerCase().includes("soundtrack"));
        
        if (games.length > 0) {
          LogController.log(`Loaded ${games.length} games from Steam Community page.`);
        }
      } catch (e: any) {
        LogController.error(e.message);
      }

      DialogController.hideProgressModal();
    }
    
    // * Try loading games from the file system
    if (games.length === 0) {
      DialogController.showProgressModal("Fetching games", "Loading games listed on your localconfig.vdf...");
      games = await this.getGamesFromLocalconfig();
      
      if (games.length > 0) {
        LogController.log(`Loaded ${games.length} games from localconfig.vdf.`);
      }
      
      DialogController.hideProgressModal();
    }

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
        "name": shortcut.AppName ?? shortcut.appname
      };
    });
    nonSteamGames.set(structuredShortcuts);

    
    const filteredCache = await SteamController.getCacheData(structuredShortcuts);
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
      ToastController.showWarningToast(`Removed ${Math.abs(manualGames.length - originalManualGames.length)} duplicate manual games!`);
    }
    
    if (games.length > 0 || structuredShortcuts.length > 0) {
      ToastController.showSuccessToast("Games Loaded!");
    } else {
      ToastController.showWarningToast("Failed to load games!");
    }
  }
}