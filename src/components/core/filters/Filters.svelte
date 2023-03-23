<script lang="ts">
  import { Pane } from "svelte-splitpanes";
  import { artType, dbFilters } from "../../../Stores";
  import Toggle from "../../interactables/Toggle.svelte";
  import Accordion from "../../layout/Accordion.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SectionTitle from "../SectionTitle.svelte";

  /**
   * Creates a function to update the specified filter.
   * @param section The section of the filter to update.
   * @param filter The filter to update.
   * @returns A function to update the filter.
   */
  function updateFilters(section: string, filter: string): (value:boolean) => void {
    return (value: boolean) => {
      const filters = $dbFilters;

      filters[$artType][section][filter] = value;

      $dbFilters = {...filters};
      console.log($dbFilters);
    }
  }

  /**
   * Capitalizes the first letter of each word.
   * @param word The _ delimited words.
   * @returns The space deleminited words.
   */
  function toUpperCaseSplit(word: string): string {
    if (word.includes("_")) {
      return word.split("_").map((w) => w.substring(0,1).toUpperCase().concat(w.substring(1))).join(" ");
    } else {
      return word.substring(0,1).toUpperCase().concat(word.substring(1));
    }
  }
</script>

<Pane minSize={15}>
  <SectionTitle title="Filters" />

  <div class="content">
    {#each Object.keys($dbFilters[$artType]) as section}
      <Accordion label="{section == "oneoftag" ? "Tags" : toUpperCaseSplit(section)}" open={true}>
        <VerticalSpacer />
        {#each Object.keys($dbFilters[$artType][section]) as filter}
          <Toggle label="{toUpperCaseSplit(filter)}" checked={$dbFilters[$artType][section][filter]} onChange={updateFilters(section, filter)} />
          <VerticalSpacer />
        {/each}
      </Accordion>
    {/each}
    
    <VerticalSpacer />
  </div>
</Pane>

<style>
  .content {
    margin: 0px 6px;
    overflow: auto;
    max-height: calc(100% - 45px)
  }
</style>