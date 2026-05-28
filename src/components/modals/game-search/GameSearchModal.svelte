<script lang="ts">
  import { CacheController, LogController } from "@controllers";
  import { isOverflowing, scrollShadow } from "@directives";
  import { Refresh } from "@icons";
  import { Button, IconButton, SearchBar } from "@interactables";
  import { selectedGameName, showErrorSnackbar, showInfoSnackbar } from "@stores/AppState";
  import { gameSearchModalCancel, gameSearchModalDefault, gameSearchModalSelect, showGameSearchModal } from "@stores/Modals";
  import type { SGDBGame } from "@types";
  import { onMount } from "svelte";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import EntryLoadingSkeleton from "./EntryLoadingSkeleton.svelte";
  import GameSearchEntry from "./GameSearchEntry.svelte";

  let open = true;
  let overflowing = false;
  let loading = true;
  let requestTimedOut = false;
  let searchQuery = $gameSearchModalDefault;
  let selectedGame: SGDBGame | null = null;
  $: canApply = selectedGame && $gameSearchModalDefault !== selectedGame.name;

  let results: SGDBGame[] = [];
  
  /**
   * The function to run when the modal closes.
   */
  function onClose(): void {
    $showGameSearchModal = false;
    $gameSearchModalCancel();
  }

  /**
   * Applies the users choice.
   */
	function applyChoice(): void {
    canApply = false;

    LogController.log(`Applied game choice ${selectedGame!.name}`);
    $showInfoSnackbar({ message: "Choice applied!" });

    $gameSearchModalSelect(selectedGame!);
    onClose();
  }

  /**
   * Sets the selected game.
   * @param game The game to select.
   */
  function setSelected(game: SGDBGame): void {
    selectedGame = game;
  }

  /**
   * Requests a list of results from SGDB.
   * @param query The query to use.
   */
  async function makeRequest(query: string): Promise<void> {
    loading = true;
    requestTimedOut = false;
    const res = await CacheController.searchForGame(query);

    if (res) {
      results = res as SGDBGame[];
    } else {
      requestTimedOut = true;
      results = [];
      $showErrorSnackbar({ message: "Requst Timed Out!" });
    }
    
    loading = false;
  }

  /**
   * Retries the last request.
   */
  async function retryRequest(): Promise<void> {
    await makeRequest(searchQuery);
  }

  onMount(async () => await makeRequest(searchQuery));
</script>

<ModalBody title={"Customize Game Name"} open={open} on:close={() => open = false} on:closeEnd={onClose}>
  <div class="content">
    <div class="body">
      <div class="description">
        Search for games in the SGDB database below
      </div>
      <div class="search-container">
        <IconButton label="Retry" on:click={retryRequest} width="auto" tooltipPosition="auto" disabled={!requestTimedOut}>
          <Refresh style="height: 0.875rem; width: 0.875rem;" />
        </IconButton>
        <SearchBar label="Game Search" bind:value={searchQuery} onChange={async (query) => await makeRequest(query)} width="15.75rem" reversed />
      </div>
      <div class="container">
        <div class="scroll-container" use:scrollShadow={{ background: "--background" }} use:isOverflowing={{ callback: (o) => overflowing = o }}>
          <div class="wrapper" style:width={overflowing ? "calc(100% - 0.5rem)" : "100%"}>
            {#if loading}
              {#each new Array(10) as _}
                <EntryLoadingSkeleton />
              {/each}
            {:else if requestTimedOut}
              <div>Request timed out. Check your internet connection or click retry.</div>
            {:else}
              {#each results as sgdbGame (sgdbGame.id)}
                <GameSearchEntry game={sgdbGame} isSelected={selectedGame ? sgdbGame.id === selectedGame.id : sgdbGame.name === $selectedGameName} onSelect={setSelected} />
              {/each}
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>

  <span slot="buttons" class="buttons">
    <Button on:click={applyChoice} width="100%" disabled={!canApply}>Apply Choice</Button>
  </span>
</ModalBody>

<style>
  .content {
		width: 25rem;
		height: calc(100% - 3.75rem);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}

  .body {
    width: 100%;
    margin-top: 0.5rem;
    
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
  }

  .description {
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .container {
    width: 100%;

    position: relative;
  }

  .scroll-container {
    width: 100%;
    height: 12.5rem;

    overflow: auto;

    margin-top: 0.25rem;
  }

  .search-container {
    width: 100%;
    display: flex;
    align-items: center;

    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .buttons {
    width: 100%;
    display: flex;
    justify-content: space-between;
    justify-self: flex-end;
  }
</style>
