<script lang="ts">
  import { open } from "@tauri-apps/api/shell";
  import TextInput from "../../interactables/TextInput.svelte";
  import Spacer from "../../layout/Spacer.svelte";
  import { onMount } from "svelte";
  import { AppController } from "../../../lib/controllers/AppController";
  import { debounce } from "../../../lib/utils/Utils";

  export let label: string;
  export let description: string;
  export let required: boolean = false;
  export let canBeEmpty = false;
  export let value: string;
  export let notes: string = "";
  export let onChange: (value: string, isValid: boolean) => void = () => {};
  
  export let useValidator = false;
  export let validator: (value: string) => Promise<boolean> = async (value: string) => true;

  let isValid = null;
  
  /**
   * A wrapper for the onChange event.
   */
  async function changeWrapper(): Promise<void> {
    isValid = await validator(value);
    onChange(value, isValid);
  }

  const debouncedWrapper = debounce(changeWrapper, 100);

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
  
  onMount(async () => {
    isValid = await validator(value);
  });
</script>

<div class="setting">
  <div class="field-header">
    <h1 class="label">{label}</h1>
    <div class="required-cont">
      {#if required}
        <div class="tooltip-cont" use:AppController.tippy={{ content: "This setting is required", placement: "top", onShow: AppController.onTippyShow }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path d="M192 32c17.7 0 32 14.3 32 32V199.5l111.5-66.9c15.2-9.1 34.8-4.2 43.9 11s4.2 34.8-11 43.9L254.2 256l114.3 68.6c15.2 9.1 20.1 28.7 11 43.9s-28.7 20.1-43.9 11L224 312.5V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V312.5L48.5 379.4c-15.2 9.1-34.8 4.2-43.9-11s-4.2-34.8 11-43.9L129.8 256 15.5 187.4c-15.2-9.1-20.1-28.7-11-43.9s28.7-20.1 43.9-11L160 199.5V64c0-17.7 14.3-32 32-32z"/>
          </svg>
        </div>
      {/if}
    </div>
  </div>
  <div class="inputs">
    <TextInput placeholder={"Your API key"} onInput={debouncedWrapper} width="{220}" bind:value={value} />
    <Spacer orientation="HORIZONTAL" />

    {#if useValidator && isValid !== null}
      {#if isValid}
        {#if value === "" && canBeEmpty}
          <div class="warn-value">No api key provided</div>
        {:else}
          <div class="valid-value">Valid api key</div>
        {/if}
      {:else}
        <div class="invalid-value">Not a valid api key!</div>
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

  .field-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .required-cont {
    height: 14px;
    width: 14px;
  }

  .required-cont svg {
    height: 14px;
    width: 14px;

    fill: var(--font-color);
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

  
  .inputs {
    display: flex;
    align-items: center;
  }

  .valid-value {
    color: var(--success);
  }

  .warn-value {
    color: rgb(231, 198, 12);
  }

  .invalid-value {
    color: var(--warning);
  }
</style>