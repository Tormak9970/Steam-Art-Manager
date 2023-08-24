<script lang="ts">
  import { gameSearchModalCancel, gameSearchModalDefault, gameSearchModalSelect, showGameSearchModal } from "../../../stores/Modals";
  import { LogController } from "../../../lib/controllers/LogController";
  import { ToastController } from "../../../lib/controllers/ToastController";
  import Button from "../../interactables/Button.svelte";
  import ModalBody from "../modal-utils/ModalBody.svelte";
  import SearchBar from "../../interactables/SearchBar.svelte";
  import type { SGDBGame } from "../../../lib/models/SGDB";
  import { AppController } from "../../../lib/controllers/AppController";
  import { onMount } from "svelte";

  let canApply = false;
  let searchQuery = $gameSearchModalDefault;
  let chosenId = "";
  let chosenName = "";

  let results: SGDBGame[] = [];
  
  function onClose() {
    $showGameSearchModal = false;
    $gameSearchModalCancel();
  }

	async function applyChoice() {
    canApply = false;

    LogController.log(`Applied game choice ${chosenName}`);
    ToastController.showSuccessToast("Choice applied!");

    await $gameSearchModalSelect(chosenName, chosenId);
  }

  function setSelected(entry: SGDBGame): void {
    canApply = true;
    chosenId = entry.id.toString();
    chosenName = entry.name;
  }

  /**
   * Function to run when the query changes.
   * @param query The updated search query.
   */
  async function onQueryChange(query: string): Promise<void> {
    results = await AppController.searchSGDBForGame(query);
  }

  onMount(async () => {
    results = await AppController.searchSGDBForGame(searchQuery);
  });
</script>

<ModalBody title={"Customize Game Name"} onClose={onClose}>
  <div class="content">
    <div class="body">
      <div class="description">
        Search for games in the SGDB database below
      </div>
      <SearchBar label="Game Search" bind:value={searchQuery} onChange={onQueryChange} width="250px" reversed />
      <div class="search-results">
        {#each results as result (result.id)}
          <div>{result.name}</div>
        {/each}
      </div>
    </div>

    <div class="buttons">
      <Button label="Apply Choice" onClick={applyChoice} width="100%" disabled={!canApply} />
    </div>
  </div>
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
    width: calc(100% - 14px);
    padding: 7px;
    
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
  }

  .description {
    font-size: 14px;
    margin-bottom: 7px;
  }

  .search-results {
    width: calc(100% - 10px);
    height: 200px;

    background-color: var(--background-dark);
    border-radius: 4px;

    margin-top: 7px;
    padding: 5px;
  }

  .buttons {
    margin-top: 14px;
    margin-bottom: 7px;
    width: calc(100% - 14px);
    display: flex;
    justify-content: space-around;
    justify-self: flex-end;
  }
</style>
