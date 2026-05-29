<script lang="ts">
  export let title: string;
</script>

<div class="info-modal-section">
  <h1 class="title">{title}</h1>
  <div class="content">
    <slot />
  </div>
</div>

<style>
  .info-modal-section {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    background-color: var(--background-dark);
    padding: 0.5rem;
    border-radius: 0.25rem;
  }

  .title {
    margin-top: 0rem;
    font-size: 1.5rem;
  }

  .content {
    line-height: 1.5rem;
    font-size: 0.875rem;
    margin: 0.5rem 0rem;
  }
</style>