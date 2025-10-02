<div class="social-preview">
  <div class="backdrop" />
  <div class="content">
    <div class="icon-container">
      <!-- svelte-ignore a11y-missing-attribute -->
      <img src="/logo.png" width="10rem" />
    </div>
    <div class="text-container">
      <div class="name">Steam Art Manager</div>
      <div class="description">Simple and elegant Steam library customization.</div>
    </div>
  </div>
</div>

<style>
  .social-preview {
    z-index: 1000000;

    position: absolute;
    width: 100%;
    height: 100%;

    background-color: rgba(0, 0, 0, 0.2);
  }

  .backdrop {
    width: 100%;
    height: 100%;

    background: rgba(10, 10, 10, 0.85);
    backdrop-filter: blur(3px);
  }

  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    display: flex;
    align-items: center;
  }

  .text-container {
    margin-left: 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .name {
    font-size: 5rem;
    font-weight: bold;
    white-space: nowrap;
  }

  .description {
    font-size: 1.5rem;
  }
</style>