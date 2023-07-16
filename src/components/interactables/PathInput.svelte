<script lang="ts">
  import { dialog, path } from "@tauri-apps/api";
  import FileButton from "./FileButton.svelte";

  export let label:string = "";
  export let fieldPrompt:string;
  export let defaultPath:string;
  export let value:string;
  export let onChange:(e:Event, label?:string)=>void;

  const changeEvent = new Event('change');

  let inputElem:HTMLInputElement;

  /**
   * Wrapper for the onChange event.
   * @param e The InputEvent to pass to the onChange handler.
   */
  function wrapper(e:Event): void {
    onChange(e, label.toLowerCase());
  }

  /**
   * Opens a file dialog window.
   * @param e The associated event.
   */
  async function openDialog(e:Event): Promise<void> {
    if (defaultPath == "documents") {
      defaultPath = await path.documentDir();
    }
    await dialog.open({ directory: true, title: fieldPrompt, multiple: false, defaultPath: defaultPath }).then(async (dir) => {
      if (dir) {
        inputElem.value = dir as string;
        inputElem.dispatchEvent(changeEvent);
      }
    });
  }
</script>

<div class="input">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  {#if label != ""}
    <label style="margin-right: 13px; font-size: 14px; user-select: none;">{label}:</label>
  {/if}
  <input style="flex: 1; margin-right: 7px" type="text" placeholder="{value}" bind:value={value} on:change="{wrapper}" bind:this={inputElem}>

  <FileButton label={"Select path"} onClick={openDialog} />
</div>

<!-- svelte-ignore css-unused-selector -->
<style>
  @import "/theme.css";

  .input {
    margin: 0px;

    display: flex;
    flex-direction: row;
    align-items: center;

    color: var(--font-color);

    font-size: 12px;
    width: 100%;
  }
  .input > .field-name { margin-right: 10px; }

  .input > input {
    color: var(--font-color);
    background-color: var(--foreground);
    border: 1px solid transparent;
    border-radius: 4px;
    outline: none;
    padding: 3px;
    
    transition: background-color 0.15s ease-in-out, border 0.15s ease-in-out;
  }
  .input > input:hover {
    background-color: var(--foreground-hover);
  }
  .input > input:focus {
    outline: none;
    border: 1px solid var(--highlight);
  }
</style>