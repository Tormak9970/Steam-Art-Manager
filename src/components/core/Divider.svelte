<script lang="ts">
  let { marginTop = "0.375rem", marginBottom = "" } = $props();
</script>

<div
  class="divider"
  style="margin-top: {marginTop}; margin-bottom: {marginBottom};"
></div>

<style>
  .divider {
    border-bottom: 0.0625rem solid var(--foreground);
  }
</style>
