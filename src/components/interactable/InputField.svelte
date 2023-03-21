<script lang="ts">
    export let fieldName:string;
    export let cVal:string;
    export let width:number = 140;
    export let handler:(e:Event, fieldName:string)=>void;

    async function wrapper(e:Event) {
        handler(e, fieldName.toLowerCase());
    }
</script>

<div class="input">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label style="margin-right: 13px; font-size: 14px">{fieldName}:</label>
    <input style="width: {width}px;" type="text" placeholder="{cVal}" value="{cVal}" on:change="{wrapper}">
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