<script lang="ts">
  import { onDestroy } from "svelte";
  import { fly } from "svelte/transition";

  type SnackbarData = {
    message: string;
    timeout: number | null;
  };
  
  export const show = ({ message, timeout = 4000 }: ShowSnackbarOptions) => {
    snackbar = { message, timeout };
    clearTimeout(timeoutId);

    if (timeout) {
      timeoutId = setTimeout(() => {
        snackbar = undefined;
      }, timeout);
    }
  };

  export let backgroundColor: string;
  export let textColor: string;

  let snackbar: SnackbarData | undefined;
  let timeoutId: any;
  
  onDestroy(() => {
    clearTimeout(timeoutId);
  });
</script>

{#if snackbar}
  <dialog class="holder" open in:fly={{ y: 100, duration: 300 }} out:fly={{ y: 100, duration: 400 }}>
    <div class="m3-container" style:--background-color={backgroundColor} style:--text-color={textColor}>
      <p class="m3-font-body-medium">{snackbar.message}</p>
    </div>
  </dialog>
{/if}

<style>
  :root {
    --m3-scheme-shadow: 0 0 0;

    --m3-snackbar-shape: 0.25rem;

    --m3-util-elevation-3: 0px 5px 5px -3px rgb(var(--m3-scheme-shadow) / 0.2),
    0px 8px 10px 1px rgb(var(--m3-scheme-shadow) / 0.14),
    0px 3px 14px 2px rgb(var(--m3-scheme-shadow) / 0.12);
  }

  .holder {
    border: 0;
    padding: 0;

    width: calc(100% - 2rem);
    max-width: 30rem;

    padding-bottom: 0.7rem;

    position: absolute;
    bottom: 0;

    background-color: transparent;
    z-index: 3;
  }
  p {
    margin-right: auto;
  }

  .holder::backdrop {
    display: none;
  }

  .m3-container {
    display: flex;
    align-items: center;
    padding: 0 1rem;

    min-width: 20rem;
    max-width: 60rem;
    min-height: 3rem;
    border-radius: 0.25rem;

    box-shadow: var(--m3-util-elevation-3);
    background-color: rgb(var(--background-color));
    color: rgb(var(--text-color));

    overflow: hidden;
  }
</style>