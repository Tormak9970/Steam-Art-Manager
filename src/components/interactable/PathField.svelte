<script lang="ts">
    import { dialog, path } from "@tauri-apps/api";
    import FileButton from "./FileButton.svelte";


    export let fieldName:string;
    export let title:string;
    export let defaultPath:string;
    export let cVal:string;
    export let handler:(e:Event, fieldName:string)=>void;

    const changeEvent = new Event('change');

    let inputElem:HTMLInputElement;

    async function wrapper(e:Event) {
        handler(e, fieldName.toLowerCase());
    }

    async function openDialog(e:Event) {
        if (defaultPath == "documents") {
            defaultPath = await path.documentDir();
        }
        await dialog.open({ directory: true, title: title, multiple: false, defaultPath: defaultPath }).then(async (dir) => {
            if (dir) {
                inputElem.value = dir as string;
                inputElem.dispatchEvent(changeEvent);
            }
        });
    }
</script>

<div class="input">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label style="margin-right: 13px; font-size: 14px">{fieldName}:</label>
    <input style="flex: 1; margin-right: 7px" type="text" placeholder="{cVal}" value="{cVal}" on:change="{wrapper}" bind:this={inputElem}>
    
    <FileButton onClick={openDialog} />
</div>

<!-- svelte-ignore css-unused-selector -->
<style>
	@import "/theme.css";

	.input {
		margin: 0px;

		display: flex;
		flex-direction: row;
		align-items: center;

		color: var(--font-color);

        font-size: 12px;
        width: 100%;
	}
	.input > .field-name { margin-right: 10px; }

    .input > input {
		color: var(--font-color);
        background-color: var(--background);
        border-radius: 1px;
        outline: none;
        border: 1px solid black;
        padding: 3px;
    }
    .input > input:hover {
        background-color: var(--background-hover);
    }
    .input > input:focus {
        outline: 1px solid var(--highlight);
    }
</style>