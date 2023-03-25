<script lang="ts">
  import { onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import { gridType, GridTypes, selectedGameAppId } from "../../../Stores";
  import Tab from "../../layout/tabs/Tab.svelte";
  import Tabs from "../../layout/tabs/Tabs.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SectionTitle from "../SectionTitle.svelte";

  onMount(() => {
    gridType.subscribe(type => console.log(type));
  })
</script>

<Pane minSize={20}>
  <SectionTitle title="Grids" />

  <div class="content">
    {#if $selectedGameAppId != null}
      <Tabs tabsId="gridTypes" bind:selected={$gridType}>
        {#each Object.values(GridTypes) as type}
          <Tab label="{type}" tabsId="gridTypes">
            {type}
          </Tab>
        {/each}
      </Tabs>
    {:else}
      <div class="message">
        Select a game to start managing your art!
      </div>
    {/if}
    
    <VerticalSpacer />
  </div>
</Pane>

<style>
  .content {
    margin: 0px 6px;
    overflow: auto;
    max-height: calc(100% - 45px);
  }

  .message {
    width: 100%;
    text-align: center;
    opacity: 0.1;
    padding-top: 40px;
  }
</style>