<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { ctxMenuSourceIsImage, ctxMenuSourceSrc, theme } from "../../stores/AppState";
  import type { Unsubscriber } from "svelte/store";
  import { appWindow } from "@tauri-apps/api/window";
  import { WindowController } from "../../lib/controllers/WindowController";
  import ContextAction from "./ContextAction.svelte";
  import { dialog, fs, invoke } from "@tauri-apps/api";
  import { AppController } from "../../lib/controllers/AppController";

  let themeUnsub: Unsubscriber;
  let windowCloseUnsub: () => void;
  let windowFocusUnsub: () => void;

  async function getImageBlob(imageUrl: string) {
    const response = await fetch(imageUrl)
    return response.blob()
  }

  async function saveImageAs() {
    await WindowController.closeContextMenu();
    
    const blob = await getImageBlob($ctxMenuSourceSrc);
    const destPath = await dialog.save({ title: "Save Image", defaultPath: `image.${blob.type.substring(blob.type.indexOf("/") + 1)}`})
    await fs.writeBinaryFile(destPath, await blob.arrayBuffer());
  }

  async function reloadApp() {
    await WindowController.closeContextMenu();
    await AppController.reload();
  }

  async function inspectElement() {
    await WindowController.closeContextMenu();
    await invoke("open_main_dev_tools");
  }

	onMount(() => {
    themeUnsub = theme.subscribe((value) => {
      document.body.setAttribute("data-theme", !value ? "dark" : "light");
    });
    appWindow.onCloseRequested(async (event) => {
      event.preventDefault();
      await WindowController.closeContextMenu();
    }).then((listener) => windowCloseUnsub = listener);
    appWindow.onFocusChanged(async ({ payload: focused }) => {
      if (!focused && !await invoke<boolean>("check_if_main_focused")) WindowController.closeContextMenu();
    }).then((listener) => windowFocusUnsub = listener);
	});

  onDestroy(() => {
    if (themeUnsub) themeUnsub();
    if (windowCloseUnsub) windowCloseUnsub();
    if (windowFocusUnsub) windowFocusUnsub();
  });
</script>

<!-- <svelte:window on:contextmenu|preventDefault /> -->

<div class="context-menu-background">
  <div class="context-menu">
    <ContextAction label="Reload" onClick={reloadApp} width="100%">
      <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="fill: var(--font-color);">
        <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path d="M463.5 224H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1c-87.5 87.5-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5z"/>
      </svg>
    </ContextAction>
    {#if $ctxMenuSourceIsImage}
      <ContextAction label="Save Image As" onClick={saveImageAs} width="100%">
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" style="fill: var(--font-color);">
          <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path d="M0 96C0 60.7 28.7 32 64 32H448c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6h96 32H424c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/>
        </svg>
      </ContextAction>
    {/if}
    <!-- svelte-ignore missing-declaration -->
    {#if IS_DEBUG}
      <ContextAction label="Inspect" onClick={inspectElement} width="100%">
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 320 512" style="fill: var(--font-color);">
          <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path d="M0 55.2V426c0 12.2 9.9 22 22 22c6.3 0 12.4-2.7 16.6-7.5L121.2 346l58.1 116.3c7.9 15.8 27.1 22.2 42.9 14.3s22.2-27.1 14.3-42.9L179.8 320H297.9c12.2 0 22.1-9.9 22.1-22.1c0-6.3-2.7-12.3-7.4-16.5L38.6 37.9C34.3 34.1 28.9 32 23.2 32C10.4 32 0 42.4 0 55.2z"/>
        </svg>
      </ContextAction>
    {/if}
  </div>
</div>

<style>
	.context-menu-background {
    width: 100%;
		height: 100%;

    background-color: transparent;
  }
	.context-menu {
    width: calc(100% - 12px);
		height: calc(100% - 12px);

    border-radius: 4px;

    border: 1px solid rgba(0, 0, 0, 0.123);

    background-color: var(--foreground-hover);

    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 5px;
  }
</style>