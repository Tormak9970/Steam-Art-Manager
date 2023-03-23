<script lang="ts">
  import { Pane } from "svelte-splitpanes";
  import DropDown from "../../interactables/DropDown.svelte";
  import Toggle from "../../interactables/Toggle.svelte";
  import Accordion from "../../layout/Accordion.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SectionTitle from "../SectionTitle.svelte";

  //* The page parameter will be useful for pagnation

  function updateFilters(section: string, filter: string): () => void {
    return () => {
      
    }
  }
</script>

<Pane minSize={20}>
  <SectionTitle title="Filters" />

  <div class="content">
    <Accordion label="Types" open={true}>
      <VerticalSpacer />
      <Toggle label="Animated" checked={true} />
      <VerticalSpacer />
      <Toggle label="Static" checked={true} />
      <VerticalSpacer />
    </Accordion>
    
    <Accordion label="Styles" open={true}>
      <VerticalSpacer />
      <Toggle label="Alternate" checked={true} />
      <VerticalSpacer />
      <Toggle label="Blurred" checked={true} />
      <VerticalSpacer />
      <Toggle label="White Logo" checked={true} />
      <VerticalSpacer />
      <Toggle label="Material" checked={true} />
      <VerticalSpacer />
      <Toggle label="No Logo" checked={true} />
      <VerticalSpacer />
    </Accordion>

    <Accordion label="Tags" open={true}>
      <VerticalSpacer />
      <Toggle label="Humor" checked={true} />
      <VerticalSpacer />
      <Toggle label="NSFW" checked={false} />
      <VerticalSpacer />
      <Toggle label="Epilepsy" checked={false} />
      <VerticalSpacer />
      <Toggle label="Untagged" checked={true} />
      <VerticalSpacer />
    </Accordion>
    
    <Accordion label="File Types" open={true}>
      <VerticalSpacer />
      <Toggle label="png" checked={true} />
      <VerticalSpacer />
      <Toggle label="jpg" checked={true} />
      <VerticalSpacer />
      <Toggle label="webp" checked={true} />
      <VerticalSpacer />
    </Accordion>

    <Accordion label="Dimensions" open={true}>
      <VerticalSpacer />
      <Toggle label="460x215" checked={true} />
      <VerticalSpacer />
      <Toggle label="920x430" checked={true} />
      <VerticalSpacer />
      <Toggle label="600x900" checked={true} />
      <VerticalSpacer />
      <Toggle label="342x482" checked={true} />
      <VerticalSpacer />
      <Toggle label="660x930" checked={true} />
      <VerticalSpacer />
      <Toggle label="512x512" checked={true} />
      <VerticalSpacer />
      <Toggle label="1024x1024" checked={true} />
      <VerticalSpacer />
    </Accordion>
    
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