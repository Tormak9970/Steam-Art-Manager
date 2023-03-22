<script lang="ts">
  import { Pane } from "svelte-splitpanes";
  import DropDown from "../../interactables/DropDown.svelte";
  import Toggle from "../../interactables/Toggle.svelte";
  import SectionTitle from "../SectionTitle.svelte";

</script>

<Pane minSize={20}>
  <SectionTitle title="Filters" />

  <div class="content">
    <Toggle label="Animated" checked={true} />
    
  </div>
</Pane>

<style>

</style>