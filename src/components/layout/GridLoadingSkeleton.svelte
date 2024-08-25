<div class="grid-placeholder">
  <div class="shine" />
  <div class="img-placeholder" />
  <div class="title-placeholder" />
</div>

<style>
  .grid-placeholder {
    height: 100%;
    width: 100%;
    
    border-radius: 4px;

    background-color: var(--foreground);

    position: relative;

    z-index: 1;

    overflow: hidden;

    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .img-placeholder {
    width: calc(100% - 10px);

    flex-grow: 1;

    margin-top: 5px;

    background-color: var(--foreground-hover);

    border-radius: 4px;
  }

  .title-placeholder {
    height: 20px;
    width: calc(100% - 10px);

    margin: 5px 0px;

    background-color: var(--foreground-hover);
    border-radius: 4px;
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