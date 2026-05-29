<script lang="ts">
 import { afterUpdate } from "svelte";

  export let progress:number = 0;
  export let width:string = "12.5rem";
  export let onFinish: () => void = () => {};

  $: isFinished = Math.abs(progress - 100) === 0;

  afterUpdate(() => {
    if (isFinished) {
      onFinish();
    }
  });
</script>

<div class="prog-bar" style="width: calc({width} - 0.125rem);">
  <div class="prog-bar-ind" style="width: {progress}%;" class:finished={isFinished} />
</div>

<style>
  .prog-bar {
    position: relative;
    height: 1.25rem;
    background-color: var(--background-dark);
    border: 0.0625rem solid #000;
    border-radius: 0.125rem;
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