<script lang="ts">
  import { scrollShadow } from "@directives";

  export let height = "25rem";
</script>

<div class="table" style="height: {height};">
  <div class="header">
    <slot name="header" />
  </div>
  <div class="border" style="margin-top: 0.25rem;"></div>
  <div class="content-container">
    <div class="scroll-container" use:scrollShadow={{ background: "--background-dark" }}>
      <slot name="data" />
    </div>
  </div>
</div>

<style>
  .table {
    margin-top: 0.5rem;

    width: calc(100% - 0.875rem);
    
    padding: 0.5rem;

    border-radius: 0.25rem;

    font-size: 0.875rem;

    background-color: var(--background-dark);
  }

  .border {
    margin-top: 0.5rem;
    position: relative;
    z-index: 2;

    border-bottom: 0.0625rem solid var(--foreground);
  }

  .header, .header :global(> :first-child) {
    width: 100%;

    display: flex;
    justify-content: flex-start;
  }

  .content-container {
    padding-top: 0.375rem;
    height: calc(100% - 1.625rem);
    width: 100%;

    position: relative;

    overflow: hidden;
  }

  .scroll-container {
    height: 100%;
    width: 100%;

    overflow: auto;
  }
</style>