<script lang="ts">
  import { dialogModalCancel, dialogModalCancelText, dialogModalConfirm, dialogModalConfirmText, dialogModalMessage, dialogModalTitle, showDialogModal } from "../../Stores";
  import Button from "../interactables/Button.svelte";
  import ModalBody from "./modal-utils/ModalBody.svelte";

  async function onConfirm() {
    await $dialogModalConfirm();
    onComplete();
  }

  async function onCancel() {
    await $dialogModalCancel();
    onComplete();
  }

  function onComplete() {
    $showDialogModal = false;
    setTimeout(() => {
      $dialogModalTitle = "";
      $dialogModalMessage = "";
      $dialogModalConfirmText = "";
      $dialogModalConfirm = async () => {};
      $dialogModalCancelText = "";
      $dialogModalCancel = async () => {};
    }, 10);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<ModalBody title={$dialogModalTitle} canClose={false}>
  <div class="content">
    <div class="info">{$dialogModalMessage}</div>
    <div class="buttons">
      {#if $dialogModalConfirmText !== ""}
        <Button label={$dialogModalConfirmText} onClick={onConfirm} width={$dialogModalCancelText !== "" ? "47.5%" : "100%"} />
      {/if}
      {#if $dialogModalCancelText !== ""}
        <Button label={$dialogModalCancelText} onClick={onCancel} width={$dialogModalConfirmText !== "" ? "47.5%" : "100%"} />
      {/if}
    </div>
  </div>
</ModalBody>

<style>
  .content {
    max-width: 400px;
  }

  .info {
    margin: 0px 10px;
    margin-top: 7px;
    font-size: 14px;
  }

  .buttons {
    margin-top: 14px;
    margin-bottom: 7px;
    margin-left: 7px;
    margin-right: 7px;
    width: calc(100% - 14px);
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
