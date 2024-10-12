<script lang="ts">
  import GenericSnackbar from "./GenericSnackbar.svelte";
  
  let showError: (data: ShowSnackbarOptions) => void;
  
  export const show = (data: { message: any; faster: any; }) => {
    showError({ message: data.message, timeout: data.faster ? 2000 : 3000 });
  }

  const backgroundColor = "var(--error-snackbar-background)";
  const textColor = "var(--error-snackbar-text)";
</script>

<GenericSnackbar backgroundColor={backgroundColor} textColor={textColor} bind:show={showError} />