<script lang="ts">
  type Props = {
    label?: string;
    value: string;
    placeholder?: string;
    width?: string;
    onChange?: (value: string) => void;
    onInput?: (value: string) => void;
  };

  let {
    label = "",
    value = $bindable(),
    placeholder = "",
    width = "8.75rem",
    onChange,
    onInput,
  }: Props = $props();
</script>

<div class="input">
  {#if label !== ""}
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label
      style="margin-right: 0.625rem; font-size: 0.825rem; user-select: none;"
      >{label}:</label
    >
  {/if}
  <input
    style="width: {width};"
    type="text"
    placeholder={placeholder !== "" ? placeholder : value}
    bind:value
    onchange={(e) => onChange?.(e.currentTarget?.value)}
    oninput={(e) => onInput?.(e.currentTarget?.value)}
  />
</div>

<style>
  .input {
    margin: 0rem;

    display: flex;
    flex-direction: row;
    align-items: center;

    color: var(--font-color);

    font-size: 0.75rem;
  }

  .input > input {
    color: var(--font-color);
    background-color: var(--background-hover);
    border: 0.0625rem solid var(--foreground);
    outline: none;
    border-radius: 0.25rem;
    padding: 0.25rem;

    transition:
      background-color 0.15s ease-in-out,
      border 0.15s ease-in-out;
  }
  .input > input:hover,
  .input > input:focus {
    background-color: var(--foreground);
    border: 0.0625rem solid var(--foreground-hover);
    outline: none;
  }
</style>
