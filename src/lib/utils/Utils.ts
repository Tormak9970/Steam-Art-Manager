// import { os, path } from "@tauri-apps/api";

import { GridTypes, type DBFilters } from "../../Stores";
import { LogController } from "../controllers/LogController";
import type { SGDBImage } from "../models/SGDB";

/**
 * Throttles a function to only run every provided interval.
 * @param func The function to throttle.
 * @param wait The amount of time in between each run.
 * @returns A function that throttles the provided function.
 */
export function throttle(func: any, wait: number) {
  let waiting = false;
  return function () {
    if (waiting) {
      return;
    } else {
      func.apply(this, arguments);
    }

    waiting = true;
    setTimeout(() => {
      waiting = false;
    }, wait);
  };
}

/**
 * Prevents a keyboard event from running unless the key is the provided key
 * @param key The key to listen for.
 * @param listener The listener to call.
 * @returns A function to run when a key is pressed.
 */
export function onlyOnKey(key: string, listener: (e?: KeyboardEvent) => void): (e: KeyboardEvent) => void {
  return (e: KeyboardEvent) => {
    if (e.key == key) listener(e);
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
  const dimensions = (type != GridTypes.LOGO && type != GridTypes.ICON) ? Object.keys(targetFilters.dimensions).filter((dimension) => targetFilters.dimensions[dimension]) : [];
  const imageFormats = Object.keys(targetFilters.mimes).filter((imgType) => targetFilters.mimes[imgType]);
  const animationTypes = Object.keys(targetFilters.types).filter((gridType) => targetFilters.types[gridType]);
  const humorAllowed = targetFilters.oneoftag.humor;
  const epilepsyAllowed = targetFilters.oneoftag.epilepsy;
  const nsfwAllowed = targetFilters.oneoftag.nsfw;

  const resGrids = allGrids.filter((grid: SGDBImage) => {
    return gridStyles.includes(grid.style)
      && (dimensions.includes(`${grid.width}x${grid.height}`) || type == GridTypes.LOGO || type == GridTypes.ICON)
      && imageFormats.includes(grid.mime)
      && (grid.isAnimated ? animationTypes.includes("animated") : animationTypes.includes("static"))
      && (grid.humor ? humorAllowed : true)
      && (grid.epilepsy ? epilepsyAllowed : true)
      && (grid.nsfw ? nsfwAllowed : true);
  });

  let query = `"${type == GridTypes.HERO ? "Heroe" : type}s for ${gameName}"`;
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