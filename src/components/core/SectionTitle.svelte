<script lang="ts">
  export let title: string;
  export let fontSize = "1.25rem";
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
    margin: 0.375rem;
    margin-bottom: 0;
    border-bottom: 1px solid var(--foreground);
  }
</style>