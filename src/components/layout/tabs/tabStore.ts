import { writable } from "svelte/store";

export const tabsDict = writable<{ [tabId: string]: { labels: string[], selected: string }}>({});