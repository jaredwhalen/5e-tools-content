<script>
	export let containerWidth;
	export let numColumns;
	export let numRows;
	export let coords;

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

	// Function to move tooltip with the cursor
	function handleMouseMove(e) {
		const tooltip = document.querySelector('.tooltip');
		tooltip.style.left = `${e.pageX}px`;
		tooltip.style.top = `${e.pageY}px`;
	}
</script>

<div
	class="hex-container"
	style:--container-width={`${containerWidth}px`}
	style:--svg-height={`${svgHeight}px`}
>
	<svg width={svgWidth} height={svgHeight}>
		<g transform="translate(0,-{hexHeight / 2})">
			{#each Array(numRows).fill(0) as _, rowIndex}
				{#each Array(numColumns).fill(0) as _, colIndex}
					<polygon
						class="hex"
						{points}
						transform={`translate(${colIndex * ((hexWidth * 3) / 4) + hexWidth / 2}, ${rowIndex * hexHeight + (colIndex % 2) * (hexHeight / 2)})`}
						data-coords={generateColumnLabel(colIndex) + (rowIndex + 1)}
						on:mouseenter={(e) => {
							coords = e.target.getAttribute('data-coords');
						}}
						on:mouseleave={() => {
							coords = undefined;
						}}
					/>
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
        mix-blend-mode: darken;
    }

	.hex {
		fill: transparent;
		stroke: #999;
		stroke-width: 0.25px;
		cursor: pointer;
		// opacity: 0;

		&:hover {
			fill: #d4353580;
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
