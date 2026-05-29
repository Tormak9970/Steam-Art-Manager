<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let label: string = "";
  export let value = true;

  const dispatch = createEventDispatcher();

  /**
   * Handles when the slider is clicked.
   * @param event The MouseEvent passed to the handler.
   */
  function handleClick(event: MouseEvent): void {
    const target = event.target as HTMLInputElement;

    const state = target.getAttribute("aria-checked");

    value = state === "true" ? false : true;
    dispatch("change", { value: value });
  }

</script>

<div class="toggle">
  <button
    role="switch"
    aria-checked={value}
    on:click={handleClick}
  />
  {#if label !== ""}
    <span style="margin-left: 0.625rem; font-size: 0.875rem; height: 1rem; text-align: center; user-select: none;">{label}</span>
  {/if}
</div>

<style>
  .toggle {
    display: flex;
    align-items: center;
  }

  .toggle button {
    width: 2.25rem;
    height: 1.375rem;

    position: relative;

    background: var(--background-hover);
    border: 0.0625rem solid var(--foreground);

    cursor: pointer;
    transition: background-color 0.15s ease-in-out;

    border-radius: 11rem;
  }
  .toggle button:hover {
    background-color: var(--foreground);
    border: 0.0625rem solid var(--foreground-hover);
  }

  .toggle button::before {
    content: "";
    
    width: 0.875rem;
    height: 0.875rem;

    position: absolute;
    top: 3px;
    right: 17px;

    background: var(--foreground-light);
    transition: transform 0.3s;

    border-radius: 100%;
  }

  .toggle button[aria-checked="true"] {
    background-color: var(--highlight);

    transition: background-color 0.15s ease-in-out;
  }
  .toggle button[aria-checked="true"]:hover {
    background-color: var(--highlight-hover);
  }
  .toggle button[aria-checked="true"]::before {
    transform: translateX(14px);
    transition: transform 0.3s;
    
    background: var(--background-dark);
  }
</style>
