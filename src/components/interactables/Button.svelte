<script lang="ts">
  type Props = {
    label: string;
    onClick: () => void | Promise<void>;
    width?: string;
    disabled?: boolean;
    highlight?: boolean;
    warn?: boolean;
    padding?: string;
  };

  let {
    label,
    onClick,
    width = "auto",
    disabled = false,
    highlight = false,
    warn = false,
    padding = "0.375rem 0.75rem",
  }: Props = $props();
</script>

<button
  class:warn
  class:highlight
  class:disabled
  style:padding
  style:width
  onclick={onClick}
>
  <div style="user-select: none;">
    {label}
  </div>
</button>

<style>
  button {
    min-width: 3.25rem;

    height: auto;

    background-color: var(--background-hover);
    border: 0.0625rem solid var(--foreground);
    border-radius: 0.25rem;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 0.75rem;
    cursor: pointer;

    color: var(--font-color);

    transition:
      background-color 0.15s ease-in-out,
      border 0.15s ease-in-out;
  }

  button:hover {
    background-color: var(--foreground);
    border: 0.0625rem solid var(--foreground-hover);
  }

  button:focus {
    outline: none;
  }

  .disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .highlight {
    background-color: #18bb039c;
    border: 0.0625rem solid var(--save-hover);
  }
  .highlight:hover {
    background-color: #18bb03c5;
    border: 0.0625rem solid var(--save-hover);
  }

  .warn {
    background-color: var(--warning);
  }
  .warn:hover {
    background-color: var(--warning-hover);
  }
</style>
