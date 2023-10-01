<script lang="ts">
  export let title: string;
  export let onClose: () => void = () => {};
  export let canClose = true;

  let canQuit = false;

  /**
   * Function to run on mouse down to see if the modal should close.
   * @param e The associated event.
   */
  function checkCanQuit(e: MouseEvent): void {
    canQuit = e.currentTarget === e.target && e.button === 0;
  }

  /**
   * Function to run on mouse up to see if the modal should still close.
   * @param e The associated event.
   */
  function closeWrapper(e: MouseEvent): void {
    if (e.currentTarget === e.target && canQuit) onClose();
  }
</script>

<div class="blur" />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="background" on:mousedown={checkCanQuit} on:mouseup={closeWrapper} on:contextmenu|preventDefault|stopPropagation>
  <div class="modal-body" on:contextmenu|stopPropagation>
    {#if canClose}
      <div class="close-btn" on:click={onClose}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
          <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
        </svg>
      </div>
    {/if}
    <div class="header">{title}</div>
    <div class="border" />
    <slot />
  </div>
</div>

<style>
  .background {
    font-size: 12px;
    z-index: 4;
    position: absolute;
    width: 100%;
    height: calc(100% - 30px);
    display: flex;
  }

  .blur {
    z-index: 3;
    position: absolute;
    width: 100%;
    height: calc(100% - 30px);

    background: rgba(6, 6, 6, 0.85);
    backdrop-filter: blur(1px);
  }

  .border {
    margin-top: 7px;
    border-bottom: 1px solid var(--foreground);
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

  .modal-body {
    margin: auto;
    background-color: var(--background);
    border-radius: 4px;
    border: 1px solid var(--shadow);
    position: relative;
  }

  .header {
    text-align: center;
    font-size: 20px;
    margin-top: 4px;
  }
</style>
