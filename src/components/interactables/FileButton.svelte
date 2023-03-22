<script lang="ts">
  export let onClick: (e: MouseEvent) => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<button class="button" on:click={onClick}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="height: 14px;">
    <!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
    <path fill="white" d="M120 256c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm160 0c0 30.9-25.1 56-56 56s-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56zm104 56c-30.9 0-56-25.1-56-56s25.1-56 56-56s56 25.1 56 56s-25.1 56-56 56z"/>
  </svg>
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
  }

  .button:hover {
    background-color: var(--background-hover);
  }

  .button:focus {
    border: 1px solid var(--highlight);
  }
</style>
