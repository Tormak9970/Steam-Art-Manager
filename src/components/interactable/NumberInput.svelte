<script lang="ts">
    export let fieldName:string;
    export let cVal:number;
    export let handler:(e:Event, fieldName:string)=>void;

    let value = "";

    async function wrapper(e:Event) {
        handler(e, fieldName.toLowerCase());
    }

    function isNumber(value:any) { return !isNaN(value); }

    function handleInput(e:Event) {
        let oldValue = value;
        let newValue = (e.target as HTMLInputElement).value;

        if (isNumber(newValue)) {
            value = newValue;
        } else {
            (e.target as HTMLInputElement).value = oldValue;
        }
    }
</script>

<div class="input">
    <input type="text" placeholder="{cVal.toString()}" value="{cVal}" on:change="{wrapper}" on:input={handleInput}>
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
        max-width: 140px;
    }
    .input > input:hover {
        background-color: var(--background-hover);
    }
    .input > input:focus {
        outline: 1px solid var(--highlight);
    }
</style>