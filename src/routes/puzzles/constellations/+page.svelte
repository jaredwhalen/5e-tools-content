<script>
	import texture from '$lib/assets/stone-texture.jpg';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { RotateCcw } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	const challenges = [
		{
			name: 'Pentagram',
			pattern: [
				[0, 0, 1, 0, 0],
				[0, 1, 0, 1, 0],
				[1, 0, 0, 0, 1],
				[0, 1, 0, 1, 0],
				[0, 0, 1, 0, 0]
			],
			size: 5
		},
		{
			name: 'Pleiades',
			pattern: [
				[0, 1, 0, 1, 0, 0],
				[1, 0, 1, 0, 1, 0],
				[0, 1, 0, 1, 0, 1],
				[1, 0, 1, 0, 1, 0],
				[0, 1, 0, 1, 0, 0],
				[0, 0, 1, 0, 0, 0]
			],
			size: 6
		},
		{
			name: 'Orion',
			pattern: [
				[1, 0, 1, 0, 1],
				[0, 1, 1, 1, 0],
				[1, 1, 0, 1, 1],
				[0, 1, 1, 1, 0],
				[1, 0, 1, 0, 1]
			],
			size: 5
		}
	];

	let currentChallenge = 0;
	let currentState = [];
	let moves = 0;
	let isSuccess = false;

	let gridWidth = 20; // Default values for SSR
	let gridHeight = 20;
	let offsetX = 0;
	let offsetY = 0;
	let complete = false;

	// Scale factor for inch calibration (1 means 96px = 1in)
	const INCH_SCALE = 1.3; // Adjust this value to calibrate grid size

	function updateGridDimensions() {
		// Calculate grid dimensions based on viewport, accounting for scale
		gridWidth = Math.floor(window.innerWidth / (96 * INCH_SCALE));
		gridHeight = Math.floor(window.innerHeight / (96 * INCH_SCALE));
		
		// Calculate offsets to center the puzzle
		offsetX = Math.floor((gridWidth - challenges[currentChallenge].size) / 2);
		offsetY = Math.floor((gridHeight - challenges[currentChallenge].size) / 2);

		// Ensure minimum offset of 1 to prevent edge touching
		offsetX = Math.max(1, offsetX);
		offsetY = Math.max(1, offsetY);

		// Set the scale CSS variable
		document.documentElement.style.setProperty('--inch-scale', `${INCH_SCALE}`);
	}

	onMount(() => {
		// Get puzzle from URL parameter
		const puzzleParam = $page.url.searchParams.get('puzzle');
		if (puzzleParam) {
			const puzzleIndex = parseInt(puzzleParam) - 1;
			if (puzzleIndex >= 0 && puzzleIndex < challenges.length) {
				currentChallenge = puzzleIndex;
			}
		}

		updateGridDimensions();

		// Update dimensions when window is resized
		window.addEventListener('resize', updateGridDimensions);

		return () => {
			window.removeEventListener('resize', updateGridDimensions);
		};
	});

	function initializeGrid(size) {
		return Array(size)
			.fill()
			.map(() => Array(size).fill(0));
	}

	function toggleLight(row, col) {
		if (isSuccess) return; // Prevent moves during success animation

		// Toggle clicked light
		currentState[row][col] = currentState[row][col] ? 0 : 1;

		// Toggle adjacent lights
		const adjacent = [
			[row - 1, col], // up
			[row + 1, col], // down
			[row, col - 1], // left
			[row, col + 1] // right
		];

		for (let [r, c] of adjacent) {
			if (r >= 0 && r < currentState.length && c >= 0 && c < currentState[0].length) {
				currentState[r][c] = currentState[r][c] ? 0 : 1;
			}
		}

		moves++;
		currentState = [...currentState]; // trigger reactivity
		checkWin();
	}

	function checkWin() {
		const target = challenges[currentChallenge].pattern;
		const isMatch = currentState.every((row, i) =>
			row.every((cell, j) => {
				// Only check if target is 1 - we don't care about 0s
				if (target[i][j] === 1) {
					return cell === 1;
				}
				return true; // ignore non-target positions
			})
		);

		console.log('Current state:', currentState);
		console.log('Target pattern:', target);
		console.log('Is match:', isMatch);

		if (isMatch) {
			isSuccess = true;
			setTimeout(() => {
				if (currentChallenge < challenges.length - 1) {
					currentChallenge++;
					isSuccess = false;
					resetChallenge();
				} else {
					complete = true;
				}
			}, 2000);
		}
	}

	function resetChallenge() {
		const size = challenges[currentChallenge].size;
		currentState = initializeGrid(size);
		moves = 0;
		isSuccess = false;
	}

	// Initialize first challenge
	$: {
		currentChallenge; // track changes to currentChallenge
		resetChallenge();
	}
</script>

{#if !complete}
<div
	class="puzzle-wrapper"
	style:--grid-width={gridWidth}
	style:--grid-height={gridHeight}
	style:--puzzle-size={challenges[currentChallenge].size}
	style:--offset-x={offsetX}
	style:--offset-y={offsetY}
	transition:fade
>
	<div class="grid-container">
		<div class="puzzle-container" style:--bg-texture="url({texture})">
			{#each currentState as row, i}
				{#each row as cell, j}
					<button
						class="puzzle-button"
						style:--row={offsetY + i}
						style:--col={offsetX + j}
						class:lit={cell === 1}
						class:target={challenges[currentChallenge].pattern[i][j] === 1}
						class:success={isSuccess &&
							cell === 1 &&
							challenges[currentChallenge].pattern[i][j] === 1}
						on:click={() => toggleLight(i, j)}
					/>
				{/each}
			{/each}
		</div>
	</div>

	<button
		class="reset-button"
		style:--puzzle-center="{offsetX + challenges[currentChallenge].size / 2}in"
		style:--puzzle-bottom="{offsetY + challenges[currentChallenge].size + 1}in"
		on:click={resetChallenge}
	>
		<RotateCcw />
	</button>
</div>
{/if}

<style lang="scss">
	:global(:root) {
		--inch-scale: 1;
	}

	.puzzle-wrapper {
		position: fixed;
		transform:translateX(calc(-0.5in * var(--inch-scale)));
		inset: 0;
		// background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
		// 	linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
		// background-size: calc(1in * var(--inch-scale)) calc(1in * var(--inch-scale));
	}

	.grid-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.puzzle-button,
	.reset-button {
		position: absolute;
		width: calc(1in * var(--inch-scale));
		height: calc(1in * var(--inch-scale));
		top: calc(var(--row) * 1in * var(--inch-scale));
		left: calc(var(--col) * 1in * var(--inch-scale));
		padding: 0;
		border-radius: 50%;
		border: none;
		background: rgba(255, 255, 255, 0.1);
		cursor: pointer;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: 50%;
			background-image: var(--bg-texture);
			background-size: cover;
			opacity: 0.25;
			z-index: 10;
			pointer-events: none;
		}
	}

	.puzzle-button {
		&.lit {
			background: rgba(255, 255, 255, 0.4);
			box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
		}

		&.target {
			border: 2px solid rgba(255, 255, 255, 0.6);
		}

		&.success {
			animation: success-pulse 2s ease-in-out;
		}
	}

	@keyframes success-pulse {
		0%,
		100% {
			background: rgba(255, 255, 255, 0.8);
			box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
		}
		50% {
			background: rgba(100, 255, 100, 0.8);
			box-shadow: 0 0 25px rgba(100, 255, 100, 0.8);
		}
	}

	.reset-button {
		position: absolute;
		left: calc(var(--puzzle-center) * var(--inch-scale));
		top: calc(var(--puzzle-bottom) * var(--inch-scale));
		transform: translateX(-50%);
		width: 1in;
		height: 1in;
		padding: 0;
		border-radius: 50%;
		border: none;
		background: rgba(255, 255, 255, 0.1);
		cursor: pointer;
		color: white;
		font-size: 1rem;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: 50%;
			background-image: var(--bg-texture);
			background-size: cover;
			opacity: 0.25;
			z-index: 10;
			pointer-events: none;
		}

		&:hover {
			background: rgba(255, 255, 255, 0.2);
		}
	}
</style>
