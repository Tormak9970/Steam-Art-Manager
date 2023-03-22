<script lang="ts">
	import { SvelteToast } from "@zerodevx/svelte-toast";
	import { onMount } from "svelte";
	import Titlebar from "./components/Titlebar.svelte";
	import { RustInterop } from "./lib/controllers/RustInterop";
	import { Pane, Splitpanes } from 'svelte-splitpanes';
	import Footer from "./components/Footer.svelte";
    import Filters from "./components/core/filters/Filters.svelte";
    import Games from "./components/core/games/Games.svelte";
    import Grids from "./components/core/grids/Grids.svelte";

	onMount(async () => {
		await RustInterop.getActiveUser();
		await RustInterop.getSteamGames();
	});
</script>

<div class="wrap">
	<SvelteToast target="top" options={{ initial: 0, intro: { y: -64 } }} />
</div>
<main>
	<Titlebar title="Steam Art Manager" />
	<div class="content">
		<Splitpanes>
			<Filters />
			
			<Games />
			
			<Grids />
		</Splitpanes>
	</div>
	<Footer />
</main>
<SvelteToast />

<style>
	@import "/theme.css";

	main {
		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;

		color: var(--font-color);
	}

	.wrap {
		--toastContainerTop: 0.5rem;
		--toastContainerRight: 0.5rem;
		--toastContainerBottom: auto;
		--toastContainerLeft: 0.5rem;
		--toastWidth: 100%;
		--toastMinHeight: 100px;
		--toastPadding: 0 0.5rem;
		font-size: 0.875rem;
	}
	@media (min-width: 40rem) {
		.wrap {
			--toastContainerRight: auto;
			--toastContainerLeft: calc(50vw - 20rem);
			--toastWidth: 40rem;
		}
	}

	.content {
		width: 100%;
		height: calc(100% - 60px);

		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
	}
</style>