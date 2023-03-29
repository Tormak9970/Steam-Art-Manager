// import { os, path } from "@tauri-apps/api";

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