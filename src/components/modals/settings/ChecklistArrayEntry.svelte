<script lang="ts">
  import { AppController } from "@controllers";
  import { Asterisk } from "@icons";
  import { Checkbox } from "@interactables";
  import { open } from "@tauri-apps/plugin-shell";

  type Props = {
    label?: string;
    description?: string;
    options: string[];
    value: string[];
    onChange?: (value: string[]) => void;
    required?: boolean;
  };

  let {
    label = "",
    description = "",
    options,
    value,
    onChange = () => {},
    required = false,
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
  <div class="field-header">
    <h3 class="label">{label}</h3>
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
    {#each options as option}
      <div class="checklist">
        <Checkbox
          value={value.includes(option.toLowerCase())}
          onChange={(checked) => {
            if (checked) {
              value.push(option.toLowerCase());
            } else {
              value.splice(value.indexOf(option.toLowerCase()), 1);
            }
            onChange(value);
          }}
        />
        <div class="name">{option}</div>
      </div>
    {/each}
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
    width: calc(100% - 0.5rem - 0.125rem);
    display: flex;
    align-items: center;
    gap: 1rem;

    background-color: var(--background);
    padding: 0.25rem;

    border-radius: 0.25rem;
    border: 0.0625rem solid var(--background-hover);
  }

  .checklist {
    display: flex;
    align-items: center;
  }

  .name {
    font-size: 0.825rem;
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
    height: 0.875rem;
    width: 0.875rem;
  }

  .label {
    margin-top: 0rem;
    font-size: 1rem;
  }
</style>
