<script lang="ts">
  import { More } from "@icons";
  import { open } from "@tauri-apps/plugin-dialog";
  import type { Placement } from "tippy.js";
  import IconButton from "./IconButton.svelte";

  type Props = {
    label: string;
    onChange?: (value: string) => void | Promise<void>;
    tooltipPosition?: Placement;
    disabled?: boolean;
    highlight?: boolean;
    warn?: boolean;
  };

  let {
    label,
    onChange,
    tooltipPosition = "top-end",
    disabled = false,
    highlight = false,
    warn = false,
  }: Props = $props();

  /**
   * Handles the onClick event of the icon button.
   */
  async function onClick(): Promise<void> {
    const path = await open({
      title: "Select your steam install",
      directory: true,
      multiple: false,
    });
    if (path && path !== "") onChange?.(path as string);
  }
</script>

<IconButton {label} {tooltipPosition} {onClick} {disabled} {highlight} {warn}>
  <More height="0.8rem" width="0.8rem" />
</IconButton>
