<script lang="ts">
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="entry-loading-skeleton">
  <div class="shine"></div>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="16px"
    width="16px"
    viewBox="0 0 100 100"
    style="height: 16px; width: 16px;">
    <circle
      cx="50"
      cy="50"
      r="38"
      fill="var(--foreground-hover)"
      stroke="var(--foreground-hover)"
      stroke-width="4"></circle>
  </svg>
  <div class="name-placeholder"></div>
</div>

<style>
  .entry-loading-skeleton {
    width: calc(100% - 14px);

    padding: 3px 7px;
    margin-bottom: 7px;

    border-radius: 4px;

    display: flex;
    align-items: center;

    background-color: var(--foreground);

    position: relative;

    z-index: 1;

    overflow: hidden;
  }
  .entry-loading-skeleton:last-child {
    margin-bottom: 0px;
  }

  .name-placeholder {
    height: 14px;
    width: 217px;

    margin-left: 5px;

    background-color: var(--foreground-hover);

    border-radius: 4px;
  }

  .shine {
    position: absolute;

    height: 100%;
    width: 100%;

    left: -100%;

    background-image: linear-gradient(
      to left,
      rgba(var(--foreground-light_rgb), 0.05),
      rgba(var(--foreground-light_rgb), 0.2),
      rgba(var(--foreground-light_rgb), 0.5),
      rgba(var(--foreground-light_rgb), 0.2),
      rgba(var(--foreground-light_rgb), 0.05)
    );
    animation: loading 1.2s infinite;

    z-index: 45;
  }

  @keyframes loading {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }
</style>
