<script lang="ts">
  import { showErrorSnackbar, showInfoSnackbar } from "@stores/AppState";
  import { showBatchApplyModal, showBatchApplyProgress, showCleanConflictDialog, showCleanGridsModal, showCurrentGridsModal, showDialogModal, showGameSearchModal, showGridModal, showInfoModal, showManualGamesModal, showProgressModal, showSettingsModal, showSteamPathModal, showToolsModal, showUpdateModal, showUpdateTilesModal } from "@stores/Modals";
  import ErrorSnackbar from "../snackbars/ErrorSnackbar.svelte";
  import InfoSnackbar from "../snackbars/InfoSnackbar.svelte";
  import BatchApplyModal from "./batch-apply/BatchApplyModal.svelte";
  import BatchApplyProgressModal from "./batch-apply/BatchApplyProgressModal.svelte";
  import CleanConflictDialog from "./clean-grids/CleanConflictDialog.svelte";
  import CleanGridsModal from "./clean-grids/CleanGridsModal.svelte";
  import CurrentGridsModal from "./current-grids/CurrentGridsModal.svelte";
  import DialogModal from "./DialogModal.svelte";
  import GameSearchModal from "./game-search/GameSearchModal.svelte";
  import GridPreviewModal from "./GridPreviewModal.svelte";
  import InfoModal from "./info-modal/InfoModal.svelte";
  import ManualGamesModal from "./manual-games/ManualGamesModal.svelte";
  import ProgressModal from "./ProgressModal.svelte";
  import SettingsModal from "./settings/SettingsModal.svelte";
  import SteamPathModal from "./SteamPathModal.svelte";
  import ToolsModal from "./ToolsModal.svelte";
  import UpdateModal from "./updates/UpdateModal.svelte";
  import UpdateTilesModal from "./UpdateTilesModal.svelte";
</script>


{#if $showUpdateModal}
  <UpdateModal />
{/if}
{#if !$showUpdateModal}
  {#if $showDialogModal}
    <DialogModal />
  {/if}
  {#if $showProgressModal}
    <ProgressModal />
  {/if}
  {#if $showSteamPathModal}
    <SteamPathModal />
  {/if}
  {#if $showGameSearchModal}
    <GameSearchModal />
  {/if}
  {#if $showGridModal}
    <GridPreviewModal />
  {/if}
  {#if $showBatchApplyProgress}
    <BatchApplyProgressModal />
  {/if}
  {#if $showBatchApplyModal}
    <BatchApplyModal />
  {/if}
  {#if $showManualGamesModal}
    <ManualGamesModal />
  {/if}
  {#if $showCleanGridsModal}
    <CleanGridsModal />
  {/if}
  {#if $showSettingsModal}
    <SettingsModal />
  {/if}
  {#if $showCleanConflictDialog}
    <CleanConflictDialog />
  {/if}
  {#if $showInfoModal}
    <InfoModal />
  {/if}
  {#if $showCurrentGridsModal}
    <CurrentGridsModal />
  {/if}
  {#if $showUpdateTilesModal}
    <UpdateTilesModal />
  {/if}
  {#if $showToolsModal}
    <ToolsModal />
  {/if}
{/if}
<ErrorSnackbar bind:show={$showErrorSnackbar} />
<InfoSnackbar bind:show={$showInfoSnackbar} />