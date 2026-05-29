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
    margin-bottom: 0.25rem;
  }

  .field > .entry {
    font-size: 0.875rem;
    margin-right: 0.5rem;
  }
</style>