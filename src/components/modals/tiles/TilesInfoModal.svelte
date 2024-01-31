<script lang="ts">
  import { showTilesInfoModal } from "../../../stores/Modals";
  import ModalBody from "../modal-utils/ModalBody.svelte";
</script>

<ModalBody title={""} onClose={() => $showTilesInfoModal = false }>
  <div class="content">
    
  </div>
</ModalBody>

<style>
  .content {
    max-width: 400px;
  }
</style>
