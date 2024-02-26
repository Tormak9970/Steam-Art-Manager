import { fs, http } from "@tauri-apps/api";
import { get } from "svelte/store";
import { xml2json } from "../external/xml2json";

import { GridTypes, activeUserId, appLibraryCache, isOnline, manualSteamGames, needsSteamKey, nonSteamGames, originalAppLibraryCache, originalLogoPositions, originalSteamShortcuts, requestTimeoutLength, steamGames, steamKey, steamLogoPositions, steamShortcuts, unfilteredLibraryCache } from "../../stores/AppState";

import { LogController } from "./LogController";
import { ToastController } from "./ToastController";
import { RustInterop } from "./RustInterop";

import { getIdFromGridName } from "../utils/Utils";
import { DialogController } from "./DialogController";
import { exit } from "@tauri-apps/api/process";

const gridTypeLUT = {
  "capsule": GridTypes.CAPSULE,
  "wide_capsule": GridTypes.WIDE_CAPSULE,
  "hero": GridTypes.HERO,
  "icon": GridTypes.ICON,
  "logo": GridTypes.LOGO
}

const libraryCacheLUT = {
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
   * @param logoConfigs The list of logoConfig files.
   * ? Logging complete.
   */
  private static async cacheLogoConfigs(logoConfigs: fs.FileEntry[]): Promise<void> {
    const configs = {};

    for (const logoConfig of logoConfigs) {
      const id = parseInt(logoConfig.name.substring(0, logoConfig.name.lastIndexOf(".")));

      if (!isNaN(id)) {
        const contents = await fs.readTextFile(logoConfig.path);
        const jsonContents = JSON.parse(contents);
        if (jsonContents.logoPosition) configs[id] = jsonContents;
      }
    }

    originalLogoPositions.set(JSON.parse(JSON.stringify(configs)));
    steamLogoPositions.set(JSON.parse(JSON.stringify(configs)));

    LogController.log(`Cached logo positions for ${Object.entries(configs).length} games.`);
  }
  
  /**
   * Filters and structures the library grids based on the app's needs.
   * @param gridsDirContents The contents of the grids dir.
   * @param shortcutIds The list of loaded shortcuts ids.
   * @returns The filtered and structured grids dir.
   * ? Logging complete.
   */
  private static filterGridsDir(gridsDirContents: fs.FileEntry[], shortcutsIds: string[]): [{ [appid: string]: LibraryCacheEntry }, fs.FileEntry[]] {
    const resKeys = [];
    const logoConfigs = [];
    const res: { [appid: string]: LibraryCacheEntry } = {};

    const foundApps: string[] = [];

    for (const fileEntry of gridsDirContents) {
      if (fileEntry.name.endsWith(".json")) {
        logoConfigs.push(fileEntry);
      } else {
        const [ appid, type ] = getIdFromGridName(fileEntry.name);
        
        const idTypeString = `${appid}_${type}`;

        if (foundApps.includes(idTypeString)) {
          ToastController.showWarningToast("Duplicate grid found. Try cleaning");
          LogController.warn(`Duplicate grid found for ${appid}.`);
        } else {
          //? Since we have to poison the cache for icons, we also don't want to load them from the grids folder. Shortcuts don't need this.
          if (gridTypeLUT[type] && (type !== "icon" || shortcutsIds.includes(appid))) {
            if (!resKeys.includes(appid)) {
              resKeys.push(appid);
              // @ts-ignore
              res[appid] = {};
            }
            res[appid][gridTypeLUT[type]] = fileEntry.path;
          }
        }
      }
    }

    return [ res, logoConfigs ];
  }

  /**
   * Filters and structures the library cache based on the app's needs.
   * @param libraryCacheContents The contents of the library cache.
   * @param gridsInfos The filtered grid infos.
   * @param shortcutIds The list of loaded shortcuts ids.
   * @returns The filtered and structured library cache.
   * ? Logging complete.
   */
  private static filterLibraryCache(libraryCacheContents: fs.FileEntry[], gridsInfos: { [appid: string]: LibraryCacheEntry }, shortcutIds: string[]): { [appid: string]: LibraryCacheEntry } {
    const resKeys = Object.keys(gridsInfos);
    const res: { [appid: string]: LibraryCacheEntry } = gridsInfos;

    const unfilteredKeys = [];
    const unfiltered: { [appid: string]: LibraryCacheEntry } = {};

    for (const fileEntry of libraryCacheContents) {
      const firstUnderscore = fileEntry.name.indexOf("_");
      const appId = fileEntry.name.substring(0, firstUnderscore);
      const type = fileEntry.name.substring(firstUnderscore + 1, fileEntry.name.indexOf("."));

      if (libraryCacheLUT[type]) {
        if (!resKeys.includes(appId)) {
          resKeys.push(appId);
          // @ts-ignore
          res[appId] = {};
        }
        if (!unfilteredKeys.includes(appId)) {
          unfilteredKeys.push(appId);
          // @ts-ignore
          unfiltered[appId] = {};
        }
        
        if (!Object.keys(res[appId]).includes(libraryCacheLUT[type])) res[appId][libraryCacheLUT[type]] = fileEntry.path;
        
        unfiltered[appId][libraryCacheLUT[type]] = fileEntry.path;
      }
    }

    const entries = Object.entries(res);
    unfilteredLibraryCache.set(JSON.parse(JSON.stringify(unfiltered)));
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
    const [ filteredGrids, logoConfigs ] = SteamController.filterGridsDir(gridDirContents, shortcutIds);
    LogController.log("Grids loaded.");

    const libraryCacheDir = await RustInterop.getLibraryCacheDirectory();

    if (libraryCacheDir.startsWith("DNE")) {
      await DialogController.message("LibraryCache Did Not Exist!", "ERROR", `SARM was unable to read your librarycache folder. The path ${libraryCacheDir.substring(3)} did not exist. Please open Steam and go to the library tab so it caches a few game grids.`, "Ok");
      await exit(0);
    }

    const libraryCacheContents = (await fs.readDir(libraryCacheDir));
    const filteredCache = SteamController.filterLibraryCache(libraryCacheContents, filteredGrids, shortcutIds);
    LogController.log("Library Cache loaded.");

    await SteamController.cacheLogoConfigs(logoConfigs);

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
    LogController.log("Loading games from Steam Community page...");

    const res = await http.fetch<string>(`https://steamcommunity.com/profiles/${bUserId}/games?xml=1`, {
      method: "GET",
      responseType: http.ResponseType.Text,
      timeout: requestTimeout
    });
    
    if (res.ok) {
      const xmlData = SteamController.domParser.parseFromString(res.data, "text/xml");
      const jsonStr = xml2json(xmlData, "");
      const games = JSON.parse(jsonStr);

      return games.gamesList.games.game.map((game: any) => {
        return {
          "appid": parseInt(game.appID),
          "name": game.name["#cdata"]
        }
      }).sort((gameA: GameStruct, gameB: GameStruct) => gameA.name.localeCompare(gameB.name));
    } else {
      const xmlData = SteamController.domParser.parseFromString(res.data, "text/xml");
      const jsonStr = xml2json(xmlData, "");
      const err = JSON.parse(jsonStr);

      ToastController.showWarningToast("Error getting games from your profile.");
      LogController.warn(`Fetch Error: Status ${res.status}. Message: ${JSON.stringify(err)}.`);
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
    LogController.log("Loading games from Steam API...");

    const res = await http.fetch<any>(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${get(steamKey)}&steamid=${bUserId}&format=json&include_appinfo=true&include_played_free_games=true`, {
      method: "GET",
      timeout: requestTimeout
    });

    if (res.ok) {
      return res.data.response.games.map((game: any) => {
        return {
          "appid": game.appid,
          "name": game.name
        }
      }).sort((gameA: GameStruct, gameB: GameStruct) => gameA.name.localeCompare(gameB.name));
    } else {
      const xmlData = SteamController.domParser.parseFromString(res.data, "text/xml");
      const jsonStr = xml2json(xmlData, "");
      const err = JSON.parse(jsonStr);

      ToastController.showWarningToast("Check your Steam API Key");
      LogController.warn(`Fetch Error: Status ${res.status}. Message: ${JSON.stringify(err)}. User should check their Steam API Key.`);
      return [];
    }
  }

  /**
   * Gets the current user's steam games by reading the appinfo.vdf.
   * @returns A promise resolving to a list of steam games.
   * ? Logging complete.
   */
  private static async getGamesFromAppinfo(): Promise<GameStruct[]> {
    LogController.log("Loading games from appinfo.vdf...");

    const vdf = await RustInterop.readAppinfoVdf();

    return vdf.entries.map((game: any) => {
      return {
        "appid": game.id,
        // eslint-disable-next-line no-control-regex
        "name": typeof game.common.name === "string" ? game.common.name.replace(/[^\x00-\x7F]/g, "") : game.common.name.toString()
      };
    }).sort((gameA: GameStruct, gameB: GameStruct) => gameA.name.localeCompare(gameB.name));
  }

  /**
   * Gets the current user's steam games by reading the localconfig.vdf.
   * @returns A promise resolving to a list of steam games.
   * ? Logging complete.
   */
  private static async getGamesFromLocalconfig(): Promise<GameStruct[]> {
    LogController.log("Loading games from localconfig.vdf...");

    const userId = get(activeUserId);
    const appInfoGames = await SteamController.getGamesFromAppinfo();
    const localConfigContents = await RustInterop.readLocalconfigVdf(userId.toString());
    return appInfoGames.filter((game) => localConfigContents.includes(game.appid.toString()));
  }

  /**
   * Gets the user's apps.
   * ? Logging complete.
   */
  static async getUserApps(): Promise<void> {
    const online = get(isOnline);
    const needsSteamAPIKey = get(needsSteamKey);
    
    const userId = get(activeUserId);
    const bUserId = BigInt(userId) + 76561197960265728n;

    LogController.log("Loading non-steam games...");
    const shortcuts = await RustInterop.readShortcutsVdf(userId.toString());
    originalSteamShortcuts.set(JSON.parse(JSON.stringify(Object.values(shortcuts))));
    steamShortcuts.set(Object.values(shortcuts));
    
    const structuredShortcuts = Object.values(shortcuts).map((shortcut: any) => {
      return {
        "appid": shortcut.appid,
        "name": shortcut.AppName ?? shortcut.appname
      };
    });
    nonSteamGames.set(structuredShortcuts);
    LogController.log("Loaded non-steam games.");

    LogController.log("Getting steam games...");

    const filteredCache = await SteamController.getCacheData(structuredShortcuts);

    originalAppLibraryCache.set(JSON.parse(JSON.stringify(filteredCache)));
    appLibraryCache.set(filteredCache);

    const filteredKeys = Object.keys(filteredCache);

    if (online && !needsSteamAPIKey) {
      const apiGames = (await this.getGamesFromSteamAPI(bUserId)).filter((entry) => filteredKeys.includes(entry.appid.toString()));
      // console.log("Steam API Games:", apiGames);
      steamGames.set(apiGames);
      
      LogController.log(`Loaded ${apiGames.length} games from Steam API.`);
      LogController.log("Steam games loaded.");
    } else if (online) {
      try {
        const publicGames = (await this.getGamesFromSteamCommunity(bUserId)).filter((entry: GameStruct) => filteredKeys.includes(entry.appid.toString()) && !entry.name.toLowerCase().includes("soundtrack"));
        // console.log("Public Games:", publicGames);
        steamGames.set(publicGames);
        
        LogController.log(`Loaded ${publicGames.length} games from Steam Community page.`);
        LogController.log("Steam games loaded.");
      } catch (err: any) {
        LogController.log("Error occured while loading games from Steam Community page, notifying user.");
        ToastController.showWarningToast("You profile is private");
        // TODO: consider prompting user here
        const appinfoGames = (await this.getGamesFromAppinfo()).filter((entry: GameStruct) => filteredKeys.includes(entry.appid.toString()));
        // console.log("Appinfo Games:", appinfoGames);
        steamGames.set(appinfoGames);
        
        LogController.log(`Loaded ${appinfoGames.length} games from appinfo.vdf.`);
        LogController.log("Steam games loaded.");
      }
    } else {
      const localconfigGames = (await this.getGamesFromLocalconfig()).filter((entry: GameStruct) => filteredKeys.includes(entry.appid.toString()));
      // console.log("Localconfig Games:", localconfigGames);
      steamGames.set(localconfigGames);
      
      LogController.log(`Loaded ${localconfigGames.length} games from localconfig.vdf.`);
      LogController.log("Steam games loaded.");
    }

    const sGames = get(steamGames);
    const originalManualGames = get(manualSteamGames);
    const manualGames = originalManualGames.filter((manualGame) => {
      const matchingSteamGame = sGames.find((sGame) => sGame.appid === manualGame.appid);
      if (matchingSteamGame) {
        LogController.warn(`Found manually added game with the same appid (${manualGame.appid}) as ${matchingSteamGame.name}. Removing it`);
      }

      return !matchingSteamGame;
    });

    if (manualGames.length !== originalManualGames.length) {
      manualSteamGames.set(JSON.parse(JSON.stringify(manualGames)));
      ToastController.showWarningToast(`Removed ${Math.abs(manualGames.length - originalManualGames.length)} duplicate manual games!`);
    }
    
    ToastController.showSuccessToast("Games Loaded!");
  }
}