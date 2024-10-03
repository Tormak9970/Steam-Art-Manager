import * as fs from "@tauri-apps/plugin-fs";
import { fetch } from "@tauri-apps/plugin-http";
import { get } from "svelte/store";
import { xml2json } from "../external/xml2json";

import { activeUserId, appLibraryCache, isOnline, manualSteamGames, needsSteamKey, nonSteamGames, originalAppLibraryCache, originalLogoPositions, originalSteamShortcuts, requestTimeoutLength, steamGames, steamKey, steamLogoPositions, steamShortcuts, unfilteredLibraryCache } from "../../stores/AppState";

import { LogController } from "./LogController";
import { RustInterop } from "./RustInterop";
import { ToastController } from "./ToastController";

import { join } from "@tauri-apps/api/path";
import { exit } from "@tauri-apps/plugin-process";
import { GridTypes, type GameStruct, type LibraryCacheEntry, type SteamLogoConfig } from "@types";
import { getIdFromGridName } from "@utils";
import { DialogController } from "./DialogController";

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
  
  /**
   * Caches the steam game logo configs.
   * @param gridsDir The grids directory
   * @param logoConfigs The list of logoConfig files.
   * ? Logging complete.
   */
  private static async cacheLogoConfigs(gridsDir: string, logoConfigs: fs.DirEntry[]): Promise<void> {
    const configs: Record<string, SteamLogoConfig> = {};

    for (const logoConfig of logoConfigs) {
      const id = parseInt(logoConfig.name.substring(0, logoConfig.name.lastIndexOf(".")));

      if (!isNaN(id)) {
        const contents = await fs.readTextFile(await join(gridsDir, logoConfig.name));
        const jsonContents = JSON.parse(contents);
        if (jsonContents.logoPosition) configs[id.toString()] = jsonContents;
      }
    }

    originalLogoPositions.set(structuredClone(configs));
    steamLogoPositions.set(structuredClone(configs));

    LogController.log(`Cached logo positions for ${Object.entries(configs).length} games.`);
  }
  
  /**
   * Filters and structures the library grids based on the app's needs.
   * @param gridsDir The grids directory.
   * @param gridsDirContents The contents of the grids dir.
   * @param shortcutIds The list of loaded shortcuts ids.
   * @returns The filtered and structured grids dir.
   * ? Logging complete.
   */
  private static async filterGridsDir(gridsDir: string, gridsDirContents: fs.DirEntry[], shortcutsIds: string[]): Promise<[{ [appid: string]: LibraryCacheEntry }, fs.DirEntry[]]> {
    const resKeys: string[] = [];
    const logoConfigs = [];
    const res: { [appid: string]: LibraryCacheEntry } = {};

    const foundApps: string[] = [];

    for (const fileEntry of gridsDirContents) {
      if (fileEntry.name.endsWith(".json")) {
        logoConfigs.push(fileEntry);
        continue;
      }
      
      const [ appid, type ] = getIdFromGridName(fileEntry.name);
        
      const idTypeString = `${appid}_${type}`;

      if (foundApps.includes(idTypeString)) {
        ToastController.showWarningToast("Duplicate grid found. Try cleaning");
        LogController.warn(`Duplicate grid found for ${appid}.`);
        continue;
      }
      
      //? Since we have to poison the cache for icons, we also don't want to load them from the grids folder. Shortcuts don't need this.
      if (gridTypeLUT[type] && (type !== "icon" || shortcutsIds.includes(appid))) {
        if (!resKeys.includes(appid)) {
          resKeys.push(appid);
          res[appid] = {};
        }

        res[appid][gridTypeLUT[type]] = await join(gridsDir, fileEntry.name);
      }
    }

    return [ res, logoConfigs ];
  }

  /**
   * Filters and structures the library cache based on the app's needs.
   * @param libraryCacheDir The library cache dir.
   * @param libraryCacheContents The contents of the library cache.
   * @param gridsInfos The filtered grid infos.
   * @param shortcutIds The list of loaded shortcuts ids.
   * @returns The filtered and structured library cache.
   * ? Logging complete.
   */
  private static async filterLibraryCache(libraryCacheDir: string, libraryCacheContents: fs.DirEntry[], gridsInfos: { [appid: string]: LibraryCacheEntry }, shortcutIds: string[]): Promise<{ [appid: string]: LibraryCacheEntry }> {
    const resKeys = Object.keys(gridsInfos);
    const res: { [appid: string]: LibraryCacheEntry } = gridsInfos;

    const unfilteredKeys: string[] = [];
    const unfiltered: { [appid: string]: LibraryCacheEntry } = {};

    for (const fileEntry of libraryCacheContents) {
      const firstUnderscore = fileEntry.name.indexOf("_");
      const appId = fileEntry.name.substring(0, firstUnderscore);
      const type = fileEntry.name.substring(firstUnderscore + 1, fileEntry.name.indexOf("."));

      if (libraryCacheLUT[type]) {
        if (!resKeys.includes(appId)) {
          resKeys.push(appId);
          res[appId] = {};
        }

        if (!unfilteredKeys.includes(appId)) {
          unfilteredKeys.push(appId);
          unfiltered[appId] = {};
        }
        
        if (!Object.keys(res[appId]).includes(libraryCacheLUT[type])) res[appId][libraryCacheLUT[type]] = await join(libraryCacheDir, fileEntry.name);
        
        unfiltered[appId][libraryCacheLUT[type]] = await join(libraryCacheDir, fileEntry.name);
      }
    }

    const entries = Object.entries(res);
    unfilteredLibraryCache.set(structuredClone(unfiltered));
    const filtered = entries.filter(([ appId, entry ]) => Object.keys(entry).length >= 2 || shortcutIds.includes(appId)); //! Look into this because it seems like it aint ideal this because it caused issues with games with no grids
    return Object.fromEntries(filtered);
  }

  /**
   * Gets the steam game image data.
   * @param shortcuts The list of non steam games.
   * @returns A promise resolving to the image data.
   */
  static async getCacheData(shortcuts: GameStruct[]): Promise<{ [appid: string]: LibraryCacheEntry }> {
    const gridsDir = await RustInterop.getGridsDirectory(get(activeUserId).toString());
    const gridDirContents = (await fs.readDir(gridsDir));

    const shortcutIds = Object.values(shortcuts).map((shortcut) => shortcut.appid.toString());
    const [ filteredGrids, logoConfigs ] = await SteamController.filterGridsDir(gridsDir, gridDirContents, shortcutIds);
    LogController.log("Grids loaded.");

    const libraryCacheDir = await RustInterop.getLibraryCacheDirectory();

    if (libraryCacheDir.startsWith("DNE")) {
      await DialogController.message("LibraryCache Did Not Exist!", "ERROR", `SARM was unable to read your librarycache folder. The path ${libraryCacheDir.substring(3)} did not exist. Please open Steam and go to the library tab so it caches a few game grids.`, "Ok");
      await exit(0);
    }

    const libraryCacheContents = (await fs.readDir(libraryCacheDir));
    const filteredCache = await SteamController.filterLibraryCache(libraryCacheDir, libraryCacheContents, filteredGrids, shortcutIds);
    LogController.log("Library Cache loaded.");

    await SteamController.cacheLogoConfigs(gridsDir, logoConfigs);

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
      const xmlData = SteamController.domParser.parseFromString(await res.text(), "text/xml");
      const jsonStr = xml2json(xmlData, "");
      const games = JSON.parse(jsonStr);

      return games.gamesList.games.game.map((game: any) => {
        return {
          "appid": parseInt(game.appID),
          "name": game.name["#cdata"]
        }
      }).sort((gameA: GameStruct, gameB: GameStruct) => gameA.name.localeCompare(gameB.name));
    } else {
      const xmlData = SteamController.domParser.parseFromString(await res.text(), "text/xml");
      const jsonStr = xml2json(xmlData, "");
      const err = JSON.parse(jsonStr);

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
      const xmlData = SteamController.domParser.parseFromString(await res.text(), "text/xml");
      const jsonStr = xml2json(xmlData, "");
      const err = JSON.parse(jsonStr);

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

    // LogController.log("Loading non-steam games...");

    const [ shortcuts, steamApps ] = await Promise.all([
      RustInterop.readShortcutsVdf(userId.toString()),
      SteamController.getSteamApps()
    ]);
    console.log("shortcuts:", shortcuts);
    console.log("steamApps:", steamApps);
    // !: good up to here
    
    originalSteamShortcuts.set(structuredClone(Object.values(shortcuts)));
    steamShortcuts.set(Object.values(shortcuts));
    
    const structuredShortcuts = Object.values(shortcuts).map((shortcut: any) => {
      return {
        "appid": shortcut.appid,
        "name": shortcut.AppName ?? shortcut.appname
      };
    });
    nonSteamGames.set(structuredShortcuts);
    LogController.log("Loaded non-steam games.");

    // LogController.log("Getting steam games...");

    const filteredCache = await SteamController.getCacheData(structuredShortcuts);
    const filteredKeys = Object.keys(filteredCache);

    originalAppLibraryCache.set(structuredClone(filteredCache));
    appLibraryCache.set(filteredCache);

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