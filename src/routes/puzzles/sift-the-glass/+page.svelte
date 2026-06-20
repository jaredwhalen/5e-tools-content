<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import {
		COLORS,
		QUADS,
		SAND_COLORS,
		ADJACENT,
		QUAD_CENTER,
		createInitialBoard,
		drainColor,
		splitColor,
		presentColors,
		hasColor,
		isSolved,
		drainControl
	} from './puzzle-logic';
	import { allSandDots, drawSandTexture } from './sand-texture';
	import { runSandTransition } from './sand-transition';

	let board = createInitialBoard();
	let activeQuad = null;
	let selectedColor = null;

	let circleEl = null;
	let sandCanvas = null;
	let drawQueued = false;
	let transitionCancel = null;
	let isTransitioning = false;
	let winGlow = 0;
	let puzzleSolved = false;
	let winGlowRaf = 0;

	function drawSand() {
		if (!circleEl || !sandCanvas) return;

		const diameterPx = circleEl.getBoundingClientRect().width;
		if (diameterPx <= 0) return;

		const dpr = window.devicePixelRatio || 1;
		sandCanvas.width = diameterPx * dpr;
		sandCanvas.height = diameterPx * dpr;
		sandCanvas.style.width = `${diameterPx}px`;
		sandCanvas.style.height = `${diameterPx}px`;

		const ctx = sandCanvas.getContext('2d');
		if (!ctx) return;

		drawSandTexture(ctx, allSandDots(board, diameterPx), diameterPx, dpr, [], winGlow);
	}

	function renderFrame(dots, animatedGrains = []) {
		if (!circleEl || !sandCanvas) return;

		const diameterPx = circleEl.getBoundingClientRect().width;
		if (diameterPx <= 0) return;

		const dpr = window.devicePixelRatio || 1;
		const ctx = sandCanvas.getContext('2d');
		if (!ctx) return;

		drawSandTexture(ctx, dots, diameterPx, dpr, animatedGrains, winGlow);
	}

	function startWinGlow() {
		if (winGlowRaf) cancelAnimationFrame(winGlowRaf);
		const start = performance.now();
		const duration = 1400;

		function frame(now) {
			winGlow = Math.min((now - start) / duration, 1);
			drawSand();
			if (winGlow < 1) {
				winGlowRaf = requestAnimationFrame(frame);
			} else {
				winGlowRaf = 0;
			}
		}

		winGlowRaf = requestAnimationFrame(frame);
	}

	function afterSandTransition() {
		isTransitioning = false;
		transitionCancel = null;

		if (isSolved(board) && !puzzleSolved) {
			puzzleSolved = true;
			startWinGlow();
		} else {
			scheduleDraw();
		}
	}

	function beginTransition(meta) {
		if (!circleEl) return;

		if (transitionCancel) transitionCancel();
		isTransitioning = true;

		const diameterPx = circleEl.getBoundingClientRect().width;

		transitionCancel = runSandTransition(
			board,
			meta,
			diameterPx,
			(dots, grains) => renderFrame(dots, grains),
			afterSandTransition
		);
	}

	function scheduleDraw() {
		if (drawQueued) return;
		drawQueued = true;
		requestAnimationFrame(() => {
			drawQueued = false;
			drawSand();
		});
	}

	function mountCircle(node) {
		circleEl = node;
		const ro = new ResizeObserver(scheduleDraw);
		ro.observe(node);
		scheduleDraw();

		return {
			destroy() {
				ro.disconnect();
				circleEl = null;
			}
		};
	}

	function bindSandCanvas(node) {
		sandCanvas = node;
		scheduleDraw();

		return {
			destroy() {
				sandCanvas = null;
			}
		};
	}

	onMount(async () => {
		await tick();
		scheduleDraw();
	});

	onDestroy(() => {
		if (transitionCancel) transitionCancel();
		if (winGlowRaf) cancelAnimationFrame(winGlowRaf);
	});

	$: if (sandCanvas && circleEl && !isTransitioning && !winGlowRaf) {
		board;
		winGlow;
		scheduleDraw();
	}

	function clearSelection() {
		activeQuad = null;
		selectedColor = null;
	}

	function onQuadClick(quad) {
		if (activeQuad === quad && !selectedColor) {
			clearSelection();
			return;
		}
		activeQuad = quad;
		selectedColor = null;
	}

	function onColorPick(color) {
		if (!activeQuad || !hasColor(board, activeQuad, color)) return;
		selectedColor = color;
	}

	function onDrain(target) {
		if (!activeQuad || !selectedColor) return;
		const source = activeQuad;
		const color = selectedColor;
		const oldBoard = board;
		board = drainColor(board, source, color, target);
		clearSelection();
		beginTransition({ color, source, targets: [target], oldBoard });
	}

	function onSplit() {
		if (!activeQuad || !selectedColor) return;
		const source = activeQuad;
		const color = selectedColor;
		const targets = ADJACENT[source];
		const oldBoard = board;
		board = splitColor(board, source, color);
		clearSelection();
		beginTransition({ color, source, targets: [...targets], oldBoard });
	}

	function onBackdropClick() {
		clearSelection();
	}

	$: pickerColors = activeQuad && !selectedColor ? presentColors(board, activeQuad) : [];
	$: showActions = activeQuad && selectedColor && hasColor(board, activeQuad, selectedColor);
	$: controlCenter = activeQuad ? QUAD_CENTER[activeQuad] : null;
	$: drainTargets = activeQuad ? ADJACENT[activeQuad] : [];
</script>

<svelte:head>
	<title></title>
</svelte:head>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="arena" on:click={onBackdropClick}>
	<div class="circle" class:solved={puzzleSolved} style:--win-glow={winGlow} use:mountCircle on:click|stopPropagation>
		<div class="ring" />
		<div class="cross" />

		<canvas class="sand-layer" use:bindSandCanvas aria-hidden="true" />

		<div class="grid-overlay" aria-hidden="true" />

		{#each QUADS as quad}
			<button
				type="button"
				class="quad-hit {quad}"
				class:active={activeQuad === quad}
				on:click|stopPropagation={() => onQuadClick(quad)}
			/>
		{/each}

		{#if activeQuad && controlCenter && pickerColors.length > 0 && !selectedColor}
			<div
				class="control-hub"
				style:left="{controlCenter.x}%"
				style:top="{controlCenter.y}%"
				on:click|stopPropagation
			>
				<div class="pip-grid interactive">
					{#each COLORS as color}
						{#if hasColor(board, activeQuad, color)}
							<button
								type="button"
								class="pip-button"
								style:--pip-color={SAND_COLORS[color]}
								on:click={() => onColorPick(color)}
							/>
						{:else}
							<span class="pip empty" />
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		{#if showActions && controlCenter}
			<div
				class="control-hub"
				style:left="{controlCenter.x}%"
				style:top="{controlCenter.y}%"
				on:click|stopPropagation
			>
				<button type="button" class="split-arrow" on:click={onSplit}>
					<svg viewBox="0 0 24 24">
						<path
							d="M12 4v6M8 8L4 12l4 4M16 8l4 4-4 4"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
						/>
					</svg>
				</button>
			</div>

			{#each drainTargets as target}
				{@const arrow = drainControl(activeQuad, target)}
				<button
					type="button"
					class="drain-arrow"
					style:left="{arrow.x}%"
					style:top="{arrow.y}%"
					style:--arrow-rotate="{arrow.angle}deg"
					on:click|stopPropagation={() => onDrain(target)}
				>
					<svg viewBox="0 0 24 24">
						<path d="M4 12h14M14 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.5" />
					</svg>
				</button>
			{/each}
		{/if}
	</div>
</div>

<style lang="scss">
	.arena {
		position: fixed;
		inset: 0;
		display: grid;
		place-items: center;
		background: #0d0b0a;
	}

	.circle {
		position: relative;
		width: 12in;
		height: 12in;
		border-radius: 50%;
		overflow: hidden;
		filter: drop-shadow(0 0 28px rgba(120, 180, 220, 0.12));
		transition: filter 0.4s ease;

		&.solved {
			filter: drop-shadow(0 0 calc(12px + var(--win-glow) * 28px) rgba(200, 180, 255, calc(0.15 + var(--win-glow) * 0.45)));
		}
	}

	.ring {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		box-shadow:
			inset 0 0 0 1px rgba(180, 220, 255, 0.18),
			inset 0 0 20px rgba(100, 160, 220, 0.06),
			0 0 24px rgba(80, 140, 200, 0.08);
		pointer-events: none;
		z-index: 5;
		transition: box-shadow 0.4s ease;

		.solved & {
			box-shadow:
				inset 0 0 0 1px rgba(200, 180, 255, calc(0.18 + var(--win-glow) * 0.55)),
				inset 0 0 calc(20px + var(--win-glow) * 24px) rgba(200, 180, 255, calc(0.06 + var(--win-glow) * 0.18)),
				0 0 calc(24px + var(--win-glow) * 32px) rgba(200, 180, 255, calc(0.08 + var(--win-glow) * 0.35));
		}
	}

	.cross {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(to right, transparent calc(50% - 0.5px), rgba(160, 210, 255, 0.22) calc(50% - 0.5px), rgba(160, 210, 255, 0.22) calc(50% + 0.5px), transparent calc(50% + 0.5px)),
			linear-gradient(to bottom, transparent calc(50% - 0.5px), rgba(160, 210, 255, 0.22) calc(50% - 0.5px), rgba(160, 210, 255, 0.22) calc(50% + 0.5px), transparent calc(50% + 0.5px));
		filter: drop-shadow(0 0 4px rgba(140, 200, 255, 0.35));
		pointer-events: none;
		z-index: 4;
		transition: filter 0.4s ease;

		.solved & {
			background:
				linear-gradient(to right, transparent calc(50% - 0.5px), rgba(200, 180, 255, calc(0.22 + var(--win-glow) * 0.45)) calc(50% - 0.5px), rgba(200, 180, 255, calc(0.22 + var(--win-glow) * 0.45)) calc(50% + 0.5px), transparent calc(50% + 0.5px)),
				linear-gradient(to bottom, transparent calc(50% - 0.5px), rgba(200, 180, 255, calc(0.22 + var(--win-glow) * 0.45)) calc(50% - 0.5px), rgba(200, 180, 255, calc(0.22 + var(--win-glow) * 0.45)) calc(50% + 0.5px), transparent calc(50% + 0.5px));
			filter: drop-shadow(0 0 calc(4px + var(--win-glow) * 14px) rgba(200, 180, 255, calc(0.35 + var(--win-glow) * 0.5)));
		}
	}

	.sand-layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: none;
		z-index: 3;
		border-radius: 50%;
	}

	.grid-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 6;
		background-image:
			linear-gradient(to right, rgba(180, 220, 255, 0.38) 1px, transparent 1px),
			linear-gradient(to bottom, rgba(180, 220, 255, 0.38) 1px, transparent 1px);
		background-size: 1in 1in;
	}

	@keyframes pip-grid-enter {
		from {
			opacity: 0;
			transform: scale(0.45);
		}

		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.pip-grid {
		display: grid;
		grid-template-columns: repeat(2, 1.25rem);
		grid-template-rows: repeat(2, 1.25rem);
		gap: 0.45rem;
		animation: pip-grid-enter 0.28s ease-out both;

		&.interactive {
			pointer-events: auto;
		}
	}

	.pip {
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		background: var(--pip-color);
		border: 1px solid rgba(255, 255, 255, 0.2);

		&.empty {
			background: transparent;
			border-color: transparent;
		}
	}

	.pip-button {
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		background: var(--pip-color);
		border: 1.5px solid rgba(200, 230, 255, 0.55);
		box-shadow:
			0 0 8px var(--pip-color),
			0 0 16px rgba(140, 200, 255, 0.25);
		cursor: pointer;
		padding: 0;
		transition: transform 0.15s ease, box-shadow 0.15s ease;

		&:hover {
			transform: scale(1.12);
			box-shadow:
				0 0 12px var(--pip-color),
				0 0 24px rgba(140, 200, 255, 0.4);
		}
	}

	.quad-hit {
		position: absolute;
		border: none;
		padding: 0;
		cursor: pointer;
		background: transparent;
		z-index: 2;

		&.tl {
			left: 0;
			top: 0;
			width: 50%;
			height: 50%;
		}

		&.tr {
			right: 0;
			top: 0;
			width: 50%;
			height: 50%;
		}

		&.bl {
			left: 0;
			bottom: 0;
			width: 50%;
			height: 50%;
		}

		&.br {
			right: 0;
			bottom: 0;
			width: 50%;
			height: 50%;
		}

		&.active {
			background: rgba(120, 180, 255, 0.05);
			box-shadow: inset 0 0 24px rgba(100, 160, 220, 0.08);
			z-index: 3;
		}
	}

	.control-hub {
		position: absolute;
		transform: translate(-50%, -50%);
		z-index: 10;
	}

	.drain-arrow {
		position: absolute;
		transform: translate(-50%, -50%) rotate(var(--arrow-rotate));
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		border: 1px solid rgba(160, 210, 255, 0.45);
		background: rgba(8, 14, 24, 0.65);
		box-shadow:
			0 0 10px rgba(120, 180, 255, 0.25),
			inset 0 0 8px rgba(100, 160, 220, 0.08);
		color: rgba(190, 225, 255, 0.95);
		display: grid;
		place-items: center;
		padding: 0.35rem;
		cursor: pointer;
		z-index: 10;

		svg {
			width: 100%;
			height: 100%;
		}
	}

	.split-arrow {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		border: 1px solid rgba(255, 200, 120, 0.55);
		background: rgba(8, 14, 24, 0.65);
		box-shadow:
			0 0 12px rgba(255, 180, 100, 0.3),
			inset 0 0 8px rgba(255, 160, 80, 0.08);
		color: rgba(255, 215, 160, 0.95);
		display: grid;
		place-items: center;
		padding: 0.4rem;
		cursor: pointer;

		svg {
			width: 100%;
			height: 100%;
		}
	}
</style>
