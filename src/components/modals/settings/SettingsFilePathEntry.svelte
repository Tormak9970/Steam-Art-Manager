<script lang="ts">
  import { open } from "@tauri-apps/api/shell";
  import TextInput from "../../interactables/TextInput.svelte";
  import FileButton from "../../interactables/FileButton.svelte";
  import Spacer from "../../layout/Spacer.svelte";
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

  let isValid = null;

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
  <h1 class="label">{label}</h1>
  <div class="inputs">
    <TextInput placeholder={"~/something/something"} onChange={changeWrapper} width="{188}" bind:value={value} />
    <Spacer orientation="HORIZONTAL" />
    <FileButton label="Select Folder" tooltipPosition={"right"} onChange={dialogChangeWrapper} />
    <Spacer orientation="HORIZONTAL" />

    {#if useValidator && isValid !== null}
      {#if isValid}
        <div class="valid-value">{validPathMessage}</div>
      {:else}
        <div class="invalid-value">The chosen path is not valid!</div>
      {/if}
    {/if}
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="description" on:click={clickListener}>
    <b>Usage:</b><br/>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html description}<br/>

    {#if notes !== ""}
      <Spacer orientation="VERTICAL" />
      <b>Notes:</b><br/>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html notes}
    {/if}
    
    <Spacer orientation="VERTICAL" />
    <b>Required:</b> {required ? "Yes" : "No"}<br/>
  </div>
</div>

<style>
  .setting {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin: 0px 14px;

    background-color: var(--background-dark);
    padding: 6px;
    border-radius: 4px;
  }

  .label {
    margin-top: 0px;
    font-size: 18px;
  }

  .inputs {
    display: flex;
    align-items: center;
  }

  .description {
    line-height: 18px;
    font-size: 14px;
    margin: 7px 0px;
  }

  .valid-value {
    color: var(--success);
  }

  .invalid-value {
    color: var(--warning);
  }
</style>