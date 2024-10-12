/// <reference types="svelte" />
/// <reference types="vite/client" />

declare const APP_VERSION: string;
declare const IS_DEBUG: boolean;

type ShowErrorOptions = {
  message: string;
  faster?: boolean;
}

type ShowInfoOptions = {
  message: string;
}

type ShowSnackbarOptions = {
  message: string;
  timeout?: number | null;
}

declare module "svelte-lazy"