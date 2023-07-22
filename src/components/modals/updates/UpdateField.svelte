<script lang="ts">
  export let label: string;
  export let value: string;
</script>

<div class="field">
  <div class="entry"><b>{label}</b>: {value}</div>
</div>

<style>
  .field {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  .field > .entry {
    font-size: 14px;
    margin-right: 7px;
  }
</style>