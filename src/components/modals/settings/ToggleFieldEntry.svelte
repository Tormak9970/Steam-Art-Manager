<script lang="ts">
  import { AppController } from "@controllers";
  import { Bug } from "@icons";
  import { Toggle } from "@interactables";
  import { open } from "@tauri-apps/plugin-shell";
  import type { Snippet } from "svelte";

  type Props = {
    label?: string;
    description?: string;
    steamBug?: boolean;
    value: boolean;
    onChange?: (value: boolean) => void;
    children?: Snippet;
  };

  let {
    label = "",
    description = "",
    steamBug = false,
    value,
    onChange = () => {},
    children,
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
    <Toggle {label} onChange={(value) => onChange(value)} bind:value />
    {@render children?.()}
    {#if steamBug}
      <div
        class="bug-warning"
        use:AppController.tippy={{
          content: "This is a Steam issue and will be removed once fixed.",
          placement: "top",
          onShow: AppController.onTippyShow,
        }}
      >
        <div class="steam-bug-warning">Steam</div>
        <Bug fill="yellow" width="1rem" />
      </div>
    {/if}
  </div>
  {#if description !== ""}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="description" onclick={clickListener}>
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
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .bug-warning {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .steam-bug-warning {
    color: yellow;
  }
</style>
