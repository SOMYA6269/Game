// Grid-based merge game engine
// 5 columns × 7 rows; merge 2 adjacent same-level → level+1
import type { DragonDef } from './gameTypes';

export const COLS = 5;
export const ROWS = 7;
export const MAX_SPAWN_LEVEL = 4; // only levels 1-4 spawn randomly

export type Cell = { level: number } | null;
export type Grid = Cell[][];   // [row][col]

export interface GridState {
  grid: Grid;
  selected: [number, number] | null;  // [row, col]
  score: number;
  bestScore: number;
  coins: number;
  gems: number;
  moves: number;
  maxMoves: number;
  targetMerges: number;
  mergesDone: number;
  currentLevel: number;        // world level
  isGameOver: boolean;
  isLevelComplete: boolean;
  isPaused: boolean;
  boosters: { shuffle: number; hammer: number; bomb: number };
  lastMergePos: [number, number] | null;
  highestLevel: number;
  mergeAnim: { row: number; col: number; id: string } | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function countEmpty(grid: Grid): number {
  return grid.flat().filter(c => c === null).length;
}

function randomSpawnLevel(worldLevel: number): number {
  const maxL = Math.min(MAX_SPAWN_LEVEL, Math.max(1, Math.floor(worldLevel / 2) + 1));
  const weights = [6, 4, 3, 2, 1].slice(0, maxL);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand(1, total);
  for (let i = 0; i < maxL; i++) {
    r -= weights[i];
    if (r <= 0) return i + 1;
  }
  return 1;
}

// ─── Fill grid with random animals ───────────────────────────────────────────
function fillGrid(grid: Grid, worldLevel: number, fillFraction = 0.65): Grid {
  const newGrid = grid.map(r => [...r]);
  const target = Math.floor(ROWS * COLS * fillFraction);
  let filled = newGrid.flat().filter(Boolean).length;
  const empties: [number, number][] = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!newGrid[r][c]) empties.push([r, c]);
  // Shuffle empties
  for (let i = empties.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [empties[i], empties[j]] = [empties[j], empties[i]];
  }
  for (const [r, c] of empties) {
    if (filled >= target) break;
    newGrid[r][c] = { level: randomSpawnLevel(worldLevel) };
    filled++;
  }
  return newGrid;
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function createGridState(worldLevel = 1): GridState {
  const maxMoves = 20 + worldLevel * 5;
  const targetMerges = 5 + worldLevel * 2;
  const grid = fillGrid(emptyGrid(), worldLevel);
  return {
    grid, selected: null,
    score: 0, bestScore: 0,
    coins: 120, gems: 8,
    moves: maxMoves, maxMoves,
    targetMerges, mergesDone: 0,
    currentLevel: worldLevel,
    isGameOver: false, isLevelComplete: false, isPaused: false,
    boosters: { shuffle: 3, hammer: 3, bomb: 3 },
    lastMergePos: null,
    highestLevel: 1,
    mergeAnim: null,
  };
}

// ─── Check adjacent ──────────────────────────────────────────────────────────
function isAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

// ─── Spawn one new animal ─────────────────────────────────────────────────────
function spawnOne(grid: Grid, worldLevel: number): Grid {
  const empties: [number, number][] = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!grid[r][c]) empties.push([r, c]);
  if (empties.length === 0) return grid;
  const [r, c] = empties[rand(0, empties.length - 1)];
  const newGrid = grid.map(row => [...row]);
  newGrid[r][c] = { level: randomSpawnLevel(worldLevel) };
  return newGrid;
}

// ─── Tap handler: select or merge ────────────────────────────────────────────
export function tapCell(
  state: GridState,
  row: number,
  col: number,
): GridState {
  if (state.isGameOver || state.isLevelComplete || state.isPaused) return state;
  if (state.moves <= 0) return { ...state, isGameOver: true };

  const { grid, selected, currentLevel } = state;
  const cell = grid[row][col];

  // De-select if tapping same cell
  if (selected && selected[0] === row && selected[1] === col) {
    return { ...state, selected: null };
  }

  // Select empty cell → just select (no action)
  if (!cell) {
    return { ...state, selected: null };
  }

  // No prior selection → select this cell
  if (!selected) {
    return { ...state, selected: [row, col] };
  }

  const [sr, sc] = selected;
  const selCell = grid[sr][sc];

  // Adjacent + same level → MERGE
  if (selCell && isAdjacent(sr, sc, row, col) && selCell.level === cell.level) {
    const newLevel = Math.min(selCell.level + 1, 11);
    const newGrid = grid.map(r => r.map(c => ({ ...c } as Cell)));
    newGrid[sr][sc] = null;
    newGrid[row][col] = { level: newLevel };
    const scoreGain = newLevel * newLevel * 10;
    const newMerges = state.mergesDone + 1;
    const newScore = state.score + scoreGain;
    const newMoves = state.moves - 1;
    const highestLevel = Math.max(state.highestLevel, newLevel);

    // Spawn new animal after merge
    const spawnedGrid = spawnOne(newGrid, currentLevel);

    const isLevelComplete = newMerges >= state.targetMerges;
    const isGameOver = !isLevelComplete && newMoves <= 0;

    return {
      ...state,
      grid: spawnedGrid,
      selected: null,
      score: newScore,
      bestScore: Math.max(state.bestScore, newScore),
      moves: newMoves,
      mergesDone: newMerges,
      highestLevel,
      lastMergePos: [row, col],
      isLevelComplete,
      isGameOver,
      mergeAnim: { row, col, id: `${Date.now()}` },
    };
  }

  // Different level or non-adjacent → swap selection
  return { ...state, selected: [row, col] };
}

// ─── Boosters ────────────────────────────────────────────────────────────────
export function applyShuffleSt(state: GridState): GridState {
  if (state.boosters.shuffle <= 0) return state;
  const animals: Cell[] = state.grid.flat().filter(Boolean);
  // Shuffle
  for (let i = animals.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [animals[i], animals[j]] = [animals[j], animals[i]];
  }
  const newGrid = emptyGrid();
  let idx = 0;
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (state.grid[r][c]) newGrid[r][c] = animals[idx++];
  return {
    ...state, grid: newGrid, selected: null,
    boosters: { ...state.boosters, shuffle: state.boosters.shuffle - 1 },
  };
}

export function applyHammerSt(state: GridState, row: number, col: number): GridState {
  if (state.boosters.hammer <= 0 || !state.grid[row][col]) return state;
  const newGrid = state.grid.map(r => r.map(c => c));
  newGrid[row][col] = null;
  return {
    ...state, grid: newGrid, selected: null,
    boosters: { ...state.boosters, hammer: state.boosters.hammer - 1 },
  };
}

export function applyBombSt(state: GridState, row: number, col: number): GridState {
  if (state.boosters.bomb <= 0) return state;
  const newGrid = state.grid.map(r => r.map(c => c));
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = row + dr, nc = col + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) newGrid[nr][nc] = null;
    }
  return {
    ...state, grid: newGrid, selected: null,
    boosters: { ...state.boosters, bomb: state.boosters.bomb - 1 },
  };
}

export function resetForNextLevel(state: GridState): GridState {
  const next = state.currentLevel + 1;
  return createGridState(next);
}

export function resetGrid(state: GridState): GridState {
  return createGridState(state.currentLevel);
}
