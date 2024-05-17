import { showSteamPathModal, steamPathModalClose } from "../../stores/Modals";
import { GridTypes, type DBFilters, steamInstallPath, requestTimeoutLength, activeUserId, hasMorePagesCache, lastPageCache } from "../../stores/AppState";
import { DialogController } from "../controllers/DialogController";
import { LogController } from "../controllers/LogController";
import { SGDB, type SGDBImage } from "../models/SGDB";
import { exit } from "@tauri-apps/api/process";
import { RustInterop } from "../controllers/RustInterop";
import { fs, path, process, http } from "@tauri-apps/api";
import { get } from "svelte/store";

/**
 * Throttles a function to only run every provided interval.
 * @param func The function to throttle.
 * @param wait The amount of time in between each run.
 * @returns A function that throttles the provided function.
 */
export function throttle(func: any, wait: number) {
  let waiting = false;
  return function (...args: any[]) {
    if (waiting) {
      return;
    } else {
      func.apply(this, args);
    }

    waiting = true;
    setTimeout(() => {
      waiting = false;
    }, wait);
  }
}

/**
 * Debounces a function by the provided interval.
 * @param func The function to debounce.
 * @param wait How long to wait before running the function after the last call.
 * @param immediate Whether to run the function immediately, then debounce, or debounce from the start.
 * @returns The debounced function.
 */
export function debounce(func: any, wait:number, immediate?:boolean) {
  let timeout:NodeJS.Timeout|null;
  return function (...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout as NodeJS.Timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  }
}

/**
 * Prevents a keyboard event from running unless the key is the provided key
 * @param key The key to listen for.
 * @param listener The listener to call.
 * @returns A function to run when a key is pressed.
 */
export function onlyOnKey(key: string, listener: (e?: KeyboardEvent) => void): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    if (e.key === key) {
      listener(e);
    }
  }
}

/**
 * Filters the grids based on the user's chosen filters.
 * @param allGrids The list of all grids.
 * @param type The selected GridType.
 * @param filters The filters object.
 * @param gameName The name of the game being filtered.
 * @param useCoreFile Whether or not to log to the core file.
 * @returns The list of filtered grids.
 */
export function filterGrids(allGrids: SGDBImage[], type: GridTypes, filters: DBFilters, gameName: string, useCoreFile = true): SGDBImage[] {
  const targetFilters = filters[type];
  const gridStyles = Object.keys(targetFilters.styles).filter((style) => targetFilters.styles[style]);
  const dimensions = (type !== GridTypes.LOGO && type !== GridTypes.ICON) ? Object.keys(targetFilters.dimensions).filter((dimension) => targetFilters.dimensions[dimension]) : [];
  const imageFormats = Object.keys(targetFilters.mimes).filter((imgType) => targetFilters.mimes[imgType]);
  const animationTypes = Object.keys(targetFilters.types).filter((gridType) => targetFilters.types[gridType]);
  const humorAllowed = targetFilters.oneoftag.humor;
  const epilepsyAllowed = targetFilters.oneoftag.epilepsy;
  const nsfwAllowed = targetFilters.oneoftag.nsfw;

  const resGrids = allGrids.filter((grid: SGDBImage) => {
    return gridStyles.includes(grid.style)
      && (dimensions.includes(`${grid.width}x${grid.height}`) || type === GridTypes.LOGO || type === GridTypes.ICON)
      && imageFormats.includes(grid.mime)
      && (grid.isAnimated ? animationTypes.includes("animated") : animationTypes.includes("static"))
      && (grid.humor ? humorAllowed : true)
      && (grid.epilepsy ? epilepsyAllowed : true)
      && (grid.nsfw ? nsfwAllowed : true);
  });

  const query = `"${type === GridTypes.HERO ? "Heroe" : type}s for ${gameName}"`;
  if (resGrids.length > 0) {
    if (useCoreFile) {
      LogController.log(`Query: ${query}. Result: ${resGrids.length} grids.`);
    } else {
      LogController.batchApplyLog(`Query: ${query}. Result: ${resGrids.length} grids.`);
    }
  } else {
    if (useCoreFile) {
      LogController.log(`Query: ${query}. Result: no grids.`);
    } else {
      LogController.batchApplyLog(`Query: ${query}. Result: no grids.`);
    }
  }

  return resGrids;
}

/**
 * Gets the id and grid type from a grids filename.
 * @param gridName The filename of the grid.
 * @returns A tuple of [appid, gridType].
 */
export function getIdFromGridName(gridName: string): [string, string] {
  const dotIndex = gridName.indexOf(".");
  const underscoreIndex = gridName.indexOf("_");
  const name = gridName.substring(0, dotIndex);

  if (underscoreIndex > 0) {
    const id = name.substring(0, underscoreIndex);
    const type = name.substring(underscoreIndex + 1);

    return [ id, type ];
  } else if (name.endsWith("p")) {
    const id = name.substring(0, name.length - 1);
    return [ id, "capsule" ];
  } else {
    if (gridName.substring(dotIndex+1) === "json") {
      return [ name, "logoposition" ];
    } else {
      return [ name, "wide_capsule" ];
    }
  }
}

/**
 * Handles showing the Steam install path selection dialog.
 */
export async function steamDialogSequence(): Promise<void> {
  // * We need to use the async here because we resolve the promise in a modal callback.
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<void>(async (resolve) => {
    const hasSteamInstalled = await DialogController.ask("Steam Not Found", "WARNING", "SARM could not locate Steam. Do you have it installed?", "Yes", "No");

    if (hasSteamInstalled) {
      showSteamPathModal.set(true);
      steamPathModalClose.set(async () => {
        showSteamPathModal.set(false);
        resolve();
      });
    } else {
      await DialogController.message("SARM Could Not Initialize", "ERROR", "Please install Steam and login once, then restart SARM.", "Ok");
      await exit(0);
      resolve();
    }
  });
}

/**
 * Handles determining the Steam installation path.
 * @param savedInstallPath The current saved install path.
 */
export async function findSteamPath(savedInstallPath: string): Promise<void> {
  if (savedInstallPath !== "") {
    const steamInstallPathAdded = await RustInterop.addPathToScope(savedInstallPath);
    const isValidInstall = await validateSteamPath(savedInstallPath);

    if (steamInstallPathAdded && isValidInstall && await fs.exists(savedInstallPath)) {
      steamInstallPath.set(savedInstallPath);
    } else {
      await steamDialogSequence();
    }
  } else {
    const returnedInstallPath = await RustInterop.addSteamToScope();

    if (returnedInstallPath === "") {
      await DialogController.message("Unrecoverable Error", "ERROR", "A Steam installation was found but could not be added to scope. Please restart, and if the problem persists, open an issue on SARM's GitHub repository.", "Ok");
      await exit(0);
    } else if (returnedInstallPath === "DNE") {
      await steamDialogSequence();
    } else {
      steamInstallPath.set(returnedInstallPath);
    }
  }
}

/**
 * Reloads the app.
 */
export async function restartApp(): Promise<void> {
  const shouldReload = await DialogController.ask("Warning!", "WARNING", "Are you sure you want to reload? Any changes will be lost!", "Ok", "Cancel");
  if (shouldReload) {
    LogController.log("Reloading...");
    await process.relaunch();
  }
}

/**
 * Checks if the provided path is a valid Steam installation.
 * @param path The path to check.
 * @returns True if the path is a valid install.
 */
export async function validateSteamPath(steamPath: string): Promise<boolean> {
  return await RustInterop.validateSteamPath(steamPath);
}


/**
 * Checks if the provided Steam api key is valid for the current user.
 * @param key The api key to test.
 * @param userId Optional property to specify the userId used to test.
 * @returns A promise resolving to true if the key is valid, false if not.
 */
export async function validateSteamAPIKey(key: string, userId?: number): Promise<boolean> {
  const bUserId = BigInt(userId ?? get(activeUserId)) + 76561197960265728n;
  const timeout = get(requestTimeoutLength)

  const res = await http.fetch<any>(`http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${bUserId}&format=json&include_appinfo=true&include_played_free_games=true`, {
    method: "GET",
    timeout: timeout
  });

  return res.ok || key === "";
}

/**
 * Checks if the provided SteamGridDB api key is valid.
 * @param key The api key to test.
 * @returns A promise resolving to true if the key is valid, false if not.
 */
export async function validateSGDBAPIKey(key: string): Promise<boolean> {
  if (key === "") return false;
  
  const apiModel = new SGDB(key);

  const res = await apiModel.searchGame("s");
  return res?.length > 0;
}

/**
 * Checks if there are more result pages to load for a given sgdb game.
 * @param sgdbGameId The id of the sgdb game to check for more pages.
 * @param type The current grid type.
 * @returns True if there are more result pages to load, false if not.
 */
export function getHasMorePages(sgdbGameId: string, type: GridTypes) {
  if (sgdbGameId === "None") {
    return true;
  } else {
    const id = parseInt(sgdbGameId);
    
    if (!hasMorePagesCache[id]) hasMorePagesCache[id] = {};
    if (!Object.keys(hasMorePagesCache[id]).includes(type)) hasMorePagesCache[id][type] = true;
    
    return hasMorePagesCache[id][type];
  }
}

/**
 * Gets the most recent page number cached for a given sgdb game.
 * @param sgdbGameId The id of the sgdb game to check for more pages.
 * @param type The current grid type.
 * @returns The most recent page number cached.
 */
export function getPageNumberForGame(sgdbGameId: string, type: GridTypes) {
  if (sgdbGameId === "None") {
    return 0;
  } else {
    const id = parseInt(sgdbGameId);

    if (!lastPageCache[id]) lastPageCache[id] = {};
    if (!lastPageCache[id][type]) lastPageCache[id][type] = 0;

    return lastPageCache[id][type];
  }
}