<script lang="ts">
  import { open } from "@tauri-apps/api/shell";
  import TextInput from "../../interactables/TextInput.svelte";
  import Spacer from "../../layout/Spacer.svelte";

  export let label: string;
  export let description: string;
  export let required: boolean = false;
  export let value: string;
  export let notes: string = "";
  export let onChange: (e:Event) => void = () => {};

  /**
   * Handles click events to redirect to the browser.
   * @param e The click event.
   */
  function clickListener(e: Event): void {
    const origin = (e.target as Element).closest("a");
  
    if (origin) {
      e.preventDefault();
      const href = origin.href;
      open(href);
    }
  }
</script>

<div class="setting">
  <h1 class="label">{label}</h1>
  <TextInput placeholder={"Your API key"} onInput={onChange} width="{220}" bind:value={value} />
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

  .description {
    line-height: 18px;
    font-size: 14px;
    margin: 7px 0px;
  }
</style>