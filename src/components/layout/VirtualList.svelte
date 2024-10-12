<script lang="ts">
    import { scrollShadow } from "@directives";
    import { onMount, tick } from "svelte";

	// * Component Props.
	export let items: any[];
	export let height = "100%";
  export let width = "100%";
	export let itemHeight: any = undefined;
  
  export let keyFunction = (entry: any) => entry.index;

	// * Read-Only, but visible to consumers via bind:start & bind:end.
	export let start = 0;
	export let end = 0;

  // * Local State
	let mounted: boolean;
	let rows: HTMLCollectionOf<HTMLElement>;
	let visible: any[];
	let heightMap: number[] = [];

	let viewport: HTMLElement;
	let viewportHeight = 0;

	let contents: HTMLElement;

	let top = 0;
	let bottom = 0;
	let averageHeight: number;

	$: visible = items.slice(start, end).map((data, i) => {
		return { index: i + start, data };
	});

  // * Whenever `items` changes, invalidate the current heightmap.
	$: if (mounted) refresh(items, viewportHeight, itemHeight);

	async function refresh(items: any[], viewportHeight: number, itemHeight: number) {
		const { scrollTop } = viewport;

    // * Wait until the DOM is up to date.
		await tick();

		let contentHeight = top - scrollTop;
		let i = start;

		while (contentHeight < viewportHeight && i < items.length) {
			let row = rows[i - start];

			if (!row) {
				end = i + 1;
        // * Render the newly visible entry.
				await tick();
				row = rows[i - start];
			}

			const rowHeight = heightMap[i] = itemHeight || row.offsetHeight;
			contentHeight += rowHeight;
			i++;
		}

		end = i;

		const remaining = items.length - end;
		averageHeight = (top + contentHeight) / end;

		bottom = remaining * averageHeight;
		heightMap.length = items.length;
	}

	async function handleScroll() {
		const { scrollTop } = viewport;

		const oldStart = start;

		for (let v = 0; v < rows.length; v += 1) {
			heightMap[start + v] = itemHeight || rows[v].offsetHeight;
		}

		let i = 0;
		let y = 0;

		while (i < items.length) {
			const rowHeight = heightMap[i] || averageHeight;

			if (y + rowHeight > scrollTop) {
				start = i;
				top = y;

				break;
			}

			y += rowHeight;
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

		// * Prevent jumping if we scrolled up into unknown territory.
		if (start < oldStart) {
			await tick();

			let expectedHeight = 0;
			let actualHeight = 0;

			for (let i = start; i < oldStart; i +=1) {
				if (rows[i - start]) {
					expectedHeight += heightMap[i];
					actualHeight += itemHeight || rows[i - start].offsetHeight;
				}
			}

			const d = actualHeight - expectedHeight;
			viewport.scrollTo(0, scrollTop + d);
		}

		// TODO if we overestimated the space these
		// rows would occupy we may need to add some
		// more. maybe we can just call handle_scroll again?
	}

	// * Trigger initial refresh.
	onMount(() => {
		rows = contents.getElementsByTagName("svelte-virtual-list-row") as HTMLCollectionOf<HTMLElement>;
		mounted = true;
	});
</script>

<div style="width: {width}; height: {height};">
  <svelte-virtual-list-viewport
    style="height: {height};"
    class="styled-scrollbar"
    use:scrollShadow={{ background: "--background" }}
    on:scroll={handleScroll}
    bind:offsetHeight={viewportHeight}
    bind:this={viewport}
  >
    <svelte-virtual-list-contents
      style="padding-top: {top}px; padding-bottom: {bottom}px;"
      bind:this={contents}
    >
      {#each visible as row (keyFunction(row))}
        <svelte-virtual-list-row>
          <slot entry={row.data}>Missing template</slot>
        </svelte-virtual-list-row>
      {/each}
    </svelte-virtual-list-contents>
  </svelte-virtual-list-viewport>
</div>

<style>
	svelte-virtual-list-viewport {
		position: relative;
		overflow-y: auto;
    overflow-x: hidden;
		display: block;
	}

	svelte-virtual-list-contents {
		display: block;
	}

	svelte-virtual-list-row {
    margin-left: 10px;
    margin-right: 10px;
		display: flex;
	}
</style>