/**
 * Suika-style drop & merge physics engine.
 * Pure JS — no native modules needed.
 * Circle-based collisions + gravity + wall bounds + merge detection.
 * Level progression: score targets per level, game-over at danger line.
 */

import { ANIMAL_DEFS } from '../components/game/AnimalAvatar';

export const MAX_LEVEL = 10;

// Score required to clear each level (index 0 = level 1)
export const LEVEL_TARGETS = [500, 900, 1400, 2000, 2800, 3800, 5000, 6500, 8500, 11000];

export function getLevelTarget(level: number): number {
  return LEVEL_TARGETS[Math.min(level - 1, LEVEL_TARGETS.length - 1)] ?? 99999;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PhysicsCircle {
  id: string;
  x: number;        // center x
  y: number;        // center y
  vx: number;
  vy: number;
  level: number;
  radius: number;
  settled: boolean;  // not actively moving much
  mergeWith?: string; // id of partner to merge with
  isNew: boolean;    // just dropped / just merged (skip collision briefly)
  newTimer: number;  // frames to skip collision
}

export interface PhysicsState {
  circles: PhysicsCircle[];
  boardW: number;
  boardH: number;
  dangerY: number;   // Y threshold for game over check
  dangerTimer: number; // frames above danger line
  score: number;
  bestScore: number;
  coins: number;
  gems: number;
  nextLevel: number;
  dropping: boolean;  // whether current animal is still falling (user-controlled)
  dropX: number;      // current drop X position
  dropLevel: number;  // level of animal being dropped
  isGameOver: boolean;
  pendingMerges: MergeEvent[];
  highestLevel: number;
  droppedId: string | null; // ID of the last-dropped circle (to detect settle/merge)
  dropCooldown: number;     // fallback frame counter — allows next drop after timeout
}

export interface MergeEvent {
  id: string;
  x: number;
  y: number;
  level: number;
  score: number;
}

const GRAVITY     = 0.45;
const RESTITUTION = 0.12;   // bounciness
const FRICTION    = 0.88;
const SLEEP_THRESHOLD = 0.08;
const DANGER_FRAMES   = 90;  // 3 seconds at 30fps
const NEW_TIMER_FRAMES= 6;
const DROP_COOLDOWN_FRAMES = 50; // max frames before next drop is always allowed

let _idCounter = 0;
function newId() { return `c${++_idCounter}`; }

function getRadius(level: number): number {
  const def = ANIMAL_DEFS[Math.min(level, MAX_LEVEL) - 1];
  return def?.radius ?? 22;
}

// Weighted spawn — 6 levels with varied probability for gameplay variety
const SPAWN_TABLE: [number, number][] = [
  [1, 0.20], // Baby Egg
  [2, 0.22], // Baby Bunny
  [3, 0.20], // Baby Panda
  [4, 0.16], // Baby Fox
  [5, 0.14], // Baby Penguin
  [6, 0.08], // Baby Dragon (rare treat)
];
function randNextLevel(): number {
  const r = Math.random();
  let cum = 0;
  for (const [lvl, w] of SPAWN_TABLE) {
    cum += w;
    if (r < cum) return lvl;
  }
  return 1;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
export function createPhysicsState(boardW: number, boardH: number): PhysicsState {
  const nextLevel = randNextLevel();
  return {
    circles: [],
    boardW, boardH,
    dangerY: boardH * 0.14,
    dangerTimer: 0,
    score: 0, bestScore: 0,
    coins: 120, gems: 8,
    nextLevel,
    dropping: false,
    dropX: boardW / 2,
    dropLevel: nextLevel,
    isGameOver: false,
    pendingMerges: [],
    highestLevel: 1,
    droppedId: null,
    dropCooldown: 0,
  };
}

// ─── Drop animal ──────────────────────────────────────────────────────────────
export function dropAnimal(state: PhysicsState, x: number): PhysicsState {
  if (state.dropping || state.isGameOver) return state;
  const level = state.dropLevel;
  const radius = getRadius(level);
  const circle: PhysicsCircle = {
    id: newId(),
    x: Math.max(radius, Math.min(state.boardW - radius, x)),
    y: radius + 10,
    vx: 0, vy: 1,
    level, radius,
    settled: false,
    isNew: true,
    newTimer: NEW_TIMER_FRAMES,
  };
  const nextLevel = randNextLevel();
  return {
    ...state,
    circles: [...state.circles, circle],
    dropping: true,
    dropLevel: nextLevel,
    nextLevel,
    dropX: state.boardW / 2,
    droppedId: circle.id,
    dropCooldown: DROP_COOLDOWN_FRAMES,
  };
}

// ─── Move drop position ───────────────────────────────────────────────────────
export function moveDrop(state: PhysicsState, x: number): PhysicsState {
  if (!state.dropping && !state.isGameOver) {
    return { ...state, dropX: Math.max(30, Math.min(state.boardW - 30, x)) };
  }
  return state;
}

// ─── Physics tick (call ~30fps) ───────────────────────────────────────────────
export function tickPhysics(state: PhysicsState): PhysicsState {
  if (state.isGameOver) return state;

  let circles = state.circles.map(c => ({ ...c }));
  const { boardW, boardH } = state;
  const pendingMerges: MergeEvent[] = [];
  let newScore = state.score;
  let highestLevel = state.highestLevel;

  // ── Step 1: Apply gravity + update positions ──
  circles = circles.map(c => {
    if (c.newTimer > 0) return { ...c, newTimer: c.newTimer - 1, vy: c.vy + GRAVITY };
    return {
      ...c,
      vx: c.vx * FRICTION,
      vy: c.vy + GRAVITY,
      x: c.x + c.vx,
      y: c.y + c.vy,
    };
  });

  // ── Step 2: Wall collisions ──
  circles = circles.map(c => {
    let { x, y, vx, vy, radius } = c;
    // Left wall
    if (x - radius < 0) { x = radius; vx = Math.abs(vx) * RESTITUTION; }
    // Right wall
    if (x + radius > boardW) { x = boardW - radius; vx = -Math.abs(vx) * RESTITUTION; }
    // Bottom wall
    if (y + radius > boardH) { y = boardH - radius; vy = -Math.abs(vy) * RESTITUTION; vx *= FRICTION; }
    // Top wall (bounce back)
    if (y - radius < 0) { y = radius; vy = Math.abs(vy) * RESTITUTION; }
    return { ...c, x, y, vx, vy };
  });

  // ── Step 3: Circle-circle collisions ──
  for (let i = 0; i < circles.length; i++) {
    for (let j = i + 1; j < circles.length; j++) {
      const a = circles[i], b = circles[j];
      if (a.isNew && a.newTimer > 0) continue;
      if (b.isNew && b.newTimer > 0) continue;

      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.radius + b.radius;

      if (dist < minDist && dist > 0.01) {
        // Check merge
        if (a.level === b.level && !a.mergeWith && !b.mergeWith) {
          circles[i] = { ...a, mergeWith: b.id };
          circles[j] = { ...b, mergeWith: a.id };
          continue;
        }

        // Push apart
        const nx = dx / dist, ny = dy / dist;
        const overlap = (minDist - dist) * 0.5;
        circles[i] = { ...circles[i], x: a.x - nx * overlap, y: a.y - ny * overlap };
        circles[j] = { ...circles[j], x: b.x + nx * overlap, y: b.y + ny * overlap };

        // Transfer velocity
        const dvx = b.vx - a.vx, dvy = b.vy - a.vy;
        const dot = dvx * nx + dvy * ny;
        if (dot < 0) {
          const impulse = dot * RESTITUTION;
          circles[i] = { ...circles[i], vx: a.vx + nx * impulse, vy: a.vy + ny * impulse };
          circles[j] = { ...circles[j], vx: b.vx - nx * impulse, vy: b.vy - ny * impulse };
        }
      }
    }
  }

  // ── Step 4: Process merges ──
  const toRemove = new Set<string>();
  const toAdd: PhysicsCircle[] = [];

  for (const c of circles) {
    if (!c.mergeWith || toRemove.has(c.id)) continue;
    const partner = circles.find(x => x.id === c.mergeWith);
    if (!partner || toRemove.has(partner.id)) continue;

    toRemove.add(c.id);
    toRemove.add(partner.id);

    const newLevel = Math.min(c.level + 1, MAX_LEVEL);
    const newRadius = getRadius(newLevel);
    const mx = (c.x + partner.x) / 2;
    const my = (c.y + partner.y) / 2;
    const def = ANIMAL_DEFS[newLevel - 1];
    const scoreGain = def?.score ?? newLevel * 50;
    newScore += scoreGain;
    highestLevel = Math.max(highestLevel, newLevel);

    pendingMerges.push({ id: newId(), x: mx, y: my, level: newLevel, score: scoreGain });

    toAdd.push({
      id: newId(),
      x: mx, y: my,
      vx: (c.vx + partner.vx) * 0.3,
      vy: (c.vy + partner.vy) * 0.3 - 1.5,
      level: newLevel, radius: newRadius,
      settled: false, isNew: true, newTimer: NEW_TIMER_FRAMES,
    });
  }

  circles = circles.filter(c => !toRemove.has(c.id));
  circles = [...circles, ...toAdd];

  // ── Step 5: Sleep detection ──
  circles = circles.map(c => ({
    ...c,
    settled: Math.abs(c.vx) < SLEEP_THRESHOLD && Math.abs(c.vy) < SLEEP_THRESHOLD,
    isNew: c.newTimer > 0,
  }));

  // ── Step 6: Dropping state — unlock when dropped circle settles, merges away, or cooldown expires ──
  let dropping = state.dropping;
  let dropCooldown = state.dropping ? Math.max(0, state.dropCooldown - 1) : 0;
  let droppedId = state.droppedId;

  if (dropping) {
    const stillExists = droppedId ? circles.some(c => c.id === droppedId) : false;
    const droppedCircle = droppedId ? circles.find(c => c.id === droppedId) : null;
    // Unlock if: circle settled, circle was merged away, or cooldown ran out
    if (!stillExists || (droppedCircle && droppedCircle.settled) || dropCooldown === 0) {
      dropping = false;
      droppedId = null;
      dropCooldown = 0;
    }
  }

  // ── Step 7: Danger line check ──
  const aboveDanger = circles.some(c => c.y - c.radius < state.dangerY && c.settled);
  let dangerTimer = aboveDanger ? state.dangerTimer + 1 : 0;
  const isGameOver = dangerTimer >= DANGER_FRAMES;

  return {
    ...state,
    circles,
    dropping,
    droppedId,
    dropCooldown,
    score: newScore,
    bestScore: Math.max(state.bestScore, newScore),
    pendingMerges,
    highestLevel,
    dangerTimer,
    isGameOver,
  };
}

// ─── Booster: Undo (remove last dropped) ─────────────────────────────────────
export function applyUndo(state: PhysicsState): PhysicsState {
  if (state.circles.length === 0) return state;
  return { ...state, circles: state.circles.slice(0, -1), dropping: false, droppedId: null, dropCooldown: 0 };
}

// ─── Booster: Bomb (clear center area) ───────────────────────────────────────
export function applyBomb(state: PhysicsState): PhysicsState {
  const cx = state.boardW / 2, cy = state.boardH / 2;
  const R = state.boardW * 0.3;
  return {
    ...state,
    circles: state.circles.filter(c => {
      const dx = c.x - cx, dy = c.y - cy;
      return dx*dx + dy*dy > R*R;
    }),
  };
}

// ─── Reset ────────────────────────────────────────────────────────────────────
export function resetPhysics(state: PhysicsState): PhysicsState {
  return createPhysicsState(state.boardW, state.boardH);
}
