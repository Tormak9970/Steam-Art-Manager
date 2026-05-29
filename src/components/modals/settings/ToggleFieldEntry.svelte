<script lang="ts">
  import { Toggle } from "@interactables";
  import { open } from "@tauri-apps/plugin-shell";

  export let label = "";
  export let description = "";
  export let value: boolean;
  export let onChange: (value: boolean) => void = () => {};

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
    <Toggle label={label} on:change={(e) => onChange(e.detail.value)} bind:value={value} />
    <slot />
  </div>
  {#if description !== ""}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="description" on:click={clickListener}>
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
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>