<script lang="ts">
  import { showToolsModal } from "@stores/Modals";
  import ModalBody from "./modal-utils/ModalBody.svelte";

  let open = true;

  type Tool = {
    name: string;
    icon: string;
    onClick: () => Promise<void>;
  }

  const toolsList: Tool[] = [
    
  ];

  /**
   * The function to run when the modal closes.
   */
  function onClose() {
    $showToolsModal = false;
  }
</script>

<ModalBody title={"Tools"} open={open} on:close={() => open = false} on:closeEnd={onClose}>
  <div class="content">
    
  </div>
</ModalBody>

<style>
  .content {
		width: 600px;

		display: flex;
		flex-direction: column;
		align-items: center;
    padding-top: 14px;

    gap: 14px;
    
		max-height: 73vh;
    overflow-y: scroll;
	}
</style>
