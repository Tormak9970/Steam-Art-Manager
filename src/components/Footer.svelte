<script lang="ts">
  import Button from "./interactable/Button.svelte";
  
  function emptyCache(e: Event) {
    
  }

  function importGrids(e: Event) {
    
  }

  function exportGrids(e: Event) {
    
  }

  function addSteamGridKey(e: Event) {

  }
</script>

<div class="footer">
  <div class="info">
    <div style="margin-left: 8px; text-align: center;">© Travis Lane {new Date().getFullYear()}</div>
  </div>
  <div class="btns">
    <Button text="Empty Cache" onClick={emptyCache} width="auto" height="20px" />
    <div style="height: 100%; width: 7px;" />
    <Button text="Import" onClick={importGrids} width="auto" height="20px" />
    <div style="height: 100%; width: 7px;" />
    <Button text="Export" onClick={exportGrids} width="auto" height="20px" />
    <div style="height: 100%; width: 7px;" />
    <Button text="Add SteamGrid Key" onClick={addSteamGridKey} width="auto" height="20px" />
  </div>
</div>

<style>
  @import "/theme.css";

  .footer {
    height: 30px;
    width: 100%;

    background: var(--hover);
    user-select: none;
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
  }
  .info {
    display: flex;
    align-items: center;
    font-size: 10px;
    opacity: 0.2;
    margin-bottom: 3px;
  }
  .btns {
    height: 22px;
    display: flex;
    padding-right: 7px;
  }
</style>
