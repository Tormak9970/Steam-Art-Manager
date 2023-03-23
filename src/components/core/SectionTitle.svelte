<script lang="ts">
  export let title: string;
  export let fontSize = "20px";
</script>

<div class="section-title">
  <h2 class="title" style="font-size: {fontSize};">{title}</h2>
</div>

<style>
  @import "/theme.css";

  .section-title { width: 100%; }

  .title {
    margin: 7px 12px;
    border-bottom: 1px solid var(--foreground);
  }
</style>