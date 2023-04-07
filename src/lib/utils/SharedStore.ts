/**
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
import { writable, type Updater, type Subscriber } from "svelte/store";

/**
 * Creates a new Svelte store that broadcasts updates to other windows.
 * @param initialValue The initial value of the store.
 * @param name The name of the store.
 * @returns A store that broadcasts changes to other windows.
 */
export function sharedStore<T>(initialValue:T, name:string) {
  const { subscribe, update, set } = writable<T>(initialValue);

  const bc = new BroadcastChannel("store_channel");

  const setWrapper = (value:T) => {
    set(value);
    bc.postMessage({
      "name": name,
      "data": value
    });
  }
  
  const updateWrapper = (updater:Updater<T>) => {
    update((value:T) => {
      const updatedValue = updater(value);

      bc.postMessage({
        "name": name,
        "data": updatedValue
      });

      return updatedValue;
    });
  }

  bc.onmessage = (event:MessageEvent<any>) => {
    const data = event.data;
    if (data.name === name) {
      set(data.data);
    }
  }

  return {
    subscribe,
    "set": setWrapper,
    "update": updateWrapper
  }
}