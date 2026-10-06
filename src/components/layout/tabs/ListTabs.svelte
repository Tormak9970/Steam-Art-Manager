<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    selected: string;
    tabs: string[];
    height?: string;
    children: Snippet;
  };

  let { selected, tabs, height = "100%", children }: Props = $props();

  /**
   * Handles the onClick event.
   * @param label The label of the tab to render.
   */
  function onClick(label: string): void {
    selected = label;
  }
</script>

<div class="tabs-container">
  <ul style="user-select: none;">
    {#each tabs as tab}
      <li class:active={selected === tab}>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <span onclick={() => onClick(tab)}>{tab}</span>
      </li>
    {/each}
  </ul>

  <div class="tabs" style="height: {height};">
    {@render children()}
  </div>
</div>

<style>
  .tabs-container {
    height: calc(100% - 0.125rem);
    width: calc(100% - 0.125rem);

    border: 1px solid var(--foreground);

    border-radius: 0.25rem;
  }

  .tabs {
    padding: 0.625rem;
    padding-bottom: 0.25rem;
    border-top: 0.125rem solid var(--foreground);

    background-color: var(--background);

    border-radius: 0rem 0rem 0.25rem 0.25rem;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin: 0;
    list-style: none;

    display: flex;
  }
  li {
    margin-bottom: -0.0625rem;
    flex-grow: 1;

    justify-content: center;

    border-right: 0.0625rem solid var(--foreground);
    overflow: hidden;
  }
  li:first-child {
    border-top-left-radius: 0.25rem;
  }
  li:last-child {
    border-right: none;
    border-top-right-radius: 0.25rem;
  }

  span {
    display: block;
    padding: 0.375rem 0.5rem;
    cursor: pointer;

    background-color: var(--background);

    transition: background-color 0.15s ease-in-out;
  }

  li.active > span {
    background-color: var(--foreground);
  }

  span:hover {
    background-color: var(--background-hover);
  }
  li.active > span:hover {
    background-color: var(--foreground-hover);
  }
</style>
