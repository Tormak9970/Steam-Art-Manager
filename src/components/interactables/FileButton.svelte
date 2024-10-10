<script lang="ts">
  import { More } from "@icons";
  import { open } from "@tauri-apps/plugin-dialog";
  import { createEventDispatcher } from "svelte";
  import type { Placement } from "tippy.js";
  import IconButton from "./IconButton.svelte";

  export let label: string;
  export let tooltipPosition: Placement = "top-end";
  export let width = "auto";
  export let height = "auto";
  export let disabled = false;
  export let highlight = false;
  export let warn = false;

  const dispatch = createEventDispatcher();

  /**
   * Handles the onClick event of the icon button.
   */
  async function onClick(): Promise<void> {
    const path = await open({
      title: "Select your steam install",
      directory: true,
      multiple: false
    });
    if (path && path !== "") dispatch("changed", { value: path as string });
  }
</script>

<IconButton label={label} tooltipPosition={tooltipPosition} width={width} height={height} on:click={onClick} disabled={disabled} highlight={highlight} warn={warn}>
  <More />
</IconButton>
