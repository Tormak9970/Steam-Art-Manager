<script lang="ts">
  import { open } from "@tauri-apps/api/shell"
  import { toast } from "@zerodevx/svelte-toast";
  import { SettingsManager } from "../../lib/utils/SettingsManager";
  import { needsAPIKey, steamGridDBKey } from "../../Stores";
  import Button from "../interactables/Button.svelte";
  import InputField from "../interactables/InputField.svelte";

  export let toastId: string;
  export let onSave: () => void;

  let canSave = false;
  let key = "";

  function onConfirm(): void {
    // TODO: save api key to settings
    SettingsManager.updateSettings("steamGridDbApiKey", key);
    // update state
    $steamGridDBKey = key;
    $needsAPIKey = false;
    onSave();
  }

  /**
   * Function to run when either button is clicked.
   * @param canceled Whether the cancel button was clicked.
   */
  const clicked = (canceled: boolean) => {
    toast.pop(toastId);
    toast.push({
      msg: canceled ? "Canceled" : "Api key saved",
      theme: {
        "--toastBackground": canceled ? "#04e200" : "#e24a4a",
        "--toastBarBackground": canceled ? "#039900" : "#e13525",
      },
    });
    if (!canceled) onConfirm();
  };

  /**
   * Opens a link in the default browser.
   */
  function openLinkInBrowser(): void {
    open("https://www.steamgriddb.com")
  }

  /**
   * Function to run on input change.
   * @param e The associated event.
   */
  function onChange(e:Event): void {
    const target = e.currentTarget as HTMLInputElement;
    const value = target.value;

    if (value != "") {
      key = value;
      canSave = true;
    }
  }
</script>

<div class="comfirm-toast">
  <!-- svelte-ignore a11y-invalid-attribute -->
  <div style="text-align: center; line-height: 20px; margin-bottom: 7px;">Please enter you steamGridDB api key. Go to <a href="" on:click={openLinkInBrowser}>Steamgrid</a>, sign in and go to preferences, then API.</div>
  <InputField label="Api key" value="" onChange={onChange} width="{220}" />
  <div class="btn-cont">
    <Button label="Cancel" onClick={() => clicked(true)} width="auto" />
    <Button label="Save" onClick={() => clicked(false)} highlight={true} disabled={!canSave} width="auto" />
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
