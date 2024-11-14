<script>
	import * as Tone from 'tone';
	import texture from '$lib/assets/stone-texture.jpg';

	// Original notes in order (C scale from C2 to C3)
	const originalNotes = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3'];
	// Hardcoded random order
	const notes = ['F2', 'C3', 'A2', 'D2', 'B2', 'G2', 'C2', 'E2'];

	let synth;
	let currentIndex = 0;
	let success = false;
	let glowingNote = null;

	// Initialize the FM Synth for a deeper, industrial sound
	function initSynth() {
		if (!synth) {
			synth = new Tone.FMSynth({
				harmonicity: 2.5,
				modulationIndex: 10,
				oscillator: { type: 'sine' },
				modulation: { type: 'square' },
				modulationEnvelope: {
					attack: 0.2,
					decay: 0.3,
					sustain: 0.7,
					release: 0.8
				}
			}).toDestination();
		}
	}

	// Function to start playing a note
	function startNote(note) {
		initSynth();
		synth.triggerAttack(note);
	}

	// Function to stop playing the note
	function stopNote() {
		if (synth) {
			synth.triggerRelease();
		}
	}

	let guesses = [];

	// Handle circle click
	function handleCircleClick(note) {
		startNote(note);

		guesses.push(note);

		guesses = guesses;

		console.log(guesses.includes(note));

		if (JSON.stringify(guesses) != JSON.stringify(originalNotes.slice(0, guesses.length))) {
            resetSequence()
        }

		if (JSON.stringify(guesses) == JSON.stringify(originalNotes)) {
			success = true;
		}

		// // Check if the clicked note is the correct one in sequence
		// if (note === originalNotes[currentIndex]) {
		//   glowingNote = note; // Highlight the correct note
		//   currentIndex++;

		//   // Check if the entire sequence is completed
		//   if (currentIndex === originalNotes.length) {
		//     success = true;
		//   }
		// } else {
		//   resetSequence(); // Incorrect note, reset the sequence
		// }
	}

	// Reset the sequence and glowing effects
	function resetSequence() {
		guesses = [];
		currentIndex = 0;
		glowingNote = null;
		success = false;
	}

	// Variables for layout
	const numCircles = notes.length;
	const radius = 40; // Circle arrangement radius as a percentage of container width
</script>

<div class="container">
	{#key guesses}
		{#each notes as note, index}
			<div
				class="circle"
				on:mousedown={() => handleCircleClick(note)}
				on:touchstart={() => handleCircleClick(note)}
				on:mouseup={stopNote}
				on:touchend={stopNote}
				on:mouseleave={stopNote}
				class:glow={guesses.includes(note)}
				class:success-glow={success}
				style="transform: translate(calc(50% + {Math.cos((index / numCircles) * Math.PI * 2) *
					radius}vw - 50%), calc(50% + {Math.sin((index / numCircles) * Math.PI * 2) *
					radius}vw - 50%));"
			></div>

			<div
				class="circle overlay"
				style:--bg-texture="url({texture})"
				style="transform: translate(calc(50% + {Math.cos((index / numCircles) * Math.PI * 2) *
					radius}vw - 50%), calc(50% + {Math.sin((index / numCircles) * Math.PI * 2) *
					radius}vw - 50%));"
			></div>
		{/each}
	{/key}
</div>

<style lang="scss">
	$base-color: #8f8f8f;
	$glow-color: #f39c12;
	$success-color: #2ecc71;

	.container {
		width: 100%;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.circle {
		position: absolute;
		aspect-ratio: 1;
		width: 10vw;
		max-width: 140px;
		min-width: 80px;
		border-radius: 50%;
		background-color: $base-color;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		user-select: none;
		transition:
			transform 0.1s ease,
			box-shadow 0.2s ease;

		&.overlay {
			background-image: var(--bg-texture);
			background-image: var(--bg-texture);
			z-index: 1;
			mix-blend-mode: overlay;
			pointer-events: none;
		}

		&:active {
			transform: scale(0.9);
		}

		&.glow {
			background-color: $glow-color;
			box-shadow: 0 0 15px $glow-color;
		}

		&.success-glow {
			background-color: $success-color;
			box-shadow: 0 0 20px $success-color;
		}
	}
</style>
