<script lang="ts">
	import { onMount, tick } from "svelte";
    import { currentPlatform } from "../../../../stores/AppState";

	// props
	export let items: any[];
	export let height = "100%";
	export let itemHeight: number;
  export let itemWidth: number;
  export let columnGap: number;
  export let rowGap: number;

  export let keyFunction = (entry: any) => entry.index;

	// read-only, but visible to consumers via bind:start
	export let start = 0;
	export let end = 0;

  // local state
  let heightMap = [];
  let entries: HTMLCollectionOf<HTMLElement>;
  let viewport: HTMLElement;
  let contents: HTMLElement;
  let viewportHeight = 0;
  let visible: any[];
  let mounted: boolean;

  let top = 0;
  let bottom = 0;
  let averageHeight: number;

  $: visible = items.slice(start, end).map((data, i) => {
    return { index: i + start, data };
  });

  // whenever `items` changes, invalidate the current heightmap
  $: if (mounted) refresh(items, viewportHeight, itemHeight);

  async function refresh(items: any[], viewportHeight: number, itemHeight: number) {
    const { scrollTop } = viewport;
    const numEntriesPerRow = Math.floor((viewport.clientWidth + columnGap) / (itemWidth + columnGap));

		await tick(); // wait until the DOM is up to date

		let contentHeight = top - scrollTop;
		let i = start;

		while ((contentHeight - rowGap) < viewportHeight && i < items.length) {
			let entry = entries[i - start];

			if (!entry) {
				end = i + 1;
				await tick(); // render the newly visible entry
				entry = entries[i - start];
			}

			const entryHeight = heightMap[i] = itemHeight;
			i++;

      if (i % numEntriesPerRow === 0) contentHeight += (entryHeight + rowGap);
		}

    contentHeight -= rowGap;

		end = i;

		const remaining = items.length - end;
		averageHeight = (top + contentHeight) / end;

		bottom = remaining * averageHeight;
		heightMap.length = items.length;
  }

  async function handleScroll() {
    const { scrollTop } = viewport;
    const numEntriesPerRow = Math.floor((viewport.clientWidth + columnGap) / (itemWidth + columnGap));

		const oldStart = start;

		for (let v = 0; v < entries.length; v++) {
			heightMap[start + v] = itemHeight;
		}

		let i = 0;
		let y = 0;

		while (i < items.length) {
			const entryHeight = heightMap[i] || averageHeight;

			if (y + entryHeight > scrollTop) {
				start = i;
				top = y;

				break;
			}

			y += entryHeight;
			i++;
		}

		while (i < items.length) {
			y += heightMap[i] || averageHeight;
			i++;

			if (y > scrollTop + viewportHeight) break;
		}

		end = i;

		const remaining = items.length - end;
		averageHeight = y / end;

		while (i < items.length) {
      heightMap[i++] = averageHeight;
    }

		bottom = remaining * averageHeight;

		// prevent jumping if we scrolled up into unknown territory
		if (start < oldStart) {
			await tick();

			let expectedHeight = 0;
			let actualHeight = 0;

			for (let i = start; i < oldStart; i++) {
				if (entries[i - start] && i % numEntriesPerRow === 0) {
					expectedHeight += heightMap[i];
					actualHeight += itemHeight;
				}
			}

			const d = actualHeight - expectedHeight;
			viewport.scrollTo(0, scrollTop + d);
		}

		// TODO if we overestimated the space these
		// rows would occupy we may need to add some
		// more. maybe we can just call handle_scroll again?
  }

  // trigger initial refresh
  onMount(() => {
    entries = contents.getElementsByTagName("svelte-virtual-grid-entry") as HTMLCollectionOf<HTMLElement>;
    mounted = true;
  });
</script>

<svelte-virtual-grid-viewport style="height: {height}; --img-width: {itemWidth}px; --img-height: {itemHeight}px; --column-gap: {columnGap}px; --row-gap: {rowGap}px;" on:scroll={handleScroll} bind:this={viewport} bind:offsetHeight={viewportHeight}>
	<svelte-virtual-grid-contents style="padding-top: {top}px; padding-bottom: {bottom}px;" bind:this={contents}>
		{#each visible as entry (keyFunction(entry))}
			<svelte-virtual-grid-entry>
				<slot entry={entry.data}>Missing template</slot>
			</svelte-virtual-grid-entry>
		{/each}
	</svelte-virtual-grid-contents>
</svelte-virtual-grid-viewport>

<style>
	svelte-virtual-grid-viewport {
		position: relative;
		overflow-y: auto;
		-webkit-overflow-scrolling:touch;
		display: block;
	}

	svelte-virtual-grid-contents {
		width: 100%;
    display: grid;
    
    grid-template-columns: repeat(auto-fit, var(--img-width));
    
    row-gap: var(--row-gap);
    column-gap: var(--column-gap);

    grid-auto-flow: row;
    grid-auto-rows: var(--img-height);

    justify-content: center;
	}

	svelte-virtual-grid-entry {
		overflow: hidden;
	}

  /* .game-grid {
    width: 100%;
    display: grid;
    
    grid-template-columns: repeat(auto-fit, var(--img-width));
    row-gap: 15px;
    column-gap: 15px;
    grid-auto-flow: row;
    grid-auto-rows: var(--img-height);

    justify-content: center;
  } */
</style>