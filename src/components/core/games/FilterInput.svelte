<script lang="ts">
  import { DropDown, SearchBar } from "@interactables";
  import { filterGridsBy } from "@stores/AppState";
  import { ExperimentalFilterMethods, FilterMethods } from "@types";

  type Props = {
    onChange: (value: string) => void;
    value: string;
  };

  let { onChange, value = $bindable() }: Props = $props();

  $effect(() => {
    console.log(value);
  });

  let searchComponent: SearchBar | undefined = $state();

  function overwriteCtrlF(e: Event): void {
    if ((e as KeyboardEvent).ctrlKey && (e as KeyboardEvent).key === "f") {
      e.preventDefault();
      searchComponent!.setSearchFocus();
    }
  }

  const familySharingOptions = [
    { label: "Either", data: "" },
    { label: "Shared", data: "yes" },
    { label: "Owned", data: "no" },
  ];
</script>

<svelte:window on:keydown={overwriteCtrlF} />

{#if $filterGridsBy === FilterMethods.NAME || $filterGridsBy === FilterMethods.APP_ID}
  <SearchBar
    label="Search Library"
    {onChange}
    interval={800}
    bind:this={searchComponent}
  />
{:else if $filterGridsBy === ExperimentalFilterMethods.COLLECTIONS}
  <!-- TODO: need to show a tooltip listing all collections -->
{:else if $filterGridsBy === ExperimentalFilterMethods.STORE_CATEGORIES}
  <!-- TODO: need to show a tooltip listing all categories -->
{:else if $filterGridsBy === ExperimentalFilterMethods.STORE_TAGS}
  <!-- TODO: need to show a tooltip listing all tags -->
{:else if $filterGridsBy === ExperimentalFilterMethods.STEAM_REVIEW_SCORE}

{:else if $filterGridsBy === ExperimentalFilterMethods.DECK_COMPAT_CATEGORY}

{:else if $filterGridsBy === ExperimentalFilterMethods.FRAME_COMPAT_CATEGORY}

{:else if $filterGridsBy === ExperimentalFilterMethods.MACHINE_COMPAT_CATEGORY}

{:else if $filterGridsBy === ExperimentalFilterMethods.STEAMOS_COMPAT_CATEGORY}

{:else if $filterGridsBy === ExperimentalFilterMethods.IS_FAMILY_SHARING}
  <DropDown
    options={familySharingOptions}
    width={"12.5rem"}
    {onChange}
    bind:value
  />
{/if}
