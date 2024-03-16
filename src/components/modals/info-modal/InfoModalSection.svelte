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
    margin: 0px 14px;

    background-color: var(--background-dark);
    padding: 6px;
    border-radius: 4px;
  }

  .title {
    margin-top: 0px;
    font-size: 18px;
  }

  .content {
    line-height: 18px;
    font-size: 12px;
    margin: 7px 0px;
  }
</style>