<script lang="ts">
  export let label: string = "";
  export let value = true;
  export let onChange = (checked:boolean) => {};

  /**
   * Handles when the slider is clicked.
   * @param event The MouseEvent passed to the handler.
   */
  function handleClick(event: MouseEvent): void {
    const target = event.target as HTMLInputElement;

    const state = target.getAttribute("aria-checked");

    value = state === "true" ? false : true;
    onChange(value);
  }

</script>

<div class="toggle">
  <button
    role="switch"
    aria-checked={value}
    on:click={handleClick}
  />
  {#if label !== ""}
    <span style="margin-left: 10px; font-size: 14px; height: 15px; text-align: center; user-select: none;">{label}</span>
  {/if}
</div>

<style>
  .toggle {
    display: flex;
    align-items: center;
  }

  .toggle button {
    width: 2.15em;
    height: 1.2em;
    position: relative;
    background: var(--foreground-light);
    border: none;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
  }
  .toggle button:hover {
    background: var(--foreground-light-hover);
  }

  .toggle button::before {
    content: "";
    position: absolute;
    width: 0.9em;
    height: 0.9em;
    background: var(--background-dark);
    top: 0.15em;
    right: 1.1em;
    transition: transform 0.3s;
  }

  .toggle button[aria-checked="true"] {
    background-color: var(--highlight);

    transition: background-color 0.15s ease-in-out;
  }
  .toggle button[aria-checked="true"]:hover { background-color: var(--highlight-hover); }
  .toggle button[aria-checked="true"]::before {
    transform: translateX(0.9em);
    transition: transform 0.3s;
  }

  .toggle button { border-radius: 1.5em; }
  .toggle button::before { border-radius: 100%; }
</style>
