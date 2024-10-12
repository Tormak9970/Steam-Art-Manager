<script lang="ts">
  export let title: string;
  export let fontSize = "20px";
</script>

<div class="section-title">
  <h2 class="title" style="font-size: {fontSize};">{title}</h2>
</div>

<style>
  .section-title {
    width: 100%;
    user-select: none;
  }

  .title {
    margin: 6px;
    margin-bottom: 0px;
    border-bottom: 1px solid var(--foreground);
  }
</style>