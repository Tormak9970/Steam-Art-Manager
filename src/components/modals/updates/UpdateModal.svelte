<script lang="ts">
  import { relaunch } from "@tauri-apps/plugin-process";
  import { open } from "@tauri-apps/plugin-shell";
  import MarkdownIt from "markdown-it";
  
  import { showUpdateModal, updateManifest } from "@stores/Modals";

  import { LogController, ToastController } from "@controllers";
  import { scrollShadow } from "@directives";
  import { Button } from "@interactables";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import UpdateField from "./UpdateField.svelte";

  const mdIt = new MarkdownIt({
    html: true,
    linkify: true
  });

  $: updateData = $updateManifest!;

  const months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

  const dateParts = $updateManifest!.date!.split(" ");
  const dateSegs = dateParts[0].split("-").map((seg) => parseInt(seg));
  const cleanDate = `${months[dateSegs[1]-1]} ${dateSegs[2]}, ${dateSegs[0]}`

  /**
   * Handles click events to redirect to the browser.
   * @param e The click event.
   */
  function clickListener(e: Event): void {
    const origin = (e.target as Element).closest("a");
  
    if (origin) {
      e.preventDefault();
      const href = origin.href;
      open(href);
    }
  }

  /**
   * Applies the update
   */
  async function update(): Promise<void> {
    LogController.log(`Installing update v${updateData.version}, released on ${updateData.date}.`);
    ToastController.showGenericToast("Installing update...");

    // Install the update. This will also restart the app on Windows!
    await updateData.downloadAndInstall();

    // On macOS and Linux you will need to restart the app manually.
    // You could use this step to display another confirmation dialog.
    await relaunch();
  }

  /**
   * Ignores the update.
   */
  async function ignoreUpdate(): Promise<void> {
    LogController.log(`Skipping update v${updateData.version}.`);
    $showUpdateModal = false;
  }
</script>

<ModalBody title={`Update v${updateData.version} is Available!`} canClose={false}>
  <div class="content">
    <div class="info">
      <!-- svelte-ignore missing-declaration -->
      <UpdateField label="Your Version" value={APP_VERSION} />
      <UpdateField label="Newest Version" value={updateData.version} />
      <UpdateField label="Release Date" value={cleanDate} />
    </div>
    <div class="changelog">
      <div class="header"><b>Changelog</b>:</div>
      <div class="release-notes-container">
        <div class="scroll-container" use:scrollShadow={{ background: "--background-dark"}}>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="release-notes" on:click={clickListener}>
            {@html mdIt.render(updateData.body ?? "No update details found")}
          </div>
        </div>
      </div>
    </div>
    <div class="buttons">
      <Button label="Update" onClick={update} width="47.5%" />
      <Button label="Ignore" onClick={ignoreUpdate} width="47.5%" />
    </div>
  </div>
</ModalBody>

<style>
  .content {
    min-width: 500px;
  }

  .info {
    width: calc(100% - 14px);
    margin: 7px;
  }

  .changelog {
    width: calc(100% - 14px);
    margin: 7px;
    margin-top: 0px;
  }

  .changelog > .header {
    font-size: 14px;
    margin-bottom: 5px;
  }

  .changelog > .release-notes-container {
    border-radius: 4px;
    background-color: var(--background-dark);
    overflow: hidden;

    height: 60vh;
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

  .buttons {
    margin-top: 14px;
    margin-bottom: 7px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>