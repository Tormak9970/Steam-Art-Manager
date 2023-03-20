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
    export let checked:boolean;
    function check() {
        checked = !checked;
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="check-box-container" on:click={check}>
    <input type="checkbox" name="" id="" bind:checked={checked}>
    <span class="check-box">
        {#if checked}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                <path fill="#d87e08" d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
            </svg>
        {/if}
    </span>
</div>

<style>
    @import "/theme.css";

    .check-box-container {
        margin-left: 7px;
        display: block;
        position: relative;
        cursor: pointer;

        height: 16px;
        width: 16px;

        border: 1px solid #000;
    }

    .check-box-container input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
    }

    .check-box {
        height: 100%;
        width: 100%;
        background-color: var(--foreground);
        border-radius: 2px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .check-box-container:hover input ~ .check-box {
        background-color: var(--hover);
    }
</style>
