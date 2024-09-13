<script lang="ts">
  import { AppController, LogController, ToastController } from "@controllers";
  import { scrollShadow } from "@directives";
  import { Button, IconButton, SearchBar } from "@interactables";
  import { selectedGameName } from "@stores/AppState";
  import { gameSearchModalCancel, gameSearchModalDefault, gameSearchModalSelect, showGameSearchModal } from "@stores/Modals";
  import type { SGDBGame } from "@types";
  import { onMount } from "svelte";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import EntryLoadingSkeleton from "./EntryLoadingSkeleton.svelte";
  import GameSearchEntry from "./GameSearchEntry.svelte";

  let open = true;
  let canApply = false;
  let loading = true;
  let requestTimedOut = false;
  let searchQuery = $gameSearchModalDefault;
  let selectedGame: SGDBGame | null = null

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
    ToastController.showSuccessToast("Choice applied!");

    $gameSearchModalSelect(selectedGame!);
    onClose();
  }

  /**
   * Sets the selected game.
   * @param game The game to select.
   */
  function setSelected(game: SGDBGame): void {
    canApply = true;
    selectedGame = game;
  }

  /**
   * Requests a list of results from SGDB.
   * @param query The query to use.
   */
  async function makeRequest(query: string): Promise<void> {
    loading = true;
    requestTimedOut = false;
    const res = await AppController.searchSGDBForGame(query);

    if (res) {
      results = res as SGDBGame[];
    } else {
      requestTimedOut = true;
      results = [];
      ToastController.showWarningToast("Requst Timed Out!");
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
        <IconButton label="Retry" onClick={retryRequest} width="auto" tooltipPosition="auto" disabled={!requestTimedOut}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 12px; width: 12px;">
            <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/>
          </svg>
        </IconButton>
        <!-- <Spacer orientation="HORIZONTAL" /> -->
        <SearchBar label="Game Search" bind:value={searchQuery} onChange={async (query) => await makeRequest(query)} width="250px" reversed />
      </div>
      <div class="container">
        <div class="scroll-container" use:scrollShadow={{ background: "--background" }}>
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

  <span slot="buttons" class="buttons">
    <Button label="Apply Choice" onClick={applyChoice} width="100%" disabled={!canApply} />
  </span>
</ModalBody>

<style>
  .content {
		width: 400px;
		height: calc(100% - 60px);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}

  .body {
    width: 100%;
    margin-top: 7px;
    
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
  }

  .description {
    font-size: 14px;
    margin-bottom: 7px;
  }

  .container {
    width: 100%;

    position: relative;
  }

  .scroll-container {
    width: 100%;
    height: 200px;

    overflow: auto;

    margin-top: 5px;
  }

  .search-container {
    width: 100%;
    display: flex;
    align-items: center;

    gap: 7px;
    margin-bottom: 7px;
  }

  .buttons {
    width: 100%;
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
