<script lang="ts">
  import { AppController, LogController } from "@controllers";
  import { Button } from "@interactables";
  import { appLibraryCache, manualSteamGames, originalAppLibraryCache, showErrorSnackbar, showInfoSnackbar, steamGames } from "@stores/AppState";
  import { showUpdateTilesModal } from "@stores/Modals";
  import type { GameStruct } from "@types";
  import { onMount } from "svelte";
  import ModalBody from "./modal-utils/ModalBody.svelte";
  import GameFilter from "./modal-utils/game-filter/GameFilter.svelte";

  let open = true;
  let appsWithTilesIds: string[];
  let appsWithTiles: Record<string, string>;
  
  let filteredSteamGames: GameStruct[] = [];
  let selectedGameIds: string[] = [];

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
    const appIconEntries = selectedGameIds.map((appid) => [ appid, $appLibraryCache[appid].Icon ]);
    const appIconsMap = Object.fromEntries(appIconEntries);

    const appTilePathEntries = selectedGameIds.map((appid) => [ appid, appsWithTiles[appid] ]);
    const appTilePathsMap = Object.fromEntries(appTilePathEntries);

    const failedIds = await AppController.updateAppTiles(appIconsMap, appTilePathsMap);

    if (failedIds.length > 0) {
      LogController.error(`Failed to update ${failedIds.length} tiles. Ids that failed: ${JSON.stringify(failedIds)}.`);
      $showErrorSnackbar({ message: `Failed to update ${failedIds.length} tiles!` });
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
      }

      // TODO: potentially diff the images to determine if this has been applied before.
      const gameIconChangedFilter = (game: GameStruct) => {
        return $appLibraryCache[game.appid].Icon !== $originalAppLibraryCache[game.appid].Icon;
      }

      filteredSteamGames = [ ...$steamGames, ...$manualSteamGames ].filter(gameIconChangedFilter).filter(tilesFilter);
    });
  });
</script>

<ModalBody title={"Update Start Menu Tiles"} open={open} on:close={() => open = false} on:closeEnd={onClose}>
  <div class="content">
    <div class="description">
      Here you can batch update the game icons shown in your Operating System's start menu to match your custom icons shown in steam.
      <br/>
      <br/>
      Games that show up below are the result of the following filters:
      <br/>
      <ul>
        <li>You already have a Start Menu shortcut for this game.</li>
        <li>You have changed the icon for this game.</li>
      </ul>
    </div>
    <div class="view">
      <GameFilter steamGames={filteredSteamGames} bind:selectedGameIds={selectedGameIds} showPlatforms={false} showFilters={false} noGamesMessage={"No games with tiles/new icons were found."}/>
    </div>
  </div>
  <span slot="buttons" class="buttons">
    <Button on:click={onClose} width="48.5%">Cancel</Button>
    <Button on:click={updateGameTiles} width="48.5%" disabled={selectedGameIds.length === 0}>Update</Button>
  </span>
</ModalBody>

<style>
  .content {
    width: 600px;
		height: calc(100% - 60px);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;

    gap: 7px;
	}

  .description {
    width: 100%;
    font-size: 14px;
    margin-top: 7px;
  }

  .description ul {
    margin: 0px;
    padding-left: 20px;
    font-size: 13px;
  }

  .description li {
    margin-top: 4px;
  }

  .view {
    width: 100%;
  }

  .buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
    gap: 10px;
  }
</style>
