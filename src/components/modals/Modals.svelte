<script lang="ts">
  import { showBatchApplyModal, showBatchApplyProgress, showCleanConflictDialog, showCleanGridsModal, showCurrentGridsModal, showDialogModal, showGameSearchModal, showGridModal, showInfoModal, showLogoPositionModal, showManualGamesModal, showSettingsModal, showSteamPathModal, showUpdateModal, showUpdateTilesModal } from "@stores/Modals";
  import BatchApplyModal from "./batch-apply/BatchApplyModal.svelte";
  import BatchApplyProgressModal from "./batch-apply/BatchApplyProgressModal.svelte";
  import CleanConflictDialog from "./clean-grids/CleanConflictDialog.svelte";
  import CleanGridsModal from "./clean-grids/CleanGridsModal.svelte";
  import CurrentGridsModal from "./current-grids/CurrentGridsModal.svelte";
  import DialogModal from "./DialogModal.svelte";
  import GameSearchModal from "./game-search/GameSearchModal.svelte";
  import GridPreviewModal from "./GridPreviewModal.svelte";
  import InfoModal from "./info-modal/InfoModal.svelte";
  import LogoPositionModal from "./LogoPositionModal.svelte";
  import ManualGamesModal from "./manual-games/ManualGamesModal.svelte";
  import SettingsModal from "./settings/SettingsModal.svelte";
  import SteamPathModal from "./SteamPathModal.svelte";
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
  {#if $showLogoPositionModal}
    <LogoPositionModal />
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
{/if}