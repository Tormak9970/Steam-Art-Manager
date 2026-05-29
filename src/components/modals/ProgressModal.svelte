<script lang="ts">
  import { LoadingSpinner } from "@layout";
  import { progressModalMessage, progressModalTitle } from "@stores/Modals";
  import ModalBody from "./modal-utils/ModalBody.svelte";

  let open = true;
</script>

<ModalBody title={$progressModalTitle} open={open} on:close={() => open = false} canClose={false}>
  <div class="content">
    <div class="info">
      <LoadingSpinner width="5rem" height="5rem" />
      <div class="message">{$progressModalMessage}</div>
    </div>
  </div>
</ModalBody>

<style>
  .content {
    max-width: 25rem;
  }

  .info {
    margin: 0rem 0.625rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;

    display: flex;
    align-items: center;
  }

  .message {
    margin-left: 1rem;
    font-size: 1rem;
  }
</style>
