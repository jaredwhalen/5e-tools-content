<script>
	import texture from '$lib/assets/stone-texture.jpg';
	import moon from './images/moon.jpg';
	import harvestMoon from './images/harvest.jpg';
	import buckMoon from './images/buck.jpg';
	import wolfMoon from './images/wolf.jpg';
	import beaverMoon from './images/beaver.jpg';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

	const challenges = [
		{
			name: 'Harvest',
			image: harvestMoon,
			month: 10,
			day: 6
		},
		{
			name: 'Buck',
			image: buckMoon,
			month: 7,
			day: 10
		},
		{
			name: 'Wolf',
			image: wolfMoon,
			month: 1,
			day: 13
		},
		{
			name: 'Beaver',
			image: beaverMoon,
			month: 11,
			day: 5
		}
	];

	let currentChallenge = 0;
	let selectedMonth = null;
	let selectedDay = null;
	let showFailure = false;
	let complete = false;

	onMount(() => {
		// Get puzzle from URL parameter
		const puzzleParam = $page.url.searchParams.get('puzzle');
		if (puzzleParam) {
			const puzzleIndex = parseInt(puzzleParam) - 1;
			if (puzzleIndex >= 0 && puzzleIndex < challenges.length) {
				currentChallenge = puzzleIndex;
			}
		}
	});

	function handleMonthSelect(month) {
		selectedMonth = month;
		checkGuess();
	}

	function handleDaySelect(day) {
		selectedDay = day;
		checkGuess();
	}

	function checkGuess() {
		if (selectedMonth === null || selectedDay === null) return;

		const challenge = challenges[currentChallenge];
		if (selectedMonth === challenge.month && selectedDay === challenge.day) {
			// Correct guess
			setTimeout(() => {
				if (currentChallenge < challenges.length - 1) {
					currentChallenge++;
					selectedMonth = null;
					selectedDay = null;
				} else {
					complete = true;
				}
			}, 2000);
		} else {
			// Wrong guess
			showFailure = true;
			setTimeout(() => {
				showFailure = false;
				selectedMonth = null;
				selectedDay = null;
			}, 500);
		}
	}
</script>

{#if !complete}
<div class="container" style:--bg-texture="url({texture})" transition:fade>
	<div class="puzzle-image">
		<img
			class="rune"
			src={challenges[currentChallenge].image}
			alt={challenges[currentChallenge].name}
		/>
		<img src={moon} />
	</div>

	<div class="month-selector">
		{#each Array(12) as _, i}
			<button
				class:glow={selectedMonth === i + 1}
				class:success-glow={selectedMonth === challenges[currentChallenge].month &&
					selectedDay === challenges[currentChallenge].day}
				class:failure-glow={showFailure && selectedMonth === i + 1}
				on:click={() => handleMonthSelect(i + 1)}
			>
				{i + 1}
			</button>
		{/each}
	</div>

	<div class="day-selector">
		{#each Array(31) as _, i}
			<button
				class:glow={selectedDay === i + 1}
				class:success-glow={selectedMonth === challenges[currentChallenge].month &&
					selectedDay === challenges[currentChallenge].day}
				class:failure-glow={showFailure && selectedDay === i + 1}
				on:click={() => handleDaySelect(i + 1)}
			>
				{i + 1}
			</button>
		{/each}
	</div>
</div>
{/if}



<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4rem;
		padding: 2rem;

		// &.complete {
		// 	padding: 0%;
		// 	height: 90vh;
		// 	justify-content: center;
		// 	align-items: center;
		// }
	}

	.puzzle-image {
		width: 300px;
		height: 300px;
		border-radius: 50%;
		overflow: hidden;
		position: relative;
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			mix-blend-mode: lighten;
			filter: saturate(0);
		}

		.rune {
			width: 90%;
			height: 90%;
			opacity: 1;
			margin: auto;
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			right: 0;
		}
	}

	.month-selector,
	.day-selector {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
		max-width: 800px;
	}

	.day-selector {
		max-width: 600px;
	}

	button {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		border: none;
		background: rgba(255, 255, 255, 0.1);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		padding: 0.5rem;
		color: white;
		opacity: 0.8;
		position: relative;
		font-family: 'Aubrey', serif;
		font-size: 1.4rem;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: 50%;
			background-image: var(--bg-texture);
			background-size: cover;
			opacity: 0.25;
			z-index: 10;
		}
	}

	.dot {
		width: 6px;
		height: 6px;
		background: white;
		border-radius: 50%;
		margin: 2px;
	}

	.glow {
		box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
	}

	.success-glow {
		// box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
		animation: success-glow 2s ease-in-out;
	}

	.failure-glow {
		box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
		animation: shake 0.2s ease-in-out;
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-5px);
		}
		75% {
			transform: translateX(5px);
		}
	}

	@keyframes success-glow {
		0%,
		100% {
			box-shadow: 0 0 20px rgba(0, 255, 0, 0);
		}
		75% {
			box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
		}
	}
</style>
