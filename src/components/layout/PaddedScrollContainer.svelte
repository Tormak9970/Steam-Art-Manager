<script lang="ts">
  export let width = "100%";
  export let height = "auto";
  export let loading = false;
</script>

<div class="padded-scroll-container" style="width: {width}; height: {height};">
  <div class="padded-scroll-inner" style="overflow: {loading ? "hidden" : "auto"};">
    <div class="padded-scroll-padding" style="padding-right: {loading ? "0px" : "7px"};">
      <slot />
    </div>
  </div>
</div>

<style>
  .padded-scroll-container {
    background-color: var(--background-dark);
    border-radius: 4px;

    margin-top: 7px;
    padding: 5px;

    overflow: hidden;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .padded-scroll-inner {
    width: calc(100% - 4px);
    height: calc(100% - 4px);
  }

  .padded-scroll-padding {
    height: auto;
  }
</style>