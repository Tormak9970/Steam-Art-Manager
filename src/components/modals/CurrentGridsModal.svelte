<script lang="ts">
  import { CurrentGridImage } from "@layout";
  import {
    appLibraryCache,
    manualSteamGames,
    nonSteamGames,
    steamGames,
    unfilteredLibraryCache,
  } from "@stores/AppState";
  import { currentGridsAppid, showCurrentGridsModal } from "@stores/Modals";
  import { convertFileSrc } from "@tauri-apps/api/core";
  import { GridTypes } from "@types";
  import ModalBody from "./modal-utils/ModalBody.svelte";

  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showCurrentGridsModal = false;
    $currentGridsAppid = "";
  }

  let open = $state(true);
  let imageSources = $state({
    Capsule: "",
    "Wide Capsule": "",
    Hero: "",
    Logo: "",
    Icon: "",
  });

  let games = $derived([
    ...$steamGames,
    ...$manualSteamGames,
    ...$nonSteamGames,
  ]);
  let game = $derived(
    games.find((game) => game.appid.toString() === $currentGridsAppid)!,
  );

  $effect(() => {
    for (const gridType of [
      GridTypes.CAPSULE,
      GridTypes.WIDE_CAPSULE,
      GridTypes.HERO,
      GridTypes.LOGO,
      GridTypes.ICON,
    ]) {
      const unfilteredCache =
        $unfilteredLibraryCache[game.appid.toString()]?.[gridType];
      const filteredCache = $appLibraryCache[game.appid.toString()]?.[gridType];

      if (
        $appLibraryCache[game.appid]?.[gridType] === "REMOVE" &&
        unfilteredCache
      ) {
        imageSources[gridType] = convertFileSrc(unfilteredCache);
      } else if (filteredCache) {
        imageSources[gridType] = convertFileSrc(filteredCache);
      }
    }

    imageSources = { ...imageSources };
  });
</script>

<ModalBody
  title={`Current Grids for ${game?.name}`}
  {open}
  onClose={() => {
    open = false;
  }}
  onCloseEnd={onClose}
>
  {#snippet body()}
    <div class="content">
      <div class="other-grids-container">
        <div class="left-col">
          <CurrentGridImage
            gridType={GridTypes.CAPSULE}
            src={imageSources[GridTypes.CAPSULE]}
          />
          <CurrentGridImage
            gridType={GridTypes.ICON}
            src={imageSources[GridTypes.ICON]}
          />
        </div>
        <div class="right-col">
          <CurrentGridImage
            gridType={GridTypes.WIDE_CAPSULE}
            src={imageSources[GridTypes.WIDE_CAPSULE]}
          />
          <CurrentGridImage
            gridType={GridTypes.LOGO}
            src={imageSources[GridTypes.LOGO]}
          />
        </div>
      </div>
      <div class="hero-container">
        <CurrentGridImage
          gridType={GridTypes.HERO}
          src={imageSources[GridTypes.HERO]}
        />
      </div>
    </div>
  {/snippet}
</ModalBody>

<style>
  .content {
    width: 43.75rem;
  }

  .other-grids-container {
    display: flex;
  }
</style>
