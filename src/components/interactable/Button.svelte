<script lang="ts">
    export let text: string;
    export let width = "40px";
    export let height = "auto";
    export let onClick: (e: MouseEvent) => void;
    export let disabled = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<button class="button" class:disabled={disabled} style="width: {width}; height: {height};" on:click={onClick}>
    <div>{text}</div>
</button>

<style>
    @import "/theme.css";

    .button {
        padding: 3px 6px;
        min-width: 40px;
        
        background-color: var(--background);
        border: 1px solid #000;
        border-radius: 1px;

        display: flex;
        align-items: center;
        justify-content: center;

        font-size: 12px;
        cursor: pointer;

        color: rgb(231, 231, 231);
    }

    .button:hover {
        background-color: var(--background-hover);
    }

    .button:focus {
        border: 1px solid var(--highlight);
    }

    .disabled {
        pointer-events: none;
        opacity: 0.7;
    }
</style>
