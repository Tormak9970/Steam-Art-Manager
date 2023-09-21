<script lang="ts">
  import PaddedScrollContainer from "./PaddedScrollContainer.svelte";

  export let height = "400px";
  export let marginLeft = "7px";
  export let loading = false;
</script>

<div class="table" style="height: {height}; margin-left: {marginLeft};">
  <div class="header">
    <slot name="header" />
  </div>
  <div class="border" style="margin-top: 3px;"></div>
  <PaddedScrollContainer height={"calc(100% - 25px)"} width={"100%"} background={"transparent"} padding={"5px 0px 0px 0px"} marginTop="0px" loading={loading}>
    <slot name="data" />
  </PaddedScrollContainer>
</div>

<style>
  .table {
    margin-top: 7px;

    width: calc(100% - 28px);
    
    padding: 7px;

    border-radius: 4px;

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
</style>