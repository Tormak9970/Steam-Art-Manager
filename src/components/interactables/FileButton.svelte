<script lang="ts">
  import { More } from "@icons";
  import { open } from "@tauri-apps/plugin-dialog";
  import type { Placement } from "tippy.js";
  import IconButton from "./IconButton.svelte";

  export let label: string;
  export let tooltipPosition: Placement = "top-end";
  export let width = "22px";
  export let height = "22px";
  export let onChange: (filepath: string) => void;
  export let disabled = false;
  export let highlight = false;
  export let warn = false;

  /**
   * Handles the onClick event of the icon button.
   */
  async function onClick(): Promise<void> {
    const path = await open({
      title: "Select your steam install",
      directory: true,
      multiple: false
    });
    if (path && path !== "") onChange(path as string);
  }
</script>

<IconButton label={label} tooltipPosition={tooltipPosition} width={width} height={height} onClick={onClick} disabled={disabled} highlight={highlight} warn={warn}>
  <More height="1em" />
</IconButton>
