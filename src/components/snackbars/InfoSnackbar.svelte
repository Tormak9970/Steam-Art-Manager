<script lang="ts">
  import GenericSnackbar from "./GenericSnackbar.svelte";

  let generic: GenericSnackbar | undefined = $state();

  export const show = (data: { message: string }) => {
    generic?.show({ message: data.message, timeout: 2500 });
  };

  const backgroundColor = "var(--info-snackbar-background)";
  const textColor = "var(--info-snackbar-text)";
</script>

<GenericSnackbar {backgroundColor} {textColor} bind:this={generic} />
