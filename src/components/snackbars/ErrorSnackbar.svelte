<script lang="ts">
  import GenericSnackbar from "./GenericSnackbar.svelte";

  let generic: GenericSnackbar | undefined = $state();

  export const show = (data: { message: string; faster?: boolean }) => {
    generic?.show({
      message: data.message,
      timeout: data.faster ? 2000 : 3000,
    });
  };

  const backgroundColor = "var(--error-snackbar-background)";
  const textColor = "var(--error-snackbar-text)";
</script>

<GenericSnackbar {backgroundColor} {textColor} bind:this={generic} />
