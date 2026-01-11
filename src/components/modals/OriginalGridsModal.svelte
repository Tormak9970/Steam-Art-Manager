<script lang="ts">
  import { AppController } from "@controllers";
  import { CurrentGridImage } from "@layout";
  import { currentPlatform, Platforms, selectedGameAppId, selectedSteamGridGameId } from "@stores/AppState";
  import { showOriginalGridsModal } from "@stores/Modals";
  import { GridTypes } from "@types";
  import { onMount } from "svelte";
  import ModalBody from "./modal-utils/ModalBody.svelte";
  
  const STEAM_API_FILES = {
    "Capsule": "library_600x900_2x.jpg",
    "Wide Capsule": "header.jpg",
    "Hero": "library_hero.jpg",
    "Logo": "logo.png",
  }

  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showOriginalGridsModal = false;
  }

  let open = true;
  let imageSources = {
    "Capsule": "",
    "Wide Capsule": "",
    "Hero": "",
    "Logo": "",
  }

  let loading = true
  let failed = false;

  async function load() {
    let appid: string | null = $selectedGameAppId
    // TODO: check if non-steam

    if ($currentPlatform === Platforms.NON_STEAM) {
      appid = await AppController.getAppidForSGDBGame({
        id: parseInt($selectedSteamGridGameId),
        name: "",
        types: [],
        verified: true,
        numResultPages: 0,
      })
    }

    if (!appid) {
      failed = true
      loading = false
      return
    }

    imageSources = {
      "Capsule": `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/${STEAM_API_FILES.Capsule}`,
      "Wide Capsule": `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/${STEAM_API_FILES["Wide Capsule"]}`,
      "Hero": `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/${STEAM_API_FILES.Hero}`,
      "Logo": `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/${STEAM_API_FILES.Logo}`,
    }
    
    loading = false
  }

  onMount(() => {
    load()
  });
</script>

<ModalBody title='Original Grids' open={true} on:close={() => open = false} on:closeEnd={onClose}>
  <div class="content">
    <div class="other-grids-container">
      <div class="left-col">
        <CurrentGridImage gridType={GridTypes.CAPSULE} src={imageSources[GridTypes.CAPSULE]} />
        <!-- <CurrentGridImage gridType={GridTypes.ICON} src={imageSources[GridTypes.ICON]} /> -->
      </div>
      <div class="right-col">
        <CurrentGridImage gridType={GridTypes.WIDE_CAPSULE} src={imageSources[GridTypes.WIDE_CAPSULE]} />
        <CurrentGridImage gridType={GridTypes.LOGO} src={imageSources[GridTypes.LOGO]} />
      </div>
    </div>
    <div class="hero-container">
      <CurrentGridImage gridType={GridTypes.HERO} src={imageSources[GridTypes.HERO]} />
    </div>
  </div>
</ModalBody>

<style>
  .content {
    width: 700px;
  }

  .other-grids-container {
    display: flex;
  }
</style>
