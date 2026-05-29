<script lang="ts">
  import { DropDown } from "@interactables";
  import { open } from "@tauri-apps/plugin-shell";

  export let label = "";
  export let description = "";
  export let options: { label: string; data: any }[];
  export let value: string;
  export let onChange: (value: string) => void = () => {};
  export let disabled = false;

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
      label={label}
      options={options}
      bind:value={value}
      onChange={onChange}
      width="6.25rem"
      tooltipPosition="bottom"
      entryTooltipPosition="right"
      disabled={disabled}
    />
  </div>
  {#if description !== ""}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="description" on:click={clickListener}>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html description}<br/>
    </div>
  {/if}
</div>

<style>
  .setting {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    background-color: var(--background-dark);
    padding: 0.5rem;
    border-radius: 0.25rem;

    width: calc(100% - 0.875rem);
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