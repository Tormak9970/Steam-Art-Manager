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
    import { selectedTab } from "../../Stores";

    export let label:string;

    function select(e:Event) {
        $selectedTab = label;
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="tab" class:selected={$selectedTab == label} on:click={select}>
    <div>{label}</div>
</div>

<style>
    @import "/theme.css";

    .tab {
        display: flex;
        font-size: 12px;
        flex: 1;
        width: calc(100% - 16px);
        min-width: 100px;

        border: 1px solid black;
        background-color: var(--background);
        margin-bottom: 3px;
        padding: 0px 7px;

        cursor: pointer;
    }

    .tab:hover {
        background-color: var(--background-hover);
    }

    .selected {
        border: 1px solid var(--highlight-hover);
    }
</style>