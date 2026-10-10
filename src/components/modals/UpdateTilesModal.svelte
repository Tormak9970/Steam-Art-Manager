<script lang="ts">
  import { AppController, LogController } from "@controllers";
  import { Button } from "@interactables";
  import {
    appLibraryCache,
    manualSteamGames,
    originalAppLibraryCache,
    showErrorSnackbar,
    showInfoSnackbar,
    steamGames,
  } from "@stores/AppState";
  import { showUpdateTilesModal } from "@stores/Modals";
  import type { GameStruct } from "@types";
  import { onMount } from "svelte";
  import ModalBody from "./modal-utils/ModalBody.svelte";
  import GameFilter from "./modal-utils/game-filter/GameFilter.svelte";

  let open = $state(true);
  let appsWithTilesIds: string[] = $state([]);
  let appsWithTiles: Record<string, string> = $state({});

  let filteredSteamGames: GameStruct[] = $state([]);
  let selectedGameIds: string[] = $state([]);

  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showUpdateTilesModal = false;
  }

  /**
   * Updates the tile for the chosen games
   */
  async function updateGameTiles(): Promise<void> {
    const appIconEntries = selectedGameIds.map((appid) => [
      appid,
      $appLibraryCache[appid].Icon,
    ]);
    const appIconsMap = Object.fromEntries(appIconEntries);

    const appTilePathEntries = selectedGameIds.map((appid) => [
      appid,
      appsWithTiles[appid],
    ]);
    const appTilePathsMap = Object.fromEntries(appTilePathEntries);

    const failedIds = await AppController.updateAppTiles(
      appIconsMap,
      appTilePathsMap,
    );

    if (failedIds.length > 0) {
      LogController.error(
        `Failed to update ${failedIds.length} tiles. Ids that failed: ${JSON.stringify(failedIds)}.`,
      );
      $showErrorSnackbar({
        message: `Failed to update ${failedIds.length} tiles!`,
      });
    } else {
      LogController.log(`Updated ${selectedGameIds.length} tiles.`);
      $showInfoSnackbar({ message: `Updated ${selectedGameIds.length} tiles` });
      onClose();
    }
  }

  onMount(() => {
    AppController.getAppTiles().then((appTiles) => {
      appsWithTilesIds = Object.keys(appTiles);
      appsWithTiles = appTiles;

      const tilesFilter = (game: GameStruct) => {
        return appsWithTilesIds.includes(game.appid.toString());
      };

      // TODO: potentially diff the images to determine if this has been applied before.
      const gameIconChangedFilter = (game: GameStruct) => {
        return (
          $appLibraryCache[game.appid].Icon !==
          $originalAppLibraryCache[game.appid].Icon
        );
      };

      filteredSteamGames = [...$steamGames, ...$manualSteamGames]
        .filter(gameIconChangedFilter)
        .filter(tilesFilter);
    });
  });
</script>

<ModalBody
  title={"Update Start Menu Tiles"}
  {open}
  onClose={() => {
    open = false;
  }}
  onCloseEnd={onClose}
>
  {#snippet body()}
    <div class="content">
      <div class="description">
        Here you can batch update the game icons shown in your Operating
        System's start menu to match your custom icons shown in steam.
        <br />
        <br />
        Games that show up below are the result of the following filters:
        <br />
        <ul>
          <li>You already have a Start Menu shortcut for this game.</li>
          <li>You have changed the icon for this game.</li>
        </ul>
      </div>
      <div class="view">
        <GameFilter
          steamGames={filteredSteamGames}
          bind:selectedGameIds
          showPlatforms={false}
          showFilters={false}
          noGamesMessage={"No games with tiles/new icons were found."}
        />
      </div>
    </div>
  {/snippet}
  {#snippet controls()}
    <Button label="Cancel" onClick={onClose} width="48.5%" />
    <Button
      label="Update"
      onClick={updateGameTiles}
      width="48.5%"
      disabled={selectedGameIds.length === 0}
    />
  {/snippet}
</ModalBody>

<style>
  .content {
    width: 37.5rem;
    height: calc(100% - 3.75rem);

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;

    gap: 0.5rem;
  }

  .description {
    width: 100%;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .description ul {
    margin: 0rem;
    padding-left: 1.25rem;
    font-size: 0.875rem;
  }

  .description li {
    margin-top: 0.25rem;
  }

  .view {
    width: 100%;
  }
</style>
