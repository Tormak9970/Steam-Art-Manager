<script lang="ts">
  import { AppController } from "@controllers";
  import { Asterisk } from "@icons";
  import { Checkbox } from "@interactables";
  import { open } from "@tauri-apps/plugin-shell";

  export let label = "";
  export let description = "";
  export let options: string[];
  export let value: string[];
  export let onChange: (value: string[]) => void = () => {};
  export let disabled = false;
  export let required = false;

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
  <div class="field-header">
    <h3 class="label">{label}</h3>
    <div class="required-cont">
      {#if required}
        <div class="tooltip-cont" use:AppController.tippy={{ content: "This setting is required", placement: "top", onShow: AppController.onTippyShow }}>
          <Asterisk style="height: 14px; width: 14px; fill: var(--font-color);" />
        </div>
      {/if}
    </div>
  </div>
  <div class="inputs">
    {#each options as option}
      <div class="checklist">
        <Checkbox value={value.includes(option.toLowerCase())} onChange={(checked) => {
          if (checked) {
            value.push(option.toLowerCase());
          } else {
            value.splice(value.indexOf(option.toLowerCase()), 1);
          }
          onChange(value);
        }} />
        <div class="name">{option}</div>
      </div>
    {/each}
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
    padding: 6px;
    border-radius: 0.25rem;

    width: calc(100% - 14px);
  }

  .description {
    line-height: 1.5rem;
    font-size: 14px;
    margin: 7px 0px;
  }

  
  .inputs {
    width: calc(100% - 0.5rem - 2px);
    display: flex;
    align-items: center;
    gap: 1rem;

    background-color: var(--background);
    padding: 0.25rem;

    border-radius: 0.25rem;
    border: 0.0625rem solid var(--background-hover)
  }

  .checklist {
    display: flex;
    align-items: center;
  }

  .name {
    font-size: 12px;
    user-select: none;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    
    margin-left: 0.25rem;
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
    font-size: 1rem;
  }
</style>