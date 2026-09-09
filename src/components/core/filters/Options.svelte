<script lang="ts">
  import { LogController } from "@controllers";
  import { isOverflowing, scrollShadow } from "@directives";
  import { Moon, Sun, SunAndMoon } from "@icons";
  import { ThreeWayToggle, Toggle } from "@interactables";
  import { Accordion } from "@layout";
  import { dbFilters, gridType, optionsSize, theme } from "@stores/AppState";
  import { Pane } from "svelte-splitpanes";
  import Divider from "../Divider.svelte";
  import SectionTitle from "../SectionTitle.svelte";

  let overflowing = false;

  /**
   * Creates a function to update the specified filter.
   * @param section The section of the filter to update.
   * @param filter The filter to update.
   * @returns A function to update the filter.
   */
  function updateFilters(section: string, filter: string): (e: any) => void {
    return (e: any) => {
      const value = e.detail.value;
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
   * @param value The theme.
   */
  function onDarkModeChange(value: number): void {
    const newTheme = value === 0 ? "dark" : value === 1 ? "light" : "auto"
    document.body.setAttribute("data-theme", newTheme);
    $theme = value;
    LogController.log(`Set theme to "${newTheme}".`);
  }
</script>

<Pane minSize={15} size={$optionsSize}>
  <div class="inner">
    <SectionTitle title="Options" />
  
    <div class="content">
      <div class="toggle-container">
        <ThreeWayToggle leftTooltip="Dark" midTooltip="Light" rightTooltip="Auto" value={$theme} onChange={onDarkModeChange}>
          <span slot="left">
            <Moon width="1rem" height="1rem" />
          </span>
          <span slot="middle">
            <Sun width="1rem" height="1rem" />
          </span>
          <span slot="right">
            <SunAndMoon width="1rem" height="1rem" />
          </span>
        </ThreeWayToggle>
      </div>
      
      <Divider />
    </div>

    <div class="content" style="height: calc(100% - 5.375rem);">
      <div class="scroll-container" use:scrollShadow={{ background: "red"}} use:isOverflowing={{ callback: (o) => overflowing = o }}>
        <div class="wrapper" style:width={overflowing ? "calc(100% - 0.5rem)" : "100%"}>
          {#each Object.keys($dbFilters[$gridType]) as section}
            <Accordion
              label="{section === "oneoftag" ? "Tags" : toUpperCaseSplit(section)}"
              open={true}
            >
              <div class="accordion-body">
                {#each Object.keys($dbFilters[$gridType][section]) as filter}
                  <Toggle
                    label="{
                      filter === "material" ? "Minimal" : 
                      filter === "nsfw" ? "Adult Content" : 
                      filter === "image/vnd.microsoft.icon" ? "image/ico" : 
                      toUpperCaseSplit(filter)
                    }"
                    value={$dbFilters[$gridType][section][filter]}
                    on:change={updateFilters(section, filter)}
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
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .content {
    padding: 0 0.375rem;
  }
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .accordion-body {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }
  .toggle-container {
    padding-top: 0;
    padding-bottom: 0.125rem;
    padding-left: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .scroll-container {
    height: 100%;
    width: 100%;

    overflow: auto;
  }
</style>