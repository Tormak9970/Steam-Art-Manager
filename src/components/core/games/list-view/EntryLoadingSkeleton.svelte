<script lang="ts">

</script>

<div class="list-entry-skeleton">
  <div class="shine" />
  <div class="entry-info-skeleton">
    <div class="icon-container-skeleton" />
    <div class="name-skeleton" />
  </div>
</div>

<style>
  .list-entry-skeleton {
    background-color: var(--foreground);
    padding: 0.375rem 0.625rem;
    border-radius: 0.25rem;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    position: relative;

    transition: background-color 0.2s ease-in-out;

    margin-bottom: 0.5rem;
    margin-right: 0.5rem;
    
    position: relative;

    z-index: 1;

    overflow: hidden;
  }

  .entry-info-skeleton {
    display: flex;
    align-items: center;
  }

  .icon-container-skeleton {
    margin-right: 0.5rem;
    border-radius: 0.25rem;

    height: 2rem;
    width: 2rem;

    overflow: hidden;

    background-color: var(--foreground-light);
  }

  .name-skeleton {
    height: 1.5rem;
    line-height: 1.5rem;

    width: 12.5rem;
    border-radius: 0.25rem;

    overflow: hidden;

    background-color: var(--foreground-light);
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