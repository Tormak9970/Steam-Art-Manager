<script lang="ts">
  import { LoadingSpinner } from "@layout";
  import { progressModalMessage, progressModalTitle } from "@stores/Modals";
  import ModalBody from "./modal-utils/ModalBody.svelte";

  let open = true;
</script>

<ModalBody title={$progressModalTitle} open={open} on:close={() => open = false} canClose={false}>
  <div class="content">
    <div class="info">
      <LoadingSpinner width="80px" height="80px" />
      <div class="message">{$progressModalMessage}</div>
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

    display: flex;
    align-items: center;
  }

  .message {
    margin-left: 15px;
    font-size: 16px;
  }
</style>
