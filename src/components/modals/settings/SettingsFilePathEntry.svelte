<script lang="ts">
  import { open } from "@tauri-apps/api/shell";
  import TextInput from "../../interactables/TextInput.svelte";
  import FileButton from "../../interactables/FileButton.svelte";
  import Spacer from "../../layout/Spacer.svelte";

  export let label: string;
  export let description: string;
  export let required: boolean = false;
  export let value: string;
  export let notes: string = "";
  export let onChange: (path: string) => void = () => {};

  function changeWrapper(e: Event) {
    onChange((e.currentTarget as HTMLInputElement).value);
  }
  
  /**
   * Handles click events to redirect to the browser.
   * @param e The click event.
   */
   function clickListener(e: Event) {
    const origin = (e.target as Element).closest(`a`);
  
    if (origin) {
      e.preventDefault();
      const href = origin.href;
      open(href);
    }
  }
</script>

<div class="setting">
  <h1 class="label">{label}</h1>
  <div class="inputs">
    <TextInput placeholder={"~/something/something"} onInput={changeWrapper} width="{188}" bind:value={value} />
    <Spacer orientation="HORIZONTAL" />
    <FileButton label="Select Folder" tooltipPosition={"right"} onChange={onChange} />
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="description" on:click={clickListener}>
    <b>Usage:</b><br/>
    {@html description}<br/>

    {#if notes != ""}
      <Spacer orientation="VERTICAL" />
      <b>Notes:</b><br/>
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
</style>