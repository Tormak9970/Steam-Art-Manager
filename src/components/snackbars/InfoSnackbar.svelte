<script lang="ts">
  import GenericSnackbar from "./GenericSnackbar.svelte";
  
  let showInfo: (data: ShowSnackbarOptions) => void;
  
  export const show = (data: { message: any; }) => {
    showInfo({ message: data.message, timeout: 2500 });
  }

  const backgroundColor = "var(--info-snackbar-background)";
  const textColor = "var(--info-snackbar-text)";
</script>

<GenericSnackbar backgroundColor={backgroundColor} textColor={textColor} bind:show={showInfo} />