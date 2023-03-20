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
    // svelte-ignore unused-export-let
    export let title:string = "";
    export let width:string = "100%";
    export let height:string = "auto";
    export let padding:string = "14px 9px";
    export let margin:string = "7px";
    export let fillParent:boolean = false;
</script>

<div class="pane" style="width: {width}; height: {height}; margin: {margin}; padding: {padding};{fillParent ? " flex: 1;" : ""}">
    <div class="title-cont">
        <!-- <div class="title">{title}</div> -->
        <div class="border-blocker" />
    </div>
    <slot />
</div>

<style>
    @import "/theme.css";

    .pane {
        border: 1px solid #000;
        box-shadow: 0 0 4px rgb(0 0 0 / 50%);

        position: relative;

        background-color: var(--foreground);
    }

    .pane > .title-cont {
        position: absolute;
        top: -12px;
        left: 7px;
        font-size: 13px;
    }

    /* .title { z-index: 1; } */

    .pane .border-blocker {
        z-index: -1;
        position: absolute;
        top: calc(50% - 1px);
        left: 0px;
        font-size: 13px;

        height: 2px;
        width: 100%;
        background-color: var(--foreground);
    }
</style>