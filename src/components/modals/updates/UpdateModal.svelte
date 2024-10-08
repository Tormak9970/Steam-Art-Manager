<script lang="ts">
  import { relaunch } from "@tauri-apps/plugin-process";
  import { open as openLink } from "@tauri-apps/plugin-shell";
  import MarkdownIt from "markdown-it";
  
  import { showUpdateModal, updateManifest } from "@stores/Modals";

  import { LogController, ToastController } from "@controllers";
  import { scrollShadow } from "@directives";
  import { Button } from "@interactables";
  import { ProgressIndicator } from "@layout";
  import type { DownloadEvent } from "@tauri-apps/plugin-updater";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import UpdateField from "./UpdateField.svelte";

  let open = true;
  
  const mdIt = new MarkdownIt({
    html: true,
    linkify: true
  });
  
  let step: "changelog" | "download" | "restart" = "changelog";
  let formattedDate = "No date provided";

  $: title = step === "changelog" ? `Update v${$updateManifest?.version} is Available!` : (step === "download" ? `Downloading v${$updateManifest?.version}...` : "Download Complete!")

  const stepHeight = {
    changelog: 390,
    download: 122,
    restart: 125
  }
  
  let contentLength = 0;
  let downloaded = 0;

  /**
   * Handles click events to redirect to the browser.
   * @param e The click event.
   */
  function linkClick(e: Event): void {
    const origin = (e.target as Element).closest("a");
  
    if (origin) {
      e.preventDefault();
      const href = origin.href;
      openLink(href);
    }
  }

  /**
   * Ignores the update.
   */
  async function ignoreUpdate(): Promise<void> {
    LogController.log(`Skipping update v${$updateManifest!.version}.`);
    open = false;
  }

  function downloadUpdate() {
    LogController.log(`Downloading update v${$updateManifest!.version}, released on ${$updateManifest!.date}.`);

    try {
      $updateManifest!.download((event: DownloadEvent) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength!;
            downloaded = 0;
            step = "download";
            break;
          case 'Progress':
            downloaded += event.data.chunkLength!;
            break;
          case 'Finished':
            step = "restart";
            break;
        }
      });
    } catch (e: any) {
      ToastController.showWarningToast("Failed to download update!");
    }
  }

  async function installUpdate(): Promise<void> {
    LogController.log(`Installing update v${$updateManifest!.version}, released on ${$updateManifest!.date}.`);

    // Install the update. This will also restart the app on Windows!
    await $updateManifest!.install();

    // On macOS and Linux you will need to restart the app manually.
    // You could use this step to display another confirmation dialog.
    await relaunch();
  }

  onMount(() => {
    let dateString = $updateManifest?.date;

    if (dateString) {
      let date = new Date(dateString);

      if (isNaN(date.getTime())) {
        dateString = dateString.replace(/(\+|-)(\d{2}):(\d{2}):(\d{2})$/, '$1$2:$3');
        date = new Date(dateString);
      }

      const lang = "en-US";
      const formatter = new Intl.DateTimeFormat(lang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      formattedDate = formatter.format(date);
    }
  });
</script>

<ModalBody title={title} open={open} on:close={() => open = false} on:closeEnd={() => $showUpdateModal = false } canClose={false}>
  <div class="content" style:height="{stepHeight[step]}px">
    <div class="info">
      <!-- svelte-ignore missing-declaration -->
      <UpdateField label="Release Date" value={formattedDate} />
      <UpdateField label="Current Version" value={$updateManifest?.currentVersion ?? "Not Found"} />
      <UpdateField label="New Version" value={$updateManifest?.version ?? "Not Found"} />
    </div>
    {#if step === "changelog"}
      <div class="changelog">
        <div class="scroll-container" use:scrollShadow={{ background: "--background-dark"}}>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="release-notes" on:click={linkClick}>
            {@html mdIt.render($updateManifest?.body ?? "No update details found")}
          </div>
        </div>
      </div>
    {:else if step === "download"}
      <div class="download-container" in:fade={{ duration: 300 }}>
        <ProgressIndicator percent={downloaded / (contentLength || 1) * 100} />
      </div>
    {:else}
      <div class="complete-message" in:fade={{ duration: 300 }}>
        Steam Art Manager needs to restart. Would you like to restart now?
      </div>
    {/if}
  </div>
  <span slot="buttons" class="buttons">
    <div class="side">
      {#if step === "changelog"}
        <Button label="Skip" onClick={ignoreUpdate} width="100%" />
      {:else if step === "restart"}
        <Button label="No" onClick={() => { open = false }} width="100%" />
      {/if}
    </div>
    <div class="side">
      {#if step === "changelog"}
        <Button label="Download" onClick={downloadUpdate} width="100%" />
      {:else if step === "restart"}
        <Button label="Yes" onClick={installUpdate} width="100%" />
      {/if}
    </div>
  </span>
</ModalBody>

<style>
  .content {
    min-width: 500px;
  }

  .info {
    width: 100%;
    margin: 7px 0px;
  }

  .changelog {
    width: 100%;
  }

  .changelog {
    border-radius: 4px;
    background-color: var(--background-dark);
    overflow: hidden;

    height: calc(100% - 70px);
  }

  :global(.changelog .release-notes p) {
    margin: 3px;
    margin-left: 6px;
    font-size: 14px;
  }

  :global(.changelog .release-notes ul) {
    margin-top: 4px;
    font-size: 14px;
  }

  :global(.changelog .release-notes li) {
    margin-bottom: 3px;
  }

  .scroll-container {
    height: 100%;
    width: 100%;

    overflow: auto;
  }

  .download-container {
    margin-top: 2rem;
    width: 100%;
  }
  .complete-message {
    margin-top: 1.5rem;
    width: 100%;
  }

  .buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }

  .buttons > .side {
    width: 48%;
  }
</style>