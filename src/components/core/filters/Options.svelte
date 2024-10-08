<script lang="ts">
  import { LogController } from "@controllers";
  import { scrollShadow } from "@directives";
  import { Toggle } from "@interactables";
  import { Accordion } from "@layout";
  import { dbFilters, gridType, optionsSize, theme } from "@stores/AppState";
  import { Pane } from "svelte-splitpanes";
  import Divider from "../Divider.svelte";
  import SectionTitle from "../SectionTitle.svelte";

  /**
   * Creates a function to update the specified filter.
   * @param section The section of the filter to update.
   * @param filter The filter to update.
   * @returns A function to update the filter.
   */
  function updateFilters(section: string, filter: string): (value: boolean) => void {
    return (value: boolean) => {
      const filters = $dbFilters;

      // @ts-expect-error this will always work because the properties come from $dbFilters' keys.
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
   * @param event The change event.
   */
  function onDarkModeChange(event: any): void {
    const checked = event.detail.value;
    document.body.setAttribute("data-theme", checked ? "dark" : "light");
    $theme = checked ? 0 : 1;
    LogController.log(`Set theme to "${checked ? "dark" : "light"}".`);
  }
</script>

<Pane minSize={15} size={$optionsSize}>
  <div class="inner">
    <SectionTitle title="Options" />
  
    <div class="content">
      <div class="toggle-container">
        <Toggle label="Dark Mode" value={$theme === 0} on:change={onDarkModeChange}/>
      </div>
      
      <Divider />
    </div>

    <div class="content" style="height: calc(100% - 85px);">
      <div class="scroll-container" use:scrollShadow={{ background: "red"}}>
        <div class="wrapper">
          {#each Object.keys($dbFilters[$gridType]) as section}
            <Accordion
              label="{section === "oneoftag" ? "Tags" : toUpperCaseSplit(section)}"
              open={true}
            >
              <div class="accordion-body">
                {#each Object.keys($dbFilters[$gridType][section]) as filter}
                  <Toggle
                    label="{filter === "material" ? "Minimal" : toUpperCaseSplit(filter)}"
                    value={$dbFilters[$gridType][section][filter]}
                    onChange={updateFilters(section, filter)}
                  />
                {/each}
              </div>
            </Accordion>
          {/each}
        </div>
      </div>
    </div>
  </div>
</Pane>

<style>
  .inner {
    margin-left: 1px;
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .content {
    padding: 0px 6px;
    max-height: calc(100% - 65px)
  }
  .wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .accordion-body {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 7px 0px;
  }
  .toggle-container {
    padding-left: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 20px;
  }
  .scroll-container {
    height: 100%;
    width: 100%;

    overflow: auto;
  }
</style>