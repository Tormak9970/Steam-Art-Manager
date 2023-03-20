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
    import { afterUpdate } from "svelte";


    export let progress:string = "0%";
    export let timeToReset:number = 2000;
    export let width:string = "200px";

    $: isFinished = Math.abs(parseInt(progress.substring(0, progress.length - 1)) - 100) <= 0.05;

    afterUpdate(() => {
        if (isFinished) {
            setTimeout(() => {
                progress = "0%";
            }, timeToReset);
        }
    });
</script>

<div class="prog-bar" style="width: {width};">
    <div class="prog-bar-ind" style="width: {progress};" class:finished={isFinished} />
</div>

<style>
    @import "/theme.css";

    .prog-bar {
        position: relative;
        height: 20px;
        background-color: var(--background);
        border: 1px solid #000;
    }

    .prog-bar-ind {
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        background-color: var(--highlight);
    }

    .finished {
        background-color: var(--success);
    }
</style>