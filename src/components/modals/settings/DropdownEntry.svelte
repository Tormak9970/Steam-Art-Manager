<script lang="ts">
  import { DropDown } from "@interactables";
  import { open } from "@tauri-apps/plugin-shell";

  type Props = {
    label?: string;
    description?: string;
    options: { label: string; data: any }[];
    value: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
  };

  let {
    label = "",
    description = "",
    options,
    value,
    onChange = () => {},
    disabled = false,
  }: Props = $props();

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
  <div class="inputs">
    <DropDown
      {label}
      {options}
      bind:value
      {onChange}
      width="6.25rem"
      tooltipPosition="bottom"
      entryTooltipPosition="right"
      {disabled}
    />
  </div>
  {#if description !== ""}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="description" onclick={clickListener}>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html description}<br />
    </div>
  {/if}
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

  .description {
    line-height: 1.5rem;
    font-size: 0.875rem;
    margin: 0.5rem 0rem;
  }

  .inputs {
    display: flex;
    align-items: center;
  }
</style>
