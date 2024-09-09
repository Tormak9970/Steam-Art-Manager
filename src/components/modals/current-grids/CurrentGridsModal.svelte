<script lang="ts">
  import { appLibraryCache, manualSteamGames, nonSteamGames, steamGames, unfilteredLibraryCache } from "@stores/AppState";
  import { currentGridsAppid, showCurrentGridsModal } from "@stores/Modals";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { GridTypes } from "@types";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import CurrentGridImage from "./CurrentGridImage.svelte";

  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showCurrentGridsModal = false;
		$currentGridsAppid = "";
  }

  let imageSources = {
    "Capsule": "",
    "Wide Capsule": "",
    "Hero": "",
    "Logo": "",
    "Icon": ""
  }
  
  $: games = [ ...$steamGames, ...$manualSteamGames, ...$nonSteamGames ];
  $: game = games.find((game) => game.appid.toString() === $currentGridsAppid)!;

  $: {
    for (const gridType of [ GridTypes.CAPSULE, GridTypes.WIDE_CAPSULE, GridTypes.HERO, GridTypes.LOGO, GridTypes.ICON ]) {
      const unfilteredCache = $unfilteredLibraryCache[game.appid.toString()][gridType];
      const filteredCache = $appLibraryCache[game.appid.toString()][gridType];
      
      if ($appLibraryCache[game.appid][gridType] === "REMOVE" && unfilteredCache) {
        imageSources[gridType] = convertFileSrc(unfilteredCache);
      } else if (filteredCache) {
        imageSources[gridType] = convertFileSrc(filteredCache);
      }
    }

    imageSources = { ...imageSources };
  }
</script>

<ModalBody title={`Current Grids for ${game?.name}`} onClose={onClose}>
  <div class="content">
    <div class="other-grids-container">
      <div class="left-col">
        <CurrentGridImage gameTitle={game.name} gridType={GridTypes.CAPSULE} src={imageSources[GridTypes.CAPSULE]} />
        <CurrentGridImage gameTitle={game.name} gridType={GridTypes.ICON} src={imageSources[GridTypes.ICON]} />
      </div>
      <div class="right-col">
        <CurrentGridImage gameTitle={game.name} gridType={GridTypes.WIDE_CAPSULE} src={imageSources[GridTypes.WIDE_CAPSULE]} />
        <CurrentGridImage gameTitle={game.name} gridType={GridTypes.LOGO} src={imageSources[GridTypes.LOGO]} />
      </div>
    </div>
    <div class="hero-container">
      <CurrentGridImage gameTitle={game.name} gridType={GridTypes.HERO} src={imageSources[GridTypes.HERO]} />
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
