<script lang="ts">
  export let marginTop: string = "10px";
  export let marginBottom: string = "0px";
</script>

<div class="divider" style="margin-top: {marginTop}; margin-bottom: {marginBottom};" />

<style>
  .divider {
    border-bottom: 1px solid var(--foreground);
    /* border-bottom: 1px solid transparent; */
  }
</style>