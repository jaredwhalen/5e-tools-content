<script>
	import panzoom from 'panzoom';
	import mapImage from '$lib/assets/map.jpg'; // Import your image
	import HexGrid from './HexGrid.svelte';

	let instance;

	let imageW;

	let coords;

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
</script>

<div id="container" bind:clientWidth={imageW}>
	{#if coords}
		<div class="coords">{coords}</div>
	{/if}

	<!-- Use the image with panzoom -->
	<div class="zoom" use:initPanzoom>
		{#if imageW}
			<HexGrid bind:coords containerWidth={imageW} numColumns={49} numRows={39} />
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
		background: rgba(0, 0, 0, 0.75);
		color: #fff;
		padding: 5px 10px;
		border-radius: 3px;
		font-size: 20px;
		pointer-events: none;
		white-space: nowrap;
		z-index: 1000;
	}
</style>
