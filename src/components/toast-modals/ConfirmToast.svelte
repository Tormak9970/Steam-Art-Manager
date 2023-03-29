<script lang="ts">
  import { toast } from "@zerodevx/svelte-toast";
  import { ToastController } from "../../lib/controllers/ToastController";
  import { onlyOnKey } from "../../lib/utils/Utils";
  import Button from "../interactables/Button.svelte";

  export let toastId: string;
  export let message: string;
  export let confirmMessage: string;
  export let onConfirm: () => void;

  const clicked = (saved: boolean) => {
    toast.pop(toastId);
    if (saved) {
      ToastController.showWarningToast(confirmMessage);
    } else {
      ToastController.showSuccessToast("Cancelled.")
    }
    if (saved) onConfirm();
  };
</script>

<svelte:window on:keyup={onlyOnKey("Escape", () => clicked(false))} />

<div class="comfirm-toast">
  <div style="text-align: center; line-height: 20px;">{message}</div>
  <div class="btn-cont">
    <Button label="Cancel" onClick={() => clicked(true)} highlight={true} width="auto" />
    <Button label="Delete" onClick={() => clicked(false)} warn={true} width="auto" />
  </div>
</div>

<style>
  @import "/theme.css";

  .comfirm-toast {
    width: calc(100% - 60px);
    padding: 10px;
    border-radius: 4px;

    background-color: var(--foreground);
    box-shadow: 1px 2px 15px 5px rgba(0, 0, 0, 0.65);

    display: flex;
    flex-direction: column;
    align-items: center;

    margin: 20px;
  }

  .btn-cont {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;

    margin-top: 14px;
  }
</style>
