<script lang="ts">
  import { relaunch } from "@tauri-apps/plugin-process";
  import { open as openLink } from "@tauri-apps/plugin-shell";
  import MarkdownIt from "markdown-it";

  import { showUpdateModal, updateManifest } from "@stores/Modals";

  import { LogController } from "@controllers";
  import { scrollShadow } from "@directives";
  import { Button } from "@interactables";
  import { ProgressIndicator } from "@layout";
  import { showErrorSnackbar } from "@stores/AppState";
  import type { DownloadEvent } from "@tauri-apps/plugin-updater";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import UpdateField from "./UpdateField.svelte";

  let open = $state(true);

  const mdIt = new MarkdownIt({
    html: true,
    linkify: true,
  });

  let step: "changelog" | "download" | "restart" = $state("changelog");
  let formattedDate = $state("No date provided");

  let title = $derived(
    step === "changelog"
      ? `Update v${$updateManifest?.version} is Available!`
      : step === "download"
        ? `Downloading v${$updateManifest?.version}...`
        : "Download Complete!",
  );

  const stepHeight = {
    changelog: 24.5,
    download: 7.75,
    restart: 7.75,
  };

  let contentLength = $state(0);
  let downloaded = $state(0);

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
    LogController.log(
      `Downloading update v${$updateManifest!.version}, released on ${$updateManifest!.date}.`,
    );

    try {
      $updateManifest!.download((event: DownloadEvent) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength!;
            downloaded = 0;
            step = "download";
            break;
          case "Progress":
            downloaded += event.data.chunkLength!;
            break;
          case "Finished":
            step = "restart";
            break;
        }
      });
    } catch (e: any) {
      $showErrorSnackbar({ message: "Failed to download update!" });
    }
  }

  async function installUpdate(): Promise<void> {
    LogController.log(
      `Installing update v${$updateManifest!.version}, released on ${$updateManifest!.date}.`,
    );

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
        dateString = dateString.replace(
          /(\+|-)(\d{2}):(\d{2}):(\d{2})$/,
          "$1$2:$3",
        );
        date = new Date(dateString);
      }

      const lang = "en-US";
      const formatter = new Intl.DateTimeFormat(lang, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      formattedDate = formatter.format(date);
    }
  });
</script>

<ModalBody
  {title}
  {open}
  onClose={() => {
    open = false;
  }}
  onCloseEnd={() => {
    $showUpdateModal = false;
  }}
  canClose={false}
>
  {#snippet body()}
    <div class="content" style:height="{stepHeight[step]}rem">
      <div class="info">
        <UpdateField label="Release Date" value={formattedDate} />
        <UpdateField
          label="Current Version"
          value={$updateManifest?.currentVersion ?? "Not Found"}
        />
        <UpdateField
          label="New Version"
          value={$updateManifest?.version ?? "Not Found"}
        />
      </div>
      {#if step === "changelog"}
        <div class="changelog">
          <div
            class="scroll-container"
            use:scrollShadow={{ background: "--background-dark" }}
          >
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="release-notes" onclick={linkClick}>
              {@html mdIt.render(
                $updateManifest?.body ?? "No update details found",
              )}
            </div>
          </div>
        </div>
      {:else if step === "download"}
        <div class="download-container" in:fade={{ duration: 300 }}>
          <ProgressIndicator
            percent={(downloaded / (contentLength || 1)) * 100}
          />
        </div>
      {:else}
        <div class="complete-message" in:fade={{ duration: 300 }}>
          Steam Art Manager needs to restart. Would you like to restart now?
        </div>
      {/if}
    </div>
  {/snippet}
  {#snippet controls()}
    <div class="side">
      {#if step === "changelog"}
        <Button label="Skip" onClick={ignoreUpdate} width="100%" />
      {:else if step === "restart"}
        <Button
          label="No"
          onClick={() => {
            open = false;
          }}
          width="100%"
        />
      {/if}
    </div>
    <div class="side">
      {#if step === "changelog"}
        <Button label="Download" onClick={downloadUpdate} width="100%" />
      {:else if step === "restart"}
        <Button label="Yes" onClick={installUpdate} width="100%" />
      {/if}
    </div>
  {/snippet}
</ModalBody>

<style>
  .content {
    min-width: 31.25rem;
  }

  .info {
    width: 100%;
    margin: 0.5rem 0rem;
  }

  .changelog {
    width: calc(100% - 0.125rem);
    border-radius: 0.25rem;
    background-color: var(--background-dark);
    border: 0.0625rem solid var(--foreground);
    overflow: hidden;

    height: calc(100% - 4.625rem);
  }

  :global(.changelog .release-notes p) {
    margin: 0.25rem;
    margin-left: 0.375rem;
    font-size: 0.875rem;
  }

  :global(.changelog .release-notes ul) {
    margin-top: 0.25rem;
    font-size: 0.875rem;
  }

  :global(.changelog .release-notes li) {
    margin-bottom: 0.25rem;
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

  .side {
    width: 48%;
  }
</style>
