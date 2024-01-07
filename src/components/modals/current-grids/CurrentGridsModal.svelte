<script lang="ts">
  import { GridTypes, appLibraryCache, gridType, manualSteamGames, nonSteamGames, steamGames, unfilteredLibraryCache } from "../../../stores/AppState";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import { currentGridsAppid, showCurrentGridsModal } from "../../../stores/Modals";
  import CurrentGridImage from "./CurrentGridImage.svelte";
  import { tauri } from "@tauri-apps/api";

  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showCurrentGridsModal = false;
		$currentGridsAppid = null;
  }

  let imageSources = {
    "Capsule": "",
    "Wide Capsule": "",
    "Hero": "",
    "Logo": "",
    "Icon": ""
  }
  
  $: games = [ ...$steamGames, ...$manualSteamGames, ...$nonSteamGames ];
  $: game = games.find((game) => game.appid === $currentGridsAppid);

  $: {
    for (const gridType of [ "Capsule", "Wide Capsule", "Hero", "Logo", "Icon" ]) {
      if ($appLibraryCache[game.appid][gridType] === "REMOVE") {
        imageSources[gridType] = tauri.convertFileSrc($unfilteredLibraryCache[game.appid][gridType]);
      } else {
        imageSources[gridType] = tauri.convertFileSrc($appLibraryCache[game.appid][gridType]);
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
