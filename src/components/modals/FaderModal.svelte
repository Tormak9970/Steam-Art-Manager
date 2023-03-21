<script lang="ts">
    export let show:boolean = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="background" class:show={show}>
    <div class="confirm-modal">
    </div>
</div>

<style>
    @import "/theme.css";

    .background {
        font-size: 12px;
        z-index: 2;
        top: 30px;
        position: absolute;
        background-color: rgba(0, 0, 0, 0.6);
        width: 100%;
        height: 100%;
        display: none;
        pointer-events: none;
    }

    .show {
        display: flex;
    }

    .confirm-modal {
        width: 450px;
        margin: auto;
    }
</style>