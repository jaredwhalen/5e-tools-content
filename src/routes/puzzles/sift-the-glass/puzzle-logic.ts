export type Color = 'red' | 'white' | 'blue' | 'green';

export type Quad = 'tl' | 'tr' | 'br' | 'bl';

export const COLORS: Color[] = ['red', 'white', 'blue', 'green'];

export const QUADS: Quad[] = ['tl', 'tr', 'br', 'bl'];

/** Each color is split evenly across quadrants at start (sums to 1.0 globally). */
export const INITIAL_SHARE = 0.25;

export const SHARE_EPSILON = 0.001;

export const SAND_COLORS: Record<Color, string> = {
	red: '#ff7a18',
	white: '#f2f0ea',
	blue: '#4a90d9',
	green: '#22d45a'
};

/** Shrine layout: Fire north, Air east, Water south, Earth west → tl/tr/br/bl. */
export const QUAD_TARGET_COLOR: Record<Quad, Color> = {
	tl: 'red',
	tr: 'white',
	br: 'blue',
	bl: 'green'
};

export const ELEMENT_LABELS: Record<Color, string> = {
	red: 'Fire',
	white: 'Air',
	blue: 'Water',
	green: 'Earth'
};

/** Shared edge neighbors (not diagonal). */
export const ADJACENT: Record<Quad, [Quad, Quad]> = {
	tl: ['tr', 'bl'],
	tr: ['tl', 'br'],
	br: ['tr', 'bl'],
	bl: ['tl', 'br']
};

export type QuadState = Record<Color, number>;

export type BoardState = Record<Quad, QuadState>;

export function createInitialBoard(): BoardState {
	const board = /** @type {BoardState} */ ({});
	for (const quad of QUADS) {
		board[quad] = {
			red: INITIAL_SHARE,
			white: INITIAL_SHARE,
			blue: INITIAL_SHARE,
			green: INITIAL_SHARE
		};
	}
	return board;
}

export function hasColor(board: BoardState, quad: Quad, color: Color): boolean {
	return board[quad][color] > SHARE_EPSILON;
}

export function presentColors(board: BoardState, quad: Quad): Color[] {
	return COLORS.filter((c) => hasColor(board, quad, c));
}

export function drainColor(board: BoardState, source: Quad, color: Color, target: Quad): BoardState {
	const amount = board[source][color];
	if (amount <= SHARE_EPSILON || !ADJACENT[source].includes(target)) return board;

	const next = cloneBoard(board);
	next[source][color] = 0;
	next[target][color] += amount;
	return next;
}

export function splitColor(board: BoardState, source: Quad, color: Color): BoardState {
	const amount = board[source][color];
	if (amount <= SHARE_EPSILON) return board;

	const [a, b] = ADJACENT[source];
	const half = amount / 2;
	const next = cloneBoard(board);
	next[source][color] = 0;
	next[a][color] += half;
	next[b][color] += half;
	return next;
}

function cloneBoard(board: BoardState): BoardState {
	const next = /** @type {BoardState} */ ({});
	for (const quad of QUADS) {
		next[quad] = { ...board[quad] };
	}
	return next;
}

/** Center of each quadrant (% of circle). */
export const QUAD_CENTER: Record<Quad, { x: number; y: number }> = {
	tl: { x: 25, y: 25 },
	tr: { x: 75, y: 25 },
	br: { x: 75, y: 75 },
	bl: { x: 25, y: 75 }
};

/** Midpoint on shared edge + arrow angle (deg, 0 = right). */
export function drainControl(source: Quad, target: Quad): { x: number; y: number; angle: number } {
	const targetCenter = QUAD_CENTER[target];

	const edgeMidpoints: Record<string, { x: number; y: number }> = {
		'tl-tr': { x: 50, y: 25 },
		'tr-tl': { x: 50, y: 25 },
		'tl-bl': { x: 25, y: 50 },
		'bl-tl': { x: 25, y: 50 },
		'tr-br': { x: 75, y: 50 },
		'br-tr': { x: 75, y: 50 },
		'bl-br': { x: 50, y: 75 },
		'br-bl': { x: 50, y: 75 }
	};

	const key = `${source}-${target}`;
	const point = edgeMidpoints[key];
	const angle = (Math.atan2(targetCenter.y - point.y, targetCenter.x - point.x) * 180) / Math.PI;

	return { ...point, angle };
}

/** Each quadrant holds 100% of its home sand and none of the others. */
export function isQuadSolved(board: BoardState, quad: Quad): boolean {
	const home = QUAD_TARGET_COLOR[quad];
	for (const color of COLORS) {
		const expected = color === home ? 1 : 0;
		if (Math.abs(board[quad][color] - expected) > SHARE_EPSILON) return false;
	}
	return true;
}

export function unsolvedQuads(board: BoardState): Quad[] {
	return QUADS.filter((quad) => !isQuadSolved(board, quad));
}

/** Home element colors still unsorted — chaos mephits shift among these. */
export function unsolvedElements(board: BoardState): Color[] {
	return unsolvedQuads(board).map((quad) => QUAD_TARGET_COLOR[quad]);
}

export function isSolved(board: BoardState): boolean {
	return unsolvedQuads(board).length === 0;
}
