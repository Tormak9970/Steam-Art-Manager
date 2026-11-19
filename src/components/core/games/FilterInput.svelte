<script lang="ts">
  import { DropDown, SearchBar } from "@interactables";
  import { filterGridsBy, steamClientFilterData } from "@stores/AppState";
  import { ExperimentalFilterMethods, FilterMethods } from "@types";
  import {
    DECK_COMPAT_CATEGORIES,
    FRAME_COMPAT_CATEGORIES,
    MACHINE_COMPAT_CATEGORIES,
    STEAMOS_COMPAT_CATEGORIES,
  } from "../../../lib/constants/SteamCompatCategories";
  import { STEAM_FEATURES_ID_MAP } from "../../../lib/constants/SteamFeatures";

  type Props = {
    onChange: (value: string) => void;
    value: string;
  };

  let { onChange, value = $bindable() }: Props = $props();

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

  const collectionOptions = $derived([
    {
      label: "Any",
      data: "",
    },
    ...($steamClientFilterData?.collections ?? []).map((collection) => ({
      label: collection.name,
      data: collection.id.toString(),
    })),
  ]);

  const storeCategoryOptions = $derived([
    {
      label: "Any",
      data: "",
    },
    ...Object.entries(STEAM_FEATURES_ID_MAP).map(([id, category]) => ({
      label: category.display_name,
      data: id.toString(),
    })),
  ]);

  const storeTags = $derived([
    {
      label: "Any",
      data: "",
    },
    ...Object.entries($steamClientFilterData?.tags ?? {}).map(([id, name]) => ({
      label: name,
      data: id.toString(),
    })),
  ]);
</script>

<svelte:window on:keydown={overwriteCtrlF} />

{#if $filterGridsBy === FilterMethods.NAME || $filterGridsBy === FilterMethods.APP_ID || $filterGridsBy === ExperimentalFilterMethods.STEAM_REVIEW_SCORE}
  <SearchBar
    label="Search Library"
    {onChange}
    interval={800}
    bind:this={searchComponent}
  />
{:else if $filterGridsBy === ExperimentalFilterMethods.COLLECTIONS}
  <DropDown
    options={collectionOptions}
    width={"10.5rem"}
    {onChange}
    bind:value
  />
{:else if $filterGridsBy === ExperimentalFilterMethods.STORE_CATEGORIES}
  <DropDown
    options={storeCategoryOptions}
    width={"10.5rem"}
    {onChange}
    bind:value
  />
{:else if $filterGridsBy === ExperimentalFilterMethods.STORE_TAGS}
  <DropDown options={storeTags} width={"10.5rem"} {onChange} bind:value />
{:else if $filterGridsBy === ExperimentalFilterMethods.DECK_COMPAT_CATEGORY}
  <DropDown
    options={DECK_COMPAT_CATEGORIES}
    width={"10.5rem"}
    {onChange}
    bind:value
  />
{:else if $filterGridsBy === ExperimentalFilterMethods.FRAME_COMPAT_CATEGORY}
  <DropDown
    options={FRAME_COMPAT_CATEGORIES}
    width={"10.5rem"}
    {onChange}
    bind:value
  />
{:else if $filterGridsBy === ExperimentalFilterMethods.MACHINE_COMPAT_CATEGORY}
  <DropDown
    options={MACHINE_COMPAT_CATEGORIES}
    width={"10.5rem"}
    {onChange}
    bind:value
  />
{:else if $filterGridsBy === ExperimentalFilterMethods.STEAMOS_COMPAT_CATEGORY}
  <DropDown
    options={STEAMOS_COMPAT_CATEGORIES}
    width={"10.5rem"}
    {onChange}
    bind:value
  />
{:else if $filterGridsBy === ExperimentalFilterMethods.IS_FAMILY_SHARING}
  <DropDown
    options={familySharingOptions}
    width={"10.5rem"}
    {onChange}
    bind:value
  />
{/if}
