<script lang="ts">
  import { AppController } from "@controllers";
  import { Asterisk } from "@icons";
  import { TextInput } from "@interactables";
  import { open } from "@tauri-apps/plugin-shell";
  import { debounce } from "@utils";
  import { onMount } from "svelte";

  export let label: string;
  export let description: string;
  export let required: boolean = false;
  export let canBeEmpty = false;
  export let value: string;
  export let notes: string = "";
  export let onChange: (value: string, isValid: boolean) => void = () => {};
  
  export let useValidator = false;
  export let validator: (value: string) => Promise<boolean> = async (value: string) => true;

  let isValid = false;
  
  /**
   * A wrapper for the onChange event.
   */
  async function changeWrapper(): Promise<void> {
    isValid = await validator(value);
    console.log(isValid);
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
          <Asterisk style="height: 0.875rem; width: 0.875rem; fill: var(--font-color);" />
        </div>
      {/if}
    </div>
  </div>
  <div class="inputs">
    <TextInput placeholder={"Your API key"} on:input={debouncedWrapper} width="13.75rem" bind:value={value} />

    {#if useValidator}
      {#if isValid}
        <div class="valid-value">Valid api key</div>
      {:else}
        {#if value === "" && canBeEmpty}
          <div class="warn-value">No api key provided</div>
        {:else}
          <div class="invalid-value">Not a valid api key!</div>
        {/if}
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
    padding: 0.5rem;
    border-radius: 0.25rem;
  }

  .field-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .required-cont {
    height: 0.875rem;
    width: 0.875rem;
  }

  .label {
    margin-top: 0rem;
    font-size: 1rem;
  }

  .part {
    width: 100%;
  }

  .description {
    line-height: 1.5rem;
    font-size: 0.875rem;
    margin: 0.5rem 0rem;

    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  
  .inputs {
    display: flex;
    align-items: center;

    gap: 0.5rem;
  }

  .valid-value {
    font-size: 0.875rem;
    color: var(--success);
  }

  .warn-value {
    font-size: 0.875rem;
    color: rgb(231, 198, 12);
  }

  .invalid-value {
    font-size: 0.875rem;
    color: var(--warning);
  }
</style>