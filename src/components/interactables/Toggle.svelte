<script lang="ts">
  export let label: string;
  export let checked = true;
  export let onChange = (checked:boolean) => {};

  /**
   * Handles when the slider is clicked.
   * @param event The MouseEvent passed to the handler.
   */
  function handleClick(event: MouseEvent) {
    const target = event.target as HTMLInputElement;

    const state = target.getAttribute("aria-checked");

    checked = state === "true" ? false : true;
    onChange(checked);
  }

</script>

<div class="toggle">
  <button
    role="switch"
    aria-checked={checked}
    on:click={handleClick}
  />
  <span style="margin-left: 10px; font-size: 14px; height: 15px; text-align: center; user-select: none;">{label}</span>
</div>

<style>
  @import "/theme.css";

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
  }

  .toggle button::before {
    content: "";
    position: absolute;
    width: 0.9em;
    height: 0.9em;
    background: #fff;
    top: 0.15em;
    right: 1.1em;
    transition: transform 0.3s;
  }

  .toggle button[aria-checked="true"] {
    background-color: var(--highlight);

    transition: background-color 0.15s ease-in-out;
  }
  .toggle button[aria-checked="true"]:hover {background-color: var(--highlight-hover); }
  .toggle button[aria-checked="true"]::before {
    transform: translateX(0.9em);
    transition: transform 0.3s;
  }

  .toggle button { border-radius: 1.5em; }
  .toggle button::before { border-radius: 100%; }
</style>
