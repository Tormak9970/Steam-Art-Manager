<script lang="ts">
  
</script>

<div class="entry-loading-skeleton">
  <div class="shine" />
  <svg xmlns="http://www.w3.org/2000/svg" height="1rem" width="1rem" viewBox="0 0 100 100" style="height: 1rem; width: 1rem;">
    <rect x="0" y="0" width="100" height="100" rx="20" ry="20" fill="var(--background)" />
  </svg>
  <div class="name-placeholder" />
</div>

<style>
  .entry-loading-skeleton {
    width: calc(100% - 0.75rem);
    height: 1.25rem;
    
    padding: 0.25rem 0.325rem;

    border-radius: 0.25rem;

    display: flex;
    align-items: center;

    background-color: var(--background-dark);
    border: 0.0625rem solid var(--foreground);

    position: relative;

    z-index: 1;

    overflow: hidden;
  }
  .entry-loading-skeleton:last-child {
    margin-bottom: 0rem;
  }

  .name-placeholder {
    height: 1rem;
    width: 13.5rem;

    margin-left: 0.25rem;

    background-color: var(--background);

    border-radius: 0.25rem;
  }

  .shine {
    position: absolute;

    height: 100%;
    width: 100%;

    left: -100%;

    background-image: linear-gradient(to left, rgba(var(--foreground-light_rgb), 0.05), rgba(var(--foreground-light_rgb), .2), rgba(var(--foreground-light_rgb), .5), rgba(var(--foreground-light_rgb), .2), rgba(var(--foreground-light_rgb), 0.05));
    animation: loading 1.2s infinite;

    z-index: 45;
  }

  @keyframes loading {
    0%{
      left: -100%;
    }
    100%{
      left: 100%;
    }
  }
</style>