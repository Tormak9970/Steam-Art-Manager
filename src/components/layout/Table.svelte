<script lang="ts">
  export let height = "400px";
  export let marginLeft = "7px";
</script>

<div class="table" style="height: {height}; margin-left: {marginLeft};">
  <div class="header">
    <slot name="header" />
  </div>
  <div class="border" style="margin-top: 3px;"></div>
  <div class="data-scroller">
    <div class="data">
      <slot name="data" />
    </div>
  </div>
</div>

<style>
  @import "/theme.css";

  .table {
    margin-top: 7px;

    width: calc(100% - 28px);
    
    padding: 7px;

    background-color: var(--background-dark);
  }

  .border {
    margin-top: 7px;
    border-bottom: 1px solid var(--foreground);
  }

  .header, .header :global(> :first-child) {
    width: 100%;

    display: flex;
    justify-content: flex-start;
  }

  .data {
    margin-top: 3px;
    width: 100%;

    overflow: hidden;
  }

  .data-scroller {
    margin-top: 3px;
    width: 100%;

    height: calc(100% - 20px);

    overflow: scroll;
  }
</style>