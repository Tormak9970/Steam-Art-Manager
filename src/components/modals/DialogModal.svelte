<script lang="ts">
  import { Button } from "@interactables";
  import { dialogModalCancel, dialogModalCancelText, dialogModalConfirm, dialogModalConfirmText, dialogModalMessage, dialogModalTitle, dialogModalType, showDialogModal } from "../../stores/Modals";
  import ModalBody from "./modal-utils/ModalBody.svelte";

  let open = true;

  /**
   * Function to run on confirmation.
   */
  async function onConfirm(): Promise<void> {
    await $dialogModalConfirm();
    $showDialogModal = false;
  }

  /**
   * Function to run on cancel.
   */
  async function onCancel(): Promise<void> {
    await $dialogModalCancel();
    $showDialogModal = false;
  }
</script>

<ModalBody title={$dialogModalTitle} open={open} on:close={() => open = false} canClose={false}>
  <div class="content">
    <div class="info">
      <div class="type-cont">
        {#if $dialogModalType === "INFO"}
          <svg xmlns="http://www.w3.org/2000/svg" height="3em" viewBox="0 0 512 512" fill="#04a3ff">
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
          </svg>
        {:else if $dialogModalType === "WARNING"}
          <svg xmlns="http://www.w3.org/2000/svg" height="3em" viewBox="0 0 512 512" fill="#ffee04">
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" height="3em" viewBox="0 0 512 512" fill="#e24a4a">
            <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/>
          </svg>
        {/if}
      </div>
      <div class="message">{$dialogModalMessage}</div>
    </div>
  </div>
  <span slot="buttons" class="buttons">
    {#if $dialogModalConfirmText !== ""}
      <Button label={$dialogModalConfirmText} on:click={onConfirm} width={$dialogModalCancelText !== "" ? "47.5%" : "100%"} />
    {/if}
    {#if $dialogModalCancelText !== ""}
      <Button label={$dialogModalCancelText} on:click={onCancel} width={$dialogModalConfirmText !== "" ? "47.5%" : "100%"} />
    {/if}
  </span>
</ModalBody>

<style>
  .content {
    max-width: 400px;
  }

  .info {
    margin: 0px 10px;
    margin-top: 7px;
    font-size: 14px;

    display: flex;
    align-items: center;
  }

  .message {
    margin-left: 15px;
  }

  .buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }
</style>
