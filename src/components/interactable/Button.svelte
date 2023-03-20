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
    export let text: string;
    export let width = "40px";
    export let onClick: (e: MouseEvent) => void;
    export let disabled = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<button class="button" class:disabled={disabled} style="width: {width};" on:click={onClick}>
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
