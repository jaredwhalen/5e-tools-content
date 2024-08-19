<script>
	import panzoom from 'panzoom';
	import mapImage from '$lib/assets/map.jpg'; // Import your image
	import HexGrid from './HexGrid.svelte';

	let instance;

	let imageW;

	let coords;
	let location;
	let landmark;

	// Initialize panzoom on the image element
	function initPanzoom(node) {
		instance = panzoom(node, {
			smoothScroll: false, // Disable smooth scrolling for finer control
			maxZoom: 7, // Set maximum zoom level
			minZoom: 1, // Set minimum zoom level
			bounds: true, // Enable bounds
			boundsPadding: 1 // Prevent dragging the image beyond its boundaries
		});
	}

	let numColumns = 49;
	let numRows = 39;
	let hemisphereDivide = 20;

	let layers = [
		{
			label: 'CR rings',
			id: 'show-cr-rings',
			checked: 'no'
		}
	];

	$: console.log(layers)
</script>

<div id="container" bind:clientWidth={imageW}>
	{#if coords}
		<div class="coords">
			<h2>{coords}</h2>
			{@html location?.length
				? `<b>Locations</b><ul>${location
						.split(';')
						.map((l) => `<li>${l.trim()}</li>`)
						.join('')}</ul>`
				: ''}{@html landmark?.length ? `<b>Landmarks</b><br/>${landmark}` : ``}
		</div>
	{/if}

	<div class="layers">
		{#each layers as control, i}
			<label for={control.id}>{control.label}</label>
			<input id={control.id} type="checkbox" bind:checked={control.checked} />
		{/each}
	</div>

	<!-- Use the image with panzoom -->
	<div class="zoom" use:initPanzoom>
		{#if imageW}
			<HexGrid
				bind:coords
				bind:location
				bind:landmark
				containerWidth={imageW}
				{numColumns}
				{numRows}
				{hemisphereDivide}
				{layers}
			/>
		{/if}
		<img src={mapImage} alt="Zoomable and pannable map image" />
	</div>
</div>

<style lang="scss">
	#container {
		width: 100%;
		height: 800px;
		overflow: hidden;
		position: relative;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: contain; /* Adjust the image fit if necessary */
		cursor: grab; /* Show a grab cursor to indicate draggable area */
	}

	img:active {
		cursor: grabbing; /* Show grabbing cursor when active */
	}

	.coords {
		position: fixed;
		left: 20px;
		top: 10px;
		background: rgba(0, 0, 0, 0.85);
		color: #fff;
		padding: 5px 10px;
		border-radius: 3px;
		font-size: 16px;
		pointer-events: none;
		white-space: nowrap;
		z-index: 1000;
		width: 100%;
		max-width: 200px;
		white-space: wrap;
	}


	.layers {
		position: fixed;
		right: 20px;
		top: 10px;
		background: rgba(0, 0, 0, 0.85);
		color: #d29a38;
		padding: 5px 10px;
		border-radius: 3px;
		font-size: 16px;
		white-space: nowrap;
		z-index: 1000;
		white-space: wrap;
	}

	:global {
		ul {
			margin: 0px;
		}

		.coords {
			b {
				color: #7db6e8;
			}
		}
	}
</style>
