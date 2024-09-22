<script lang="ts">
  import { Close } from "@icons";
  import { createEventDispatcher } from "svelte";
  import type { HTMLDialogAttributes } from "svelte/elements";

  export let display = "flex";
  export let extraOptions: HTMLDialogAttributes = {};
  export let title: string;
  export let open: boolean;
  export let canClose = true;

  const dispatch = createEventDispatcher();
  let dialog: HTMLDialogElement;

  /**
   * Handles opening the modal.
   */
  function openModal(node: HTMLDialogElement) {
    node.inert = true;
    node.showModal();
    node.inert = false;
  }

  $: {
    if (!dialog) break $;

    if (open) {
      openModal(dialog);
    } else {
      hideDialog = true;
    }
  }

  let hideDialog = false;

  function onAnimationEnd() {
    if (hideDialog) {
      hideDialog = false;
      dialog.close();
      dispatch("closeEnd");
    }
  }

  function onCancel(e: Event) {
    if (canClose) {
      dispatch("close");
      open = false;
    } else {
      e.preventDefault();
    }
  }

  function onClick() {
    if (canClose) {
      dispatch("close");
      open = false;
    }
  }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  on:cancel={onCancel}
  on:click|self={onClick}
  on:animationend={onAnimationEnd}
  bind:this={dialog}
  style="display: {display};"
  class:hide={hideDialog}
  {...extraOptions}
>
  <div class="m3-container">
    <div class="header">
      <p class="headline m3-font-headline-small">{title}</p>
      {#if canClose}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="close-btn" on:click={onClick}>
          <Close />
        </div>
      {/if}
    </div>
    <div class="border" />
    <div class="content m3-font-body-medium">
      <slot />
    </div>
    <div class="buttons">
      <slot name="buttons" />
    </div>
  </div>
</dialog>

<style>
  :root {
    --m3-scheme-scrim: 6 6 6;
    --m3-dialog-shape: 4px;
  }
  dialog {
    background-color: var(--background);
    border: none;
    border-radius: var(--m3-dialog-shape);
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
    height: 20px;
    width: 20px;
    fill: var(--font-color);

    top: 2px;
    right: 2px;

    background-color: var(--background);
    padding: 3px;
    border-radius: 2px;

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
    margin-top: 7px;
    border-bottom: 1px solid var(--foreground);
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
    
    font-size: 20px;
    line-height: 20px;

    font-weight: bold;
  }
  
  .content {
    color: var(--font-color);
    margin-bottom: 0.8rem;
  }

  .buttons {
    display: flex;
    justify-content: flex-end;
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
    top: 30px;
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