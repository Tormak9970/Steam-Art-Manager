<!--
 Rogue Legacy Save Editor is a tool for viewing and modifying game saves from Rogue Legacy 1 & 2.
 Copyright (C) 2023 Travis Lane (Tormak)
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program. If not, see <https://www.gnu.org/licenses/>
 -->
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