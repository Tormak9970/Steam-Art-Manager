<script lang="ts">
  import { Close } from "@icons";
  import type { Snippet } from "svelte";
  import type { HTMLDialogAttributes } from "svelte/elements";

  type Props = {
    display?: string;
    extraOptions?: HTMLDialogAttributes;
    title: string;
    open: boolean;
    canClose?: boolean;
    onClose?: () => void | Promise<void>;
    onCloseEnd?: () => void | Promise<void>;
    body: Snippet;
    controls?: Snippet;
  };

  let {
    display = "flex",
    extraOptions = {},
    title,
    open,
    canClose = true,
    onClose,
    onCloseEnd,
    body,
    controls,
  }: Props = $props();

  let dialog: HTMLDialogElement;

  /**
   * Handles opening the modal.
   */
  function openModal(node: HTMLDialogElement) {
    node.inert = true;
    node.showModal();
    node.inert = false;
  }

  $effect(() => {
    if (!dialog) return;

    if (open) {
      openModal(dialog);
    } else {
      hideDialog = true;
    }
  });

  let hideDialog = $state(false);

  function onAnimationEnd() {
    if (hideDialog) {
      hideDialog = false;
      dialog.close();
      onCloseEnd?.();
    }
  }

  function onCancel(e: Event) {
    if (canClose) {
      onClose?.();
      open = false;
    } else {
      e.preventDefault();
    }
  }

  function onClick() {
    if (canClose) {
      onClose?.();
      open = false;
    }
  }
</script>

<dialog
  oncancel={onCancel}
  onclick={(e) => {
    if (e.currentTarget === e.target) {
      onClick();
    }
  }}
  onanimationend={onAnimationEnd}
  bind:this={dialog}
  style="display: {display};"
  class:hide={hideDialog}
  {...extraOptions}
>
  <div class="m3-container">
    <div class="header">
      <p class="headline m3-font-headline-small">{title}</p>
      {#if canClose}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="close-btn" onclick={onClick}>
          <Close />
        </div>
      {/if}
    </div>
    <div class="border"></div>
    <div
      class="content m3-font-body-medium"
      style:margin-bottom={controls ? "0.8rem" : "0rem"}
    >
      {@render body()}
    </div>
    <div class="buttons">
      {@render controls?.()}
    </div>
  </div>
</dialog>

<style>
  :root {
    --m3-scheme-scrim: 6 6 6;
    --m3-dialog-shape: 0.25rem;
  }
  dialog {
    background-color: var(--background);
    border: none;
    border-radius: var(--m3-dialog-shape);
    border: 1px solid var(--foreground);
    margin: auto;

    position: relative;
  }
  .m3-container {
    display: flex;
    flex-direction: column;
    width: 100%;

    position: relative;
    z-index: 1;
  }

  .close-btn {
    position: absolute;
    height: 1.25rem;
    width: 1.25rem;
    fill: var(--font-color);

    top: 0.125rem;
    right: 0.125rem;

    background-color: var(--background);
    padding: 0.25rem;
    border-radius: 0.125rem;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .close-btn:hover {
    cursor: pointer;
    background-color: var(--background-hover);
  }

  .header {
    width: 100%;

    display: flex;
    align-items: center;
  }

  .border {
    margin-top: 0.25rem;
    border-bottom: 0.0625rem solid var(--foreground);
  }

  .m3-container > :global(svg) {
    color: var(--font-color);
    width: 1.5rem;
    height: 1.5rem;
    margin: 0 auto 1rem auto;
  }
  .headline {
    color: var(--font-color);
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;

    font-size: 1.25rem;
    line-height: 1.25rem;

    font-weight: bold;
  }

  .content {
    color: var(--font-color);
  }

  .buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
    gap: 0.5rem;
  }

  dialog {
    position: fixed;
    inset: 0;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
      opacity 200ms,
      visibility 200ms;
  }
  dialog[open] {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    animation:
      dialogIn 0.5s cubic-bezier(0.05, 0.7, 0.1, 1),
      opacity 100ms cubic-bezier(0.05, 0.7, 0.1, 1);
  }

  dialog.hide {
    visibility: hidden;
    opacity: 0;
    animation: dialogOut 0.4s cubic-bezier(0.05, 0.7, 0.1, 1);
  }

  dialog[open] .headline {
    animation: opacity 150ms;
  }
  dialog[open] .content {
    animation: opacity 200ms;
  }
  dialog[open] .buttons {
    position: relative;
    animation:
      buttonsIn 0.5s cubic-bezier(0.05, 0.7, 0.1, 1),
      opacity 200ms 100ms backwards;
  }
  dialog::backdrop {
    background-color: rgb(var(--m3-scheme-scrim) / 0.3);
    animation: opacity 400ms;
    backdrop-filter: blur(1px);

    position: absolute;
    top: 0rem;
  }
  @keyframes dialogIn {
    0% {
      transform: translateY(-3rem) scaleY(90%);
      clip-path: inset(0 0 100% 0 round var(--m3-dialog-shape));
    }
    100% {
      transform: translateY(0) scaleY(100%);
      clip-path: inset(0 0 0 0 round var(--m3-dialog-shape));
    }
  }
  @keyframes buttonsIn {
    0% {
      bottom: 100%;
    }
    100% {
      bottom: 0;
    }
  }
  @keyframes opacity {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes dialogOut {
    0% {
      transform: translateY(0) scaleY(100%);
      clip-path: inset(0 0 0 0 round var(--m3-dialog-shape));
    }
    100% {
      transform: translateY(-3rem) scaleY(90%);
      clip-path: inset(0 0 100% 0 round var(--m3-dialog-shape));
    }
  }
</style>
