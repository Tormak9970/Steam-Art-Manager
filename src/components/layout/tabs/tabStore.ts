import { writable, type Writable } from "svelte/store";

export const tabsDict: Writable<{
  [tabId: string]: { labels: string[]; selected: string };
}> = writable({});
