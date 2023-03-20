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
    import { onMount } from "svelte";
    import { throttle } from "../../lib/utils/Utils";
    import { tabs } from "../../Stores";
    import JsonEditor from "../JsonEditor.svelte";
    import Tab from "./Tab.svelte";

    let tabsElem:HTMLDivElement;
    let tabsContElem:HTMLDivElement;
    let contContElem:HTMLDivElement;

    let oldHeight = null;

    function hardSetResize() {
        let windowHeight = window.innerHeight;
        let heightToSet = windowHeight - 30 - 5 - (85 + 14) - (14 + 2 + 28) - (40 + 14)
        if (oldHeight) {
            if (oldHeight > windowHeight) {
                heightToSet -= (oldHeight - windowHeight);
            }
        }

        tabsContElem.style.height = `${heightToSet}px`;
        contContElem.style.height = `${heightToSet}px`;

        oldHeight = windowHeight;
    }

    onMount(() => {
        hardSetResize();
    });
</script>

<svelte:window on:resize={throttle(hardSetResize, 50)} />

<div class="tabs" bind:this={tabsElem}>
    <div class="tabs-cont" bind:this={tabsContElem}>
        <div class="scroller">
            {#each Object.entries($tabs) as tab}
                <Tab label={tab[0]} />
            {/each}
        </div>
    </div>
    <div class="cont-cont" bind:this={contContElem}>
        <JsonEditor />
    </div>
</div>

<style>
    @import "/theme.css";

    .tabs {
        height: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: row;
    }

    .tabs-cont {
        overflow: scroll;
        margin-right: 7px;
    }

    .cont-cont {
        background-color: var(--background);
        flex: 1;
    }
</style>