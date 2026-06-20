import { QUAD_CENTER, QUADS, COLORS, SHARE_EPSILON, type BoardState, type Color, type Quad } from './puzzle-logic';
import {
	grainsForQuadColorShare,
	grainsForShareIncrease,
	type AnimatedGrain,
	type SandDot
} from './sand-texture';

const DURATION_MS = 520;
const STAGGER_MS = 14;
const MAX_STAGGER = 280;

export type TransitionMeta = {
	color: Color;
	source: Quad;
	targets: Quad[];
	oldBoard: BoardState;
};

type Particle = {
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	color: Color;
	delay: number;
	mode: 'out' | 'in';
};

function quadCenterPx(quad: Quad, diameterPx: number) {
	return {
		x: (QUAD_CENTER[quad].x / 100) * diameterPx,
		y: (QUAD_CENTER[quad].y / 100) * diameterPx
	};
}

function easeOutCubic(t: number) {
	return 1 - (1 - t) ** 3;
}

function buildParticles(meta: TransitionMeta, board: BoardState, diameterPx: number): Particle[] {
	const { color, source, targets, oldBoard } = meta;
	const sourceShare = oldBoard[source][color];
	const leaving = grainsForQuadColorShare(source, color, diameterPx, sourceShare);
	const sourceCenter = quadCenterPx(source, diameterPx);
	const particles: Particle[] = [];

	for (let i = 0; i < leaving.length; i++) {
		const target = targets[i % targets.length];
		const targetCenter = quadCenterPx(target, diameterPx);
		particles.push({
			fromX: leaving[i].x,
			fromY: leaving[i].y,
			toX: targetCenter.x,
			toY: targetCenter.y,
			color,
			delay: Math.min((i % 24) * STAGGER_MS, MAX_STAGGER),
			mode: 'out'
		});
	}

	for (const target of targets) {
		const oldShare = oldBoard[target][color];
		const newShare = board[target][color];
		if (newShare <= oldShare + SHARE_EPSILON) continue;

		const entering = grainsForShareIncrease(target, color, diameterPx, oldShare, newShare);
		for (let i = 0; i < entering.length; i++) {
			particles.push({
				fromX: sourceCenter.x,
				fromY: sourceCenter.y,
				toX: entering[i].x,
				toY: entering[i].y,
				color,
				delay: Math.min((i % 24) * STAGGER_MS + 40, MAX_STAGGER + 40),
				mode: 'in'
			});
		}
	}

	return particles;
}

export function staticDotsForTransition(
	board: BoardState,
	diameterPx: number,
	meta: TransitionMeta
): SandDot[] {
	const targetSet = new Set(meta.targets);
	const dots: SandDot[] = [];

	for (const quad of QUADS) {
		for (const color of COLORS) {
			let share = board[quad][color];

			if (color === meta.color) {
				if (quad === meta.source) continue;
				if (targetSet.has(quad)) share = meta.oldBoard[quad][color];
			}

			dots.push(...grainsForQuadColorShare(quad, color, diameterPx, share));
		}
	}

	return dots;
}

export function runSandTransition(
	board: BoardState,
	meta: TransitionMeta,
	diameterPx: number,
	onFrame: (dots: SandDot[], grains: AnimatedGrain[]) => void,
	onComplete: () => void
): () => void {
	const particles = buildParticles(meta, board, diameterPx);
	const start = performance.now();
	let rafId = 0;

	function frame(now: number) {
		const elapsed = now - start;
		const grains: AnimatedGrain[] = [];

		for (const p of particles) {
			const local = elapsed - p.delay;
			if (local <= 0) {
				if (p.mode === 'out') {
					grains.push({ x: p.fromX, y: p.fromY, color: p.color, alpha: 1 });
				}
				continue;
			}

			const t = easeOutCubic(Math.min(local / DURATION_MS, 1));
			const x = p.fromX + (p.toX - p.fromX) * t;
			const y = p.fromY + (p.toY - p.fromY) * t;
			const alpha = p.mode === 'out' ? 1 - t : t;

			if (alpha > 0.02) {
				grains.push({ x, y, color: p.color, alpha });
			}
		}

		onFrame(staticDotsForTransition(board, diameterPx, meta), grains);

		if (elapsed <= DURATION_MS + MAX_STAGGER + 60) {
			rafId = requestAnimationFrame(frame);
		} else {
			onComplete();
		}
	}

	rafId = requestAnimationFrame(frame);
	return () => cancelAnimationFrame(rafId);
}
