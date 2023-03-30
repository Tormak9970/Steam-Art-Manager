<script lang="ts">
  import { dialog } from "@tauri-apps/api";
  import { onDestroy, onMount } from "svelte";
  import { Pane } from "svelte-splitpanes";
  import type { Unsubscriber } from "svelte/store";
  import { AppController } from "../../../lib/controllers/AppController";
    import type { SGDBImage } from "../../../lib/models/SGDB";
  import { gridType, GridTypes, isOnline, selectedGameAppId, steamGridDBKey } from "../../../Stores";
  import Button from "../../interactables/Button.svelte";
  import Tab from "../../layout/tabs/Tab.svelte";
  import Tabs from "../../layout/tabs/Tabs.svelte";
  import HorizontalSpacer from "../../spacers/HorizontalSpacer.svelte";
  import VerticalSpacer from "../../spacers/VerticalSpacer.svelte";
  import SectionTitle from "../SectionTitle.svelte";

  let selectedAppIdUnsub: Unsubscriber;
  let onlineUnsub: Unsubscriber;
  let apiKeyUnsub: Unsubscriber;
  let grids: SGDBImage[] = [];

  /**
   * Prompts the user to select their custom game art.
   */
  async function prompUserForArt() {
    const path = await dialog.open({
      title: "Select your game art",
      filters: [
        {
          name: "images",
          extensions: [
            "jpg",
            "png",
            "webp",
            "ico"
          ]
        },
        {
          name: "animated",
          extensions: [
            "gif",
            "webm"
          ]
        }
      ],
      multiple: false
    });
    if (path && path != "") AppController.setCustomArt(path as string);
  }

  onMount(() => {
    selectedAppIdUnsub = selectedGameAppId.subscribe(async (id) => {
      if ($isOnline && $steamGridDBKey != "" && id != null) grids = await AppController.getSteamGridArt(id);
    });
    onlineUnsub = isOnline.subscribe(async (online) => {
      if (online && $steamGridDBKey != "" && $selectedGameAppId != null) grids = await AppController.getSteamGridArt($selectedGameAppId);
    });
    apiKeyUnsub = steamGridDBKey.subscribe(async (key) => {
      if ($isOnline && key != "" && $selectedGameAppId != null) grids = await AppController.getSteamGridArt($selectedGameAppId);
    });
  });

  onDestroy(() => {
    if (selectedAppIdUnsub) selectedAppIdUnsub();
    if (onlineUnsub) onlineUnsub();
    if (apiKeyUnsub) apiKeyUnsub();
  });
</script>

<Pane minSize={20}>
  <SectionTitle title="Grids" />

  <div class="content">
    <div style="margin-left: 6px; display: flex; justify-content: space-between;">
      <HorizontalSpacer />
      <Button label="Upload Your Own Art!" onClick={prompUserForArt} width="auto" disabled={$selectedGameAppId == null} />
    </div>
    
    <div class="border" />
    <VerticalSpacer />
  </div>

  <div class="content" style="height: calc(100% - 85px);">
    {#if $isOnline}
      {#if $selectedGameAppId != null}
        <Tabs tabsId="gridTypes" height="calc(100% - 70px)" bind:selected={$gridType}>
          {#each Object.values(GridTypes) as type}
            <Tab label="{type}" tabsId="gridTypes">
              {type}
            </Tab>
          {/each}
        </Tabs>
      {:else}
        <div class="message">
          Select a game to start managing your art!
        </div>
      {/if}
    {:else}
      <div class="message">
        You're currently offline. In order to go online and access SteamGridDB, try hitting the "Go Online" button below.
      </div>
    {/if}
    
    <VerticalSpacer />
  </div>
</Pane>

<style>
  .content {
    margin: 0px 6px;
    padding: 0px 6px;
    overflow: auto;
    max-height: calc(100% - 65px);
  }

  .border {
    margin-top: 7px;
    border-bottom: 1px solid var(--foreground);
  }

  .message {
    width: 100%;
    text-align: center;
    opacity: 0.1;
    padding-top: 40px;
  }
</style>