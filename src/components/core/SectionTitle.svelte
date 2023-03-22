<script lang="ts">
  export let title: string;

</script>

<div class="section-title">
  <h2 class="title">{title}</h2>
</div>

<style>
  @import "/theme.css";

  .section-title { width: 100%; }

  .title {
    margin: 7px 12px;
    font-size: 20px;
    border-bottom: 1px solid var(--foreground);
  }
</style>