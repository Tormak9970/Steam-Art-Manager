<script lang="ts">
  export let orientation: "HORIZONTAL" | "VERTICAL";
</script>

{#if orientation === "HORIZONTAL"}
  <div style="height: 100%; width: 7px;"></div>
{:else}
  <div style="height: 7px; width: 100%;"></div>
{/if}
