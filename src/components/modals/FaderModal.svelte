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
    export let show:boolean = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="background" class:show={show}>
    <div class="confirm-modal">
    </div>
</div>

<style>
    @import "/theme.css";

    .background {
        font-size: 12px;
        z-index: 2;
        top: 30px;
        position: absolute;
        background-color: rgba(0, 0, 0, 0.6);
        width: 100%;
        height: 100%;
        display: none;
        pointer-events: none;
    }

    .show {
        display: flex;
    }

    .confirm-modal {
        width: 450px;
        margin: auto;
    }
</style>