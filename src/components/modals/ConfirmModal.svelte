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
    import Button from "../interactable/Button.svelte";
    import Pane from "../layout/Pane.svelte";

    export let message:string;
    export let show:boolean = false;
    export let width:string = "auto";
    export let onConfirm:()=>Promise<void>;
    export let onCancel:()=>Promise<void> = async () => {};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="background" class:show={show} on:click={onCancel}>
    <div class="confirm-modal" style="width: {width};">
        <Pane width={"calc(100% - 34px)"}>
            <div class="message">
                {message}
            </div>
            <div class="buttons">
                <Button text={"Cancel"} onClick={onCancel} width={"60px"} />
                <Button text={"Confirm"} onClick={onConfirm} width={"60px"} />
            </div>
        </Pane>
    </div>
</div>

<style>
    @import "/theme.css";

    .background {
        z-index: 2;
        top: 30px;
        position: absolute;
        background-color: rgba(0, 0, 0, 0.6);
        width: 100%;
        height: 100%;
        display: none;
    }

    .show {
        display: flex;
    }

    .confirm-modal {
        margin: auto;
    }

    .message {
        text-align: center;
    }

    .buttons {
        margin-top: 14px;
        width: 100%;
        display: flex;
        justify-content: space-around;
    }
</style>