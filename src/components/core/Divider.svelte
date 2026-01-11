<script lang="ts">
  export let marginTop: string = "0.375rem";
  export let marginBottom: string = "";
</script>

<div class="divider" style="margin-top: {marginTop}; margin-bottom: {marginBottom};" />

<style>
  .divider {
    border-bottom: 1px solid var(--foreground);
  }
</style>