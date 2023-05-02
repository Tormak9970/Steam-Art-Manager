<script lang="ts">
  import { Pane } from "svelte-splitpanes";
  import { gridType, dbFilters, theme } from "../../../Stores";
  import Toggle from "../../interactables/Toggle.svelte";
  import Accordion from "../../layout/Accordion.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import { SettingsManager } from "../../../lib/utils/SettingsManager";
  import { LogController } from "../../../lib/controllers/LogController";

  /**
   * Creates a function to update the specified filter.
   * @param section The section of the filter to update.
   * @param filter The filter to update.
   * @returns A function to update the filter.
   */
  function updateFilters(section: string, filter: string): (value:boolean) => void {
    return (value: boolean) => {
      const filters = $dbFilters;

      filters[$gridType][section][filter] = value;

      $dbFilters = {...filters};
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

  function onDarkModeChange(checked: boolean): void {
    document.documentElement.setAttribute("data-theme", checked ? "dark" : "light");
    SettingsManager.updateSetting("theme", checked ? 0 : 1);
    LogController.log(`Set theme to "${checked ? "dark" : "light"}".`);
  }
</script>

<Pane minSize={15} size={20}>
  <SectionTitle title="Options" />
  
  <div class="content" style="height: 36px;">
    <div style="margin-left: 6px; display: flex; justify-content: space-between;">
      <Toggle label="Dark Mode" checked={$theme == 0} onChange={onDarkModeChange}/>
    </div>
    
    <div class="border" />
    <VerticalSpacer />
  </div>

  <div class="content" style="height: calc(100% - 85px);">
    {#each Object.keys($dbFilters[$gridType]) as section}
      <Accordion
        label="{section == "oneoftag" ? "Tags" : toUpperCaseSplit(section)}"
        open={true}
      >
        <VerticalSpacer />
        {#each Object.keys($dbFilters[$gridType][section]) as filter}
          <Toggle
            label="{filter == "material" ? "Minimal" : toUpperCaseSplit(filter)}"
            checked={$dbFilters[$gridType][section][filter]}
            onChange={updateFilters(section, filter)}
          />
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
    padding: 0px 6px;
    overflow: auto;
    max-height: calc(100% - 65px)
  }

  .border {
    margin-top: 10px;
    border-bottom: 1px solid var(--foreground);
  }
</style>