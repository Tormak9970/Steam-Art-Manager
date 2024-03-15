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
    padding: 6px 10px;
    border-radius: 4px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    position: relative;

    transition: background-color 0.2s ease-in-out;

    margin-bottom: 7px;
    margin-right: 7px;
    
    position: relative;

    z-index: 1;

    overflow: hidden;
  }

  .entry-info-skeleton {
    display: flex;
    align-items: center;
  }

  .icon-container-skeleton {
    margin-right: 7px;
    border-radius: 4px;

    height: 32px;
    width: 32px;

    overflow: hidden;

    background-color: var(--foreground-light);
  }

  .name-skeleton {
    height: 23px;
    line-height: 23px;

    width: 200px;
    border-radius: 4px;

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