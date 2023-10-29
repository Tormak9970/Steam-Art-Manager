<script lang="ts">
  import { Pane } from "svelte-splitpanes";
  import Toggle from "../../interactables/Toggle.svelte";
  import Accordion from "../../layout/Accordion.svelte";
  import SectionTitle from "../SectionTitle.svelte";
  import { SettingsManager } from "../../../lib/utils/SettingsManager";
  import { LogController } from "../../../lib/controllers/LogController";
  import Divider from "../Divider.svelte";
  import { dbFilters, gridType, optionsSize, theme } from "../../../stores/AppState";
  import Spacer from "../../layout/Spacer.svelte";
  import PaddedScrollContainer from "../../layout/PaddedScrollContainer.svelte";

  /**
   * Creates a function to update the specified filter.
   * @param section The section of the filter to update.
   * @param filter The filter to update.
   * @returns A function to update the filter.
   */
  function updateFilters(section: string, filter: string): (value: boolean) => void {
    return (value: boolean) => {
      const filters = $dbFilters;

      filters[$gridType][section][filter] = value;

      $dbFilters = { ...filters };
    }
  }

  /**
   * Capitalizes the first letter of each word.
   * @param word The _ delimited words.
   * @returns The space deleminited words.
   */
  function toUpperCaseSplit(word: string): string {
    if (word.includes("_")) {
      return word.split("_").map((w) => w.substring(0, 1).toUpperCase().concat(w.substring(1))).join(" ");
    } else {
      return word.substring(0, 1).toUpperCase().concat(word.substring(1));
    }
  }

  /**
   * Function to run on theme change.
   * @param checked Whether or not darkmode is enabled.
   */
  function onDarkModeChange(checked: boolean): void {
    document.body.setAttribute("data-theme", checked ? "dark" : "light");
    SettingsManager.updateSetting("theme", checked ? 0 : 1);
    $theme = checked ? 0 : 1;
    LogController.log(`Set theme to "${checked ? "dark" : "light"}".`);
  }
</script>

<Pane minSize={15} size={$optionsSize}>
  <div class="inner">
    <SectionTitle title="Options" />
  
    <div class="content" style="height: 35px;">
      <div style="padding-left: 6px; margin-top: 10px; display: flex; justify-content: space-between;">
        <Toggle label="Dark Mode" value={$theme === 0} onChange={onDarkModeChange}/>
      </div>
      
      <Divider />
      <Spacer orientation="VERTICAL" />
    </div>

    <div class="content" style="height: calc(100% - 85px);">
      <PaddedScrollContainer height={"100%"} width={"100%"} background={"transparent"} marginTop="0px" padding="0px">
        {#each Object.keys($dbFilters[$gridType]) as section, i}
          <Accordion
            label="{section === "oneoftag" ? "Tags" : toUpperCaseSplit(section)}"
            open={true}
          >
            <Spacer orientation="VERTICAL" />
            {#each Object.keys($dbFilters[$gridType][section]) as filter}
              <Toggle
                label="{filter === "material" ? "Minimal" : toUpperCaseSplit(filter)}"
                value={$dbFilters[$gridType][section][filter]}
                onChange={updateFilters(section, filter)}
              />
              <Spacer orientation="VERTICAL" />
            {/each}
          </Accordion>
          {#if i+1 !== Object.keys($dbFilters[$gridType]).length}
            <Spacer orientation="VERTICAL" />
          {/if}
        {/each}
      </PaddedScrollContainer>
    </div>
  </div>
</Pane>

<style>
  .inner {
    margin-left: 1px;
    height: 100%;
    width: 100%;
  }
  .content {
    padding: 0px 6px;
    max-height: calc(100% - 65px)
  }
</style>