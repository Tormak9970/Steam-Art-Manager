<script lang="ts">
  import { AppController } from "@controllers";
  import { Asterisk } from "@icons";
  import { FileButton, TextInput } from "@interactables";
  import { open } from "@tauri-apps/plugin-shell";
  import { onMount } from "svelte";

  type Props = {
    label?: string;
    description?: string;
    value: string;
    onChange?: (value: string, isValid: boolean) => void;
    required?: boolean;
    notes?: string;
    useValidator?: boolean;
    validPathMessage?: string;
    validator?: (path: string) => Promise<boolean>;
  };

  let {
    label = "",
    description = "",
    value,
    onChange = () => {},
    required = false,
    notes = "",
    useValidator = false,
    validPathMessage = "",
    validator = async (value: string) => true,
  }: Props = $props();

  let isValid = $state(false);

  /**
   * A wrapper for the onChange event.
   */
  async function changeWrapper(): Promise<void> {
    isValid = value !== "" && (await validator(value));
    onChange(value, isValid);
  }

  /**
   * A wrapper for the dialog change event.
   * @param path The new path.
   */
  async function dialogChangeWrapper(path: string): Promise<void> {
    isValid = path !== "" && (await validator(path));
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
  });
</script>

<div class="setting">
  <div class="field-header">
    <h1 class="label">{label}</h1>
    <div class="required-cont">
      {#if required}
        <div
          class="tooltip-cont"
          use:AppController.tippy={{
            content: "This setting is required",
            placement: "top",
            onShow: AppController.onTippyShow,
          }}
        >
          <Asterisk
            style="height: 0.875rem; width: 0.875rem; fill: var(--font-color);"
          />
        </div>
      {/if}
    </div>
  </div>
  <div class="inputs">
    <TextInput
      placeholder={"~/something/something"}
      onChange={changeWrapper}
      width="11.75rem"
      bind:value
    />
    <FileButton
      label="Select Folder"
      tooltipPosition={"right"}
      onChange={(value) => dialogChangeWrapper(value)}
    />

    {#if useValidator}
      {#if isValid}
        <div class="valid-value">{validPathMessage}</div>
      {:else}
        <div class="invalid-value">The chosen path is not valid!</div>
      {/if}
    {/if}
  </div>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="description" onclick={clickListener}>
    <div class="part">
      <b>Usage:</b><br />
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html description}<br />
    </div>

    {#if notes !== ""}
      <div class="part">
        <b>Notes:</b><br />
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
    border: 0.0625rem solid var(--foreground);
    padding: 0.5rem;
    border-radius: 0.25rem;

    width: calc(100% - 1rem);
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

  .inputs {
    display: flex;
    align-items: center;

    gap: 0.5rem;
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

  .valid-value {
    font-size: 0.875rem;
    color: var(--success);
  }

  .invalid-value {
    font-size: 0.875rem;
    color: var(--warning);
  }
</style>
