<script lang="ts">
 import { afterUpdate } from "svelte";

  export let progress:number = 0;
  export let width:string = "200px";
  export let onFinish: () => void = () => {};

  $: isFinished = Math.abs(progress - 100) == 0;

  afterUpdate(() => {
    if (isFinished) {
      onFinish();
    }
  });
</script>

<div class="prog-bar" style="width: calc({width} - 2px);">
  <div class="prog-bar-ind" style="width: {progress}%;" class:finished={isFinished} />
</div>

<style>
  @import "/theme.css";

  .prog-bar {
    position: relative;
    height: 20px;
    background-color: var(--background-dark);
    border: 1px solid #000;
    border-radius: 2px;
  }

  .prog-bar-ind {
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    background-color: var(--highlight);
  }

  .finished {
    background-color: var(--success);
  }
</style>