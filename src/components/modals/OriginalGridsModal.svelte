<script lang="ts">
  import { AppController } from "@controllers";
  import { Plus } from "@icons";
  import { CurrentGridImage } from "@layout";
  import { currentPlatform, Platforms, selectedGameAppId, selectedSteamGridGameId, showInfoSnackbar } from "@stores/AppState";
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

  let loadingType = ""
  let failed = false

  async function setOriginalAsset(type: keyof typeof imageSources) {
    loadingType = type;
    
    AppController.cacheOriginalAsset($selectedGameAppId, imageSources[type], type).then((localPath) => {
      if (localPath !== "") {
        AppController.setCustomArt(localPath);
        $showInfoSnackbar({ message: "Asset applied!" });
        loadingType= "";
      }
    });
  }

  async function load() {
    let appid: string | null = $selectedGameAppId

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
      return
    }

    imageSources = {
      "Capsule": `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/${STEAM_API_FILES.Capsule}`,
      "Wide Capsule": `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/${STEAM_API_FILES["Wide Capsule"]}`,
      "Hero": `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/${STEAM_API_FILES.Hero}`,
      "Logo": `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/${STEAM_API_FILES.Logo}`,
    }
  }

  onMount(() => {
    load()
  });
</script>

<ModalBody title='Original Steam Assets' open={true} on:close={() => open = false} on:closeEnd={onClose}>
  <div class="content">
    <div class="other-grids-container">
      <div class="left-col">
        <div class="set-container">
          <CurrentGridImage gridType={GridTypes.CAPSULE} src={imageSources[GridTypes.CAPSULE]} selected={loadingType === GridTypes.CAPSULE} />
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="image-control" on:click|stopPropagation={() => setOriginalAsset(GridTypes.CAPSULE)} use:AppController.tippy={{ content: "Apply", placement: "right", onShow: AppController.onTippyShow }}>
            <Plus style="width: 1.125rem; height: 1.125rem" />
          </div>
        </div>
        <!-- <CurrentGridImage gridType={GridTypes.ICON} src={imageSources[GridTypes.ICON]} /> -->
      </div>
      <div class="right-col">
        <div class="set-container">
          <CurrentGridImage gridType={GridTypes.WIDE_CAPSULE} src={imageSources[GridTypes.WIDE_CAPSULE]} selected={loadingType === GridTypes.WIDE_CAPSULE} />
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="image-control" on:click|stopPropagation={() => setOriginalAsset(GridTypes.WIDE_CAPSULE)} use:AppController.tippy={{ content: "Apply", placement: "right", onShow: AppController.onTippyShow }}>
            <Plus style="width: 1.125rem; height: 1.125rem" />
          </div>
        </div>
        <div class="set-container">
          <CurrentGridImage gridType={GridTypes.LOGO} src={imageSources[GridTypes.LOGO]} selected={loadingType === GridTypes.LOGO} />
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="image-control" on:click|stopPropagation={() => setOriginalAsset(GridTypes.LOGO)} use:AppController.tippy={{ content: "Apply", placement: "right", onShow: AppController.onTippyShow }}>
            <Plus style="width: 1.125rem; height: 1.125rem" />
          </div>
        </div>
      </div>
    </div>
    <div class="hero-container">
      <div class="set-container">
        <CurrentGridImage gridType={GridTypes.HERO} src={imageSources[GridTypes.HERO]} selected={loadingType === GridTypes.HERO} />
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div class="image-control" on:click|stopPropagation={() => setOriginalAsset(GridTypes.HERO)} use:AppController.tippy={{ content: "Apply", placement: "right", onShow: AppController.onTippyShow }}>
            <Plus style="width: 1.125rem; height: 1.125rem" />
          </div>
      </div>
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

  .set-container {
    position: relative;
  }
  
  .image-control {
    border-radius: 6px;

    height: 1.25rem;
    width: 1.25rem;

    padding: 5px;

    display: flex;
    align-items: center;
    justify-content: center;

    fill: var(--font-color);

    background-color: var(--background);

    opacity: 0.8;

    position: absolute;
    right: 14px;
    bottom: 6px;
  }
  .image-control:hover {
    cursor: pointer;
    opacity: 1;
  }
</style>
