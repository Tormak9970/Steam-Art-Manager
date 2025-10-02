<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  export let extraOptions: HTMLAttributes<HTMLDivElement> = {};
  export let percent: number;
</script>

<div class="m3-container" role="progressbar" {...extraOptions}>
  <div class="percent" style="width: {percent}%;" />
</div>

<style>
  :root {
    --m3-linear-progress-shape: 0.25rem;
  }
  .m3-container {
    display: inline-flex;
    background-color: var(--foreground);
    height: 0.5rem;
    min-width: 8rem;
    width: 100%;
    overflow: hidden;
    border-radius: var(--m3-linear-progress-shape);
  }
  .percent {
    background-color: var(--highlight);
    transition: all 200ms;
    border-radius: var(--m3-linear-progress-shape);
  }

  .m3-container {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
</style>