<script lang="ts">
  import { AppController } from "@controllers";
  import { Info } from "@icons";
  import { DropDown, Toggle } from "@interactables";
  import { Table } from "@layout";
  import {
    Platforms,
    appLibraryCache,
    appTypes,
    gridType,
    hiddenGameIds,
  } from "@stores/AppState";
  import type { GameStruct } from "@types";
  import { onMount } from "svelte";
  import SelectedGameEntry from "./SelectedGameEntry.svelte";

  type Props = {
    selectedGameIds: string[];
    showFilters?: boolean;
    showPlatforms?: boolean;
    steamGames: GameStruct[];
    nonSteamGames?: GameStruct[];
    selectedPlatform?: string;
    selectedGamesFilter?: string;
    noGamesMessage?: string;
  };

  let {
    selectedGameIds = $bindable(),
    showFilters = true,
    showPlatforms = true,
    steamGames,
    nonSteamGames = [],
    selectedPlatform = "All",
    selectedGamesFilter = "All",
    noGamesMessage = "No games matched the selected filters.",
  }: Props = $props();

  let allGames = $derived([...steamGames, ...nonSteamGames]);

  let platforms: { label: string; data: string }[] = Object.values(
    Platforms,
  ).map((platform) => {
    return {
      label: platform,
      data: platform,
    };
  });
  platforms.unshift({
    label: "All",
    data: "All",
  });

  let gameFilters = [
    { label: "All", data: "All" },
    { label: "Missing", data: "Missing" },
  ];

  let gamesToFilter: GameStruct[] = $state([]);
  let selectedGames: Record<string, boolean> = $state({});
  let includeHidden = $state(false);
  let installedOnly = $state(false);

  /**
   * Function to run when any state changes.
   * @param platform The chosen platform.
   * @param gameFilter The type of filtering to use.
   * @param showHidden Whether to include hidden games or not.
   * @param installedOnly Whether to only include installed apps.
   */
  function onStateChange(
    platform: string,
    gameFilter: string,
    showHidden: boolean,
    installedOnly: boolean,
  ): void {
    gamesToFilter = (
      platform === "All"
        ? allGames
        : platform === Platforms.STEAM
          ? steamGames
          : nonSteamGames
    ).filter((game) => {
      return (
        (showHidden || !$hiddenGameIds.includes(game.appid)) &&
        (!installedOnly || game.installed) &&
        $appTypes.includes(game.type.toLowerCase())
      );
    });
    const selectedGameEntries = gamesToFilter.map((game) => {
      return [
        game.appid,
        gameFilter === "All"
          ? true
          : !$appLibraryCache[game.appid]?.[$gridType],
      ];
    });

    selectedGames = Object.fromEntries(selectedGameEntries);

    selectedGameIds = Object.keys(selectedGames).filter(
      (appid) => !!selectedGames[appid],
    );
  }

  /**
   * Function to run on entry change.
   * @param appid The appid of the changed entry.
   * @param isChecked Whether or not it is checked.
   */
  function onEntryChange(appid: number, isChecked: boolean): void {
    selectedGames[appid] = isChecked;
    selectedGameIds = Object.keys(selectedGames).filter(
      (appid) => !!selectedGames[appid],
    );
  }

  onMount(() => {
    onStateChange(
      selectedPlatform,
      selectedGamesFilter,
      includeHidden,
      installedOnly,
    );
  });
</script>

<div class="game-filter">
  <div class="options">
    <div class="dropdowns">
      {#if showPlatforms}
        <DropDown
          label="Platforms"
          options={platforms}
          bind:value={selectedPlatform}
          width="6.25rem"
          onChange={(platform) => {
            onStateChange(
              platform,
              selectedGamesFilter,
              includeHidden,
              installedOnly,
            );
          }}
          showTooltip={false}
        />
      {/if}
      {#if showFilters}
        <DropDown
          label="Filters"
          options={gameFilters}
          bind:value={selectedGamesFilter}
          width="6.25rem"
          onChange={(gamesFilter) => {
            onStateChange(
              selectedPlatform,
              gamesFilter,
              includeHidden,
              installedOnly,
            );
          }}
          showTooltip={false}
        />
      {/if}
    </div>
    <div class="dropdowns">
      <div class="toggles">
        <Toggle
          label="Include Hidden"
          bind:value={includeHidden}
          onChange={(value) => {
            onStateChange(
              selectedPlatform,
              selectedGamesFilter,
              value,
              installedOnly,
            );
          }}
        />
        <Toggle
          label="Installed Only"
          bind:value={installedOnly}
          onChange={(value) => {
            onStateChange(
              selectedPlatform,
              selectedGamesFilter,
              includeHidden,
              value,
            );
          }}
        />
      </div>
    </div>
  </div>
  <Table>
    {#snippet header()}
      <div
        class="batch-icon"
        use:AppController.tippy={{
          content: "Checked games will be included",
          placement: "left",
          onShow: AppController.onTippyShow,
        }}
      >
        <Info style="height: 0.75rem; width: 0.75rem;" />
      </div>
      <div>Name</div>
      <div style="margin-left: auto; margin-right: 3.5rem;">Platform</div>
    {/snippet}
    {#snippet data()}
      <span class="entries">
        {#each gamesToFilter as game, i (`${game.appid}|${i}`)}
          <SelectedGameEntry
            {game}
            platform={selectedPlatform !== "All"
              ? selectedPlatform
              : steamGames.some((steamGame) => steamGame.appid === game.appid)
                ? Platforms.STEAM
                : Platforms.NON_STEAM}
            isChecked={!!selectedGames[game.appid]}
            onChange={onEntryChange}
          />
        {:else}
          <div>{noGamesMessage}</div>
        {/each}
      </span>
    {/snippet}
  </Table>
</div>

<style>
  .batch-icon {
    fill: var(--font-color);
    margin-left: 0.625rem;
    margin-right: 0.75rem;

    cursor: pointer;
  }

  .dropdowns {
    width: 98%;

    display: flex;
    gap: 1rem;
  }

  .options {
    margin-top: 0.5rem;

    width: 100%;

    display: flex;
    flex-direction: column;

    gap: 0.5rem;
  }

  .entries {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toggles {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
