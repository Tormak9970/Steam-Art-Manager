<script lang="ts">
 import { afterUpdate } from "svelte";

  export let progress:string = "0%";
  export let timeToReset:number = 2000;
  export let width:string = "200px";

  $: isFinished = Math.abs(parseInt(progress.substring(0, progress.length - 1)) - 100) <= 0.05;

  afterUpdate(() => {
    if (isFinished) {
      setTimeout(() => {
        progress = "0%";
      }, timeToReset);
    }
  });
</script>

<div class="prog-bar" style="width: {width};">
  <div class="prog-bar-ind" style="width: {progress};" class:finished={isFinished} />
</div>

<style>
  @import "/theme.css";

  .prog-bar {
    position: relative;
    height: 20px;
    background-color: var(--background);
    border: 1px solid #000;
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