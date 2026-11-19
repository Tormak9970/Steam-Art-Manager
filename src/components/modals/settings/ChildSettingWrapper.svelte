<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    visible: boolean;
    isLast?: boolean;
    children: Snippet;
  };

  let { visible, isLast = false, children }: Props = $props();
</script>

{#if visible}
  <div class="wrapper">
    <div class="lines-container">
      <div class="lines"></div>
      {#if !isLast}
        <div class="connect-next"></div>
      {/if}
    </div>
    <div class="children">
      {@render children()}
    </div>
  </div>
{/if}

<style>
  .wrapper {
    display: flex;
    align-items: start;
  }

  .lines-container {
    position: relative;
    width: 2rem;
    height: 2rem;
  }

  .lines {
    border-left: 0.125rem solid var(--foreground);
    border-bottom: 0.125rem solid var(--foreground);
    border-bottom-left-radius: 0.25rem;

    width: 1.75rem;
    height: 1.75rem;

    position: absolute;
    bottom: 0;
  }

  .connect-next {
    border-left: 0.125rem solid var(--foreground);

    height: 5rem;

    position: absolute;
    left: 0;
    top: 2.5rem;
  }

  .children {
    width: calc(100% - 2rem);
  }
</style>
