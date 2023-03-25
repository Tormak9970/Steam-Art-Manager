<script lang="ts">
  import { onMount } from "svelte";
  import { tabsDict } from "./tabStore";

  export let label: string
  export let tabsId: string;

  onMount(() => {
    let tabStore = $tabsDict[tabsId];
    if (!tabStore) tabStore = { labels: [], selected: "" };

    tabStore.labels.push(label);
    $tabsDict[tabsId] = tabStore;

    $tabsDict = {...$tabsDict};
    console.log($tabsDict)
  });
</script>

<div class="tab" class:render={label == $tabsDict[tabsId]?.selected}>
  <slot />
</div>

<style>
  @import "/theme.css";

	.tab {
    width: 100%;
    height: 100%;

    display: none;
  }

  .render {
    display: flex;
  }
</style>