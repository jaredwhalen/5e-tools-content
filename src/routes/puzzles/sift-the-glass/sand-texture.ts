import {
	COLORS,
	QUAD_TARGET_COLOR,
	SAND_COLORS,
	QUADS,
	SHARE_EPSILON,
	type BoardState,
	type Color,
	type Quad
} from './puzzle-logic';

/** Single-pixel grains with tight spacing — reads as sand, not a grid. */
const GRAIN_PX = 1.5;
const CELL = 2;
const COVERAGE = 88;
const JITTER = 1.6;

/** Clearance for glowing rim stroke at the outer edge. */
export const RIM_INSET = 8;

const QUAD_SEED: Record<Quad, number> = {
	tl: 11,
	tr: 29,
	br: 47,
	bl: 83
};

const QUAD_BOUNDS: Record<Quad, { x0: number; x1: number; y0: number; y1: number }> = {
	tl: { x0: 0, x1: 0.5, y0: 0, y1: 0.5 },
	tr: { x0: 0.5, x1: 1, y0: 0, y1: 0.5 },
	br: { x0: 0.5, x1: 1, y0: 0.5, y1: 1 },
	bl: { x0: 0, x1: 0.5, y0: 0.5, y1: 1 }
};

/** Outer 90° arc per quadrant (canvas angles, clockwise). */
const QUAD_ARC: Record<Quad, { start: number; end: number }> = {
	tl: { start: Math.PI, end: (3 * Math.PI) / 2 },
	tr: { start: (3 * Math.PI) / 2, end: 2 * Math.PI },
	br: { start: 0, end: Math.PI / 2 },
	bl: { start: Math.PI / 2, end: Math.PI }
};

export type SandDot = { x: number; y: number; color: Color };

function hash2(x: number, y: number, seed: number): number {
	let h = (x * 374761393 + y * 668265263 + seed * 1274126177) | 0;
	h = (h ^ (h >>> 13)) * 1274126177;
	return (h ^ (h >>> 16)) >>> 0;
}

/** Stable per-slot roll in [0, 1) — grain visible when roll < share. */
export function grainRoll(h: number): number {
	return (h >>> 16) % 10000 / 10000;
}

export function grainVisible(h: number, share: number): boolean {
	if (share <= SHARE_EPSILON) return false;
	return grainRoll(h) < share;
}

/** Light purple for solved-state glow. */
export const WIN_GLOW_COLOR = '#c8b4ff';

function parseHex(hex: string): [number, number, number] {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpHex(a: string, b: string, t: number): string {
	const [ar, ag, ab] = parseHex(a);
	const [br, bg, bb] = parseHex(b);
	const r = Math.round(ar + (br - ar) * t);
	const g = Math.round(ag + (bg - ag) * t);
	const bl = Math.round(ab + (bb - ab) * t);
	return `rgb(${r}, ${g}, ${bl})`;
}


function drawGlowingArc(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	radius: number,
	start: number,
	end: number,
	color: string,
	glowProgress = 0
) {
	const stroke = lerpHex(color, WIN_GLOW_COLOR, glowProgress);
	const core = lerpHex(color, '#e8dcff', Math.min(1, glowProgress + 0.2));
	const outerBlur = 18 + glowProgress * 22;
	const innerBlur = 8 + glowProgress * 14;

	ctx.save();
	ctx.lineCap = 'round';
	ctx.shadowColor = WIN_GLOW_COLOR;
	ctx.shadowBlur = outerBlur;
	ctx.strokeStyle = stroke;
	ctx.lineWidth = 2.5;
	ctx.globalAlpha = 0.45 + glowProgress * 0.25;
	ctx.beginPath();
	ctx.arc(cx, cy, radius, start, end, false);
	ctx.stroke();

	ctx.shadowBlur = innerBlur;
	ctx.globalAlpha = 0.9;
	ctx.lineWidth = 1.25;
	ctx.strokeStyle = core;
	ctx.beginPath();
	ctx.arc(cx, cy, radius, start, end, false);
	ctx.stroke();
	ctx.restore();
}

function drawQuadRims(ctx: CanvasRenderingContext2D, diameterPx: number, glowProgress = 0) {
	const R = diameterPx / 2;
	const cx = R;
	const cy = R;
	const rimRadius = R - 2.5;

	for (const quad of QUADS) {
		const { start, end } = QUAD_ARC[quad];
		const target = QUAD_TARGET_COLOR[quad];
		drawGlowingArc(ctx, cx, cy, rimRadius, start, end, SAND_COLORS[target], glowProgress);
	}
}

function iterateGrainSlots(
	quad: Quad,
	diameterPx: number,
	onSlot: (slot: { px: number; py: number; h: number; dotCx: number; dotCy: number; color: Color }) => void
) {
	const R = diameterPx / 2;
	const cx = R;
	const cy = R;
	const { x0, x1, y0, y1 } = QUAD_BOUNDS[quad];
	const seed = QUAD_SEED[quad];

	const pxStart = Math.floor(x0 * diameterPx);
	const pxEnd = Math.ceil(x1 * diameterPx);
	const pyStart = Math.floor(y0 * diameterPx);
	const pyEnd = Math.ceil(y1 * diameterPx);

	for (let py = pyStart; py < pyEnd; py += CELL) {
		for (let px = pxStart; px < pxEnd; px += CELL) {
			const h = hash2(px, py, seed);
			if (h % 100 >= COVERAGE) continue;

			const jx = (((h >>> 8) & 1023) / 1023 - 0.5) * JITTER;
			const jy = (((h >>> 18) & 1023) / 1023 - 0.5) * JITTER;
			const dotCx = px + jx + GRAIN_PX / 2;
			const dotCy = py + jy + GRAIN_PX / 2;

			const dist = Math.hypot(dotCx - cx, dotCy - cy);
			if (dist > R - RIM_INSET) continue;

			const color = COLORS[h % COLORS.length];
			onSlot({ px, py, h, dotCx, dotCy, color });
		}
	}
}

export function sandDotsForQuad(
	board: BoardState,
	quad: Quad,
	diameterPx: number
): SandDot[] {
	if (diameterPx <= 0) return [];

	const dots: SandDot[] = [];

	iterateGrainSlots(quad, diameterPx, ({ h, dotCx, dotCy, color }) => {
		const share = board[quad][color];
		if (!grainVisible(h, share)) return;

		dots.push({ x: dotCx - GRAIN_PX / 2, y: dotCy - GRAIN_PX / 2, color });
	});

	return dots;
}

/** Grains for one color at an explicit share (for transitions). */
export function grainsForQuadColorShare(
	quad: Quad,
	color: Color,
	diameterPx: number,
	share: number
): SandDot[] {
	if (diameterPx <= 0 || share <= SHARE_EPSILON) return [];

	const dots: SandDot[] = [];
	iterateGrainSlots(quad, diameterPx, ({ h, dotCx, dotCy, color: assigned }) => {
		if (assigned !== color || !grainVisible(h, share)) return;
		dots.push({ x: dotCx - GRAIN_PX / 2, y: dotCy - GRAIN_PX / 2, color });
	});
	return dots;
}

/** Grains that appear when share increases from minShare to maxShare. */
export function grainsForShareIncrease(
	quad: Quad,
	color: Color,
	diameterPx: number,
	minShare: number,
	maxShare: number
): SandDot[] {
	if (diameterPx <= 0 || maxShare <= minShare + SHARE_EPSILON) return [];

	const dots: SandDot[] = [];
	iterateGrainSlots(quad, diameterPx, ({ h, dotCx, dotCy, color: assigned }) => {
		if (assigned !== color) return;
		const roll = grainRoll(h);
		if (roll >= maxShare || roll < minShare) return;
		dots.push({ x: dotCx - GRAIN_PX / 2, y: dotCy - GRAIN_PX / 2, color });
	});
	return dots;
}

export function grainsForQuadColor(
	quad: Quad,
	color: Color,
	diameterPx: number,
	board?: BoardState
): SandDot[] {
	if (!board) return grainsForQuadColorShare(quad, color, diameterPx, 1);
	return grainsForQuadColorShare(quad, color, diameterPx, board[quad][color]);
}

export function allSandDots(board: BoardState, diameterPx: number): SandDot[] {
	return QUADS.flatMap((quad) => sandDotsForQuad(board, quad, diameterPx));
}

export type AnimatedGrain = {
	x: number;
	y: number;
	color: Color;
	alpha: number;
};

export function drawSandTexture(
	ctx: CanvasRenderingContext2D,
	dots: SandDot[],
	diameterPx: number,
	dpr: number,
	animatedGrains: AnimatedGrain[] = [],
	glowProgress = 0
) {
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, diameterPx, diameterPx);

	drawQuadRims(ctx, diameterPx, glowProgress);

	const byColor: Record<Color, SandDot[]> = { red: [], white: [], blue: [], green: [] };
	for (const dot of dots) byColor[dot.color].push(dot);

	const grainBlur = glowProgress * 8;

	for (const color of COLORS) {
		const grains = byColor[color];
		if (grains.length === 0) continue;

		ctx.fillStyle = lerpHex(SAND_COLORS[color], WIN_GLOW_COLOR, glowProgress);
		if (grainBlur > 0) {
			ctx.shadowColor = WIN_GLOW_COLOR;
			ctx.shadowBlur = grainBlur;
		}

		for (const { x, y } of grains) {
			ctx.fillRect(x, y, GRAIN_PX, GRAIN_PX);
		}

		ctx.shadowBlur = 0;
	}

	for (const grain of animatedGrains) {
		ctx.globalAlpha = grain.alpha;
		ctx.fillStyle = lerpHex(SAND_COLORS[grain.color], WIN_GLOW_COLOR, glowProgress);
		if (grainBlur > 0) {
			ctx.shadowColor = WIN_GLOW_COLOR;
			ctx.shadowBlur = grainBlur;
		}
		ctx.fillRect(grain.x, grain.y, GRAIN_PX, GRAIN_PX);
	}

	ctx.shadowBlur = 0;
	ctx.globalAlpha = 1;
}
