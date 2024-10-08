<script lang="ts">
  import { AppController } from "@controllers";
  import { Asterisk } from "@icons";
  import { FileButton, TextInput } from "@interactables";
  import { open } from "@tauri-apps/plugin-shell";
  import { onMount } from "svelte";

  export let label: string;
  export let description: string;
  export let required: boolean = false;
  export let value: string;
  export let notes: string = "";
  export let onChange: (path: string, isValid: boolean) => void = () => {};

  export let useValidator = false;
  export let validPathMessage = "";
  export let validator: (path: string) => Promise<boolean> = async (path: string) => true;

  let isValid = false;

  /**
   * A wrapper for the onChange event.
   */
  async function changeWrapper(): Promise<void> {
    isValid = value !== "" && await validator(value);
    onChange(value, isValid);
  }

  /**
   * A wrapper for the dialog change event.
   * @param path The new path.
   */
  async function dialogChangeWrapper(path: string): Promise<void> {
    isValid = path !== "" && await validator(path);
    onChange(path, isValid);
  }
  
  /**
   * Handles click events to redirect to the browser.
   * @param e The click event.
   */
   function clickListener(e: Event) {
    const origin = (e.target as Element).closest("a");
  
    if (origin) {
      e.preventDefault();
      const href = origin.href;
      open(href);
    }
  }

  onMount(async () => {
    if (value !== "") isValid = await validator(value);
  })
</script>

<div class="setting">
  <div class="field-header">
    <h1 class="label">{label}</h1>
    <div class="required-cont">
      {#if required}
        <div class="tooltip-cont" use:AppController.tippy={{ content: "This setting is required", placement: "top", onShow: AppController.onTippyShow }}>
          <Asterisk style="height: 14px; width: 14px; fill: var(--font-color);" />
        </div>
      {/if}
    </div>
  </div>
  <div class="inputs">
    <TextInput placeholder={"~/something/something"} onChange={changeWrapper} width="{188}" bind:value={value} />
    <FileButton label="Select Folder" tooltipPosition={"right"} on:change={(e) => dialogChangeWrapper(e.detail.value)} />
    
    {#if useValidator}
      {#if isValid}
        <div class="valid-value">{validPathMessage}</div>
      {:else}
        <div class="invalid-value">The chosen path is not valid!</div>
      {/if}
    {/if}
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="description" on:click={clickListener}>
    <div class="part">
      <b>Usage:</b><br/>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html description}<br/>
    </div>

    {#if notes !== ""}
      <div class="part">
        <b>Notes:</b><br/>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html notes}
      </div>
    {/if}
  </div>
</div>

<style>
  .setting {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    background-color: var(--background-dark);
    padding: 6px;
    border-radius: 4px;
  }

  .field-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .required-cont {
    height: 14px;
    width: 14px;
  }

  .label {
    margin-top: 0px;
    font-size: 18px;
  }

  .inputs {
    display: flex;
    align-items: center;

    gap: 7px;
  }

  .part {
    width: 100%;
  }

  .description {
    line-height: 18px;
    font-size: 14px;
    margin: 7px 0px;

    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .valid-value {
    font-size: 14px;
    color: var(--success);
  }

  .invalid-value {
    font-size: 14px;
    color: var(--warning);
  }
</style>