<script lang="ts">
  import { showTilesModal } from "../../../stores/Modals";
  import ModalBody from "../modal-utils/ModalBody.svelte";
</script>

<ModalBody title={""} onClose={() => $showTilesModal = false }>
  <div class="content">
    
  </div>
</ModalBody>

<style>
  .content {
    max-width: 400px;
  }
</style>
