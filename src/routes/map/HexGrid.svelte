<script>
	import locations from '$data/locations.csv';
	import landmarks from '$data/landmarks.csv';
	import mapped from '$data/mapped.csv';

	export let containerWidth = 0;
	export let numColumns = 0;
	export let numRows = 0;
	export let hemisphereDivide = 0;
	export let coords;
	export let location;
	export let landmark;
	export let layers;

	// Calculate the width and height of each hexagon
	$: hexWidth = containerWidth / numColumns + (containerWidth / numColumns) * 0.325;

	$: hexHeight = (Math.sqrt(3) / 2) * hexWidth; // Height of each hexagon

	// Calculate the positioning and sizing
	$: svgWidth = containerWidth;
	$: svgHeight = numRows * hexHeight + hexHeight / 2;

	// Calculate points for a flat-topped hexagon
	$: points = `
      ${hexWidth / 2},${hexHeight} 
      ${hexWidth * 0.25},${hexHeight * 1.5} 
      ${-hexWidth * 0.25},${hexHeight * 1.5} 
      ${-hexWidth / 2},${hexHeight} 
      ${-hexWidth * 0.25},${hexHeight * 0.5} 
      ${hexWidth * 0.25},${hexHeight * 0.5}`;

	// Generate column labels based on the starting letter F
	const generateColumnLabel = (colIndex) => {
		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const startIndex = alphabet.indexOf('F'); // Start from 'F'
		return alphabet[(startIndex + colIndex) % 26];
	};

	function getHexData(coords, colIndex) {
		let col = coords?.slice(0, 1);
		let row = coords?.slice(1, 3);
		let hemisphere = colIndex > hemisphereDivide ? 'E' : 'W';

		return {
			location: locations.find((l) => l?.row == row)?.[`${col} ${hemisphere}`],
			landmark: landmarks.find((l) => l?.row == row)?.[`${col} ${hemisphere}`],
			mapped: mapped.find((l) => l?.row == row)?.[`${col} ${hemisphere}`]
		};
	}

	let homebase = 'U19 E';
	let crRings = [
		{
			label: '1 - 3',
			r: 3
		},
		{
			label: '2 - 5',
			r: 6
		},
		{
			label: '3-7',
			r: 9
		},
		{
			label: '4-9',
			r: 12
		},
		{
			label: '5-11',
			r: 15
		},
		{
			label: '6-13',
			r: 18
		},
		{
			label: '7-15',
			r: 21
		}
	];
</script>

<div
	class="hex-container"
	style:--container-width={`${containerWidth}px`}
	style:--svg-height={`${svgHeight}px`}
>
	<svg width={svgWidth} height={svgHeight} style:--hex-height="{hexHeight}px">
		<g transform="translate(0,-{hexHeight / 2})">
			{#each Array(numRows).fill(0) as _, rowIndex}
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				{#each Array(numColumns).fill(0) as _, colIndex}
					{@const hexCoords =
						generateColumnLabel(colIndex) +
						(rowIndex + 1) +
						(colIndex > hemisphereDivide ? ' E' : ' W')}
					{@const hexData = getHexData(hexCoords, colIndex)}
					{@const hexLocation = hexData.location}
					{@const hasShrine = hexLocation?.toLowerCase().includes('shrine')}
					{@const hasAdjacent = hasShrine && hexLocation?.split(';').length > 1}
					{@const isMapped = hexData.mapped?.length}

					{#if hexCoords == homebase && layers.find(c => c.id == 'show-cr-rings').checked}
						<g
							class="cr-ring"
							transform={`translate(${colIndex * ((hexWidth * 3) / 4) + hexWidth / 2}, ${rowIndex * hexHeight + (colIndex % 2) * (hexHeight / 2)})`}
						>
							{#each crRings as ring, i}
								<text
									style="transform: translate(-{i
										? hexWidth * ring.r - (hexWidth * crRings[i - i].r) / 2
										: 0}px, {hexHeight}px)">{ring.label}</text
								>
								<circle r={hexWidth * ring.r} />
							{/each}
						</g>
					{/if}

					<g
						transform={`translate(${colIndex * ((hexWidth * 3) / 4) + hexWidth / 2}, ${rowIndex * hexHeight + (colIndex % 2) * (hexHeight / 2)})`}
					>
						<polygon
							class="hex"
							class:mapped={isMapped}
							data-coords={hexCoords}
							{points}
							on:mouseenter={(e) => {
								coords = hexCoords;
								location = hexLocation;
								landmark = hexData.landmark;
							}}
							on:mouseleave={() => {
								coords = undefined;
								location = undefined;
								landmark = undefined;
							}}
						/>

						{#if hexLocation && hexLocation.length}
							{#if hasShrine}
								{#if hasAdjacent}
									<circle class="location adjacent" r="3" />
									<circle class="location adjacent shrine" r="3" />
								{:else}
									<circle class="location shrine" r="3" />
								{/if}
							{:else}
								<circle class="location" r="3" />
							{/if}
						{/if}
					</g>
				{/each}
			{/each}
		</g>
	</svg>
</div>

<style lang="scss">
	.hex-container {
		position: absolute;
		width: var(--container-width);
		height: var(--svg-height);
	}

	.cr-ring {
		circle {
			fill: transparent;
			stroke: rgb(255 0 0 / 50%);
			stroke-width: 2px;
			transform: translateY(var(--hex-height));
			opacity: 1;
			pointer-events: none;
		}

		text {
			fill: rgb(255 0 0 / 50%);
			text-anchor: middle;
			alignment-baseline: before-edge;
		}
	}

	.hex {
		fill: transparent;
		stroke: #999;
		stroke-width: 0.25px;
		cursor: pointer;
		position: relative;
		mix-blend-mode: darken;

		&.mapped {
			stroke: #d29a38;
			stroke-width: 1px;
		}

		&:hover {
			fill: #d29a3880;
		}
	}

	circle.location {
		fill: #bcb2a0;
		stroke: #000;
		stroke-width: 2px;
		transform: translateY(var(--hex-height));
		opacity: 1;
		pointer-events: none;

		&.shrine {
			fill: #5dc448;
		}

		&.adjacent {
			transform: translateX(-5px) translateY(var(--hex-height));

			&.shrine {
				transform: translateX(5px) translateY(var(--hex-height));
			}
		}
	}

	.tooltip {
		position: absolute;
		background: rgba(0, 0, 0, 0.75);
		color: #fff;
		padding: 5px 10px;
		border-radius: 3px;
		font-size: 12px;
		display: none;
		pointer-events: none;
		white-space: nowrap;
	}
</style>
