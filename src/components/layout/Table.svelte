<script lang="ts">
  import { scrollShadow } from "@directives";

  export let height = "400px";
</script>

<div class="table" style="height: {height};">
  <div class="header">
    <slot name="header" />
  </div>
  <div class="border" style="margin-top: 3px;"></div>
  <div class="content-container">
    <div class="scroll-container" use:scrollShadow={{ background: "--background-dark" }}>
      <slot name="data" />
    </div>
  </div>
</div>

<style>
  .table {
    margin-top: 7px;

    width: calc(100% - 14px);
    
    padding: 7px;

    border-radius: 4px;

    font-size: 14px;

    background-color: var(--background-dark);
  }

  .border {
    margin-top: 7px;
    position: relative;
    z-index: 2;

    border-bottom: 1px solid var(--foreground);
  }

  .header, .header :global(> :first-child) {
    width: 100%;

    display: flex;
    justify-content: flex-start;
  }

  .content-container {
    padding-top: 5px;
    height: calc(100% - 25px);
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