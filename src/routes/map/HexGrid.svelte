<script>
	import locationsRaw from './locations.csv';

	export let containerWidth = 0;
	export let numColumns = 0;
	export let numRows = 0;
	export let hemisphereDivide = 0;
	export let coords;
	export let location;

	// Define a function to replace problematic characters
	function sanitizeText(text) {
		// Define a map of problematic characters and their replacements
		const replacements = {
			'\u2019': "'", // Replace right single quotation mark (’) with a regular apostrophe (')
			'\u2018': "'", // Replace left single quotation mark (‘) with a regular apostrophe (')
			'\u201C': '"', // Replace left double quotation mark (“) with a regular double quote (")
			'\u201D': '"', // Replace right double quotation mark (”) with a regular double quote (")
			'\u2026': '...', // Replace ellipsis (…) with three dots (...)
			'\u2013': '-', // Replace en dash (–) with a hyphen (-)
			'\u2014': '-', // Replace em dash (—) with a hyphen (-)
			'\uFFFD': '' // Replace the replacement character (�) with an empty string
		};

		// Replace each problematic character in the text
		return text.replace(
			/[\u2019\u2018\u201C\u201D\u2026\u2013\u2014\uFFFD]/g,
			(match) => replacements[match]
		);
	}

	// Sanitize all text fields in your JSON data
	function sanitizeLocations(data) {
		return data.map((location) => {
			// Assuming location is an object with text fields that need sanitization
			return Object.fromEntries(
				Object.entries(location).map(([key, value]) => [
					key,
					typeof value === 'string' ? sanitizeText(value) : value
				])
			);
		});
	}

	// Sanitize the imported locations
	const locations = sanitizeLocations(locationsRaw);

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

	function getLocation(coords, colIndex) {
		let col = coords?.slice(0, 1);
		let row = coords?.slice(1, 3);
		let hemisphere = colIndex > hemisphereDivide ? 'E' : 'W';
		return locations.find((l) => l?.row == row)?.[`${col} ${hemisphere}`];
	}
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
					{@const hexLocation = getLocation(hexCoords, colIndex)}
					{@const hasShrine = hexLocation?.toLowerCase().includes('shrine')}
					{@const hasAdjacent = hasShrine && hexLocation?.split(';').length > 1}
					<g
						transform={`translate(${colIndex * ((hexWidth * 3) / 4) + hexWidth / 2}, ${rowIndex * hexHeight + (colIndex % 2) * (hexHeight / 2)})`}
					>
						<polygon
							class="hex"
							data-coords={hexCoords}
							{points}
							on:mouseenter={(e) => {
								coords = hexCoords;
								location = hexLocation;
							}}
							on:mouseleave={() => {
								coords = undefined;
								location = undefined;
							}}
						/>
						{console.log(hexLocation)}
						{#if hexLocation && hexLocation.length}
							{#if hasShrine}
								{#if hasAdjacent}
									<circle class="location adjacent" r="3" />
									<circle class="location adjacent shrine" r="3" />
								{:else}
									<circle class="location shrine" r="3"/>
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

	svg {
	}

	.hex {
		fill: transparent;
		stroke: #999;
		stroke-width: 0.25px;
		cursor: pointer;
		position: relative;
		mix-blend-mode: darken;

		&.location {
			stroke: blue;
			stroke-width: 2px;
		}

		&:hover {
			fill: #d4353580;
		}
	}

	circle.location {
		fill: #bcb2a0;
		stroke: #000;
		stroke-width: 2px;
		transform: translateY(var(--hex-height));
		opacity: 1;

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
