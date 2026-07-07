// Physics engine for Dragon Merge Kingdom — Production Rework v2
// Optimised for 60 FPS: in-place mutation, minimal allocations, better physics

import type {
  PhysicsObject, GameState, Particle, MergeEffect,
  ComboLabel, SpecialEvent, BombWarning,
} from './gameTypes';
import {
  getDragonDef, getRandomDropLevel, MAX_DRAGON_LEVEL,
  LEVEL_TARGETS, getComboLabel,
} from './gameData';

const GRAVITY      = 1500;   // px/s² — satisfying weight
const WALL_DAMPING = 0.45;   // lateral energy loss on wall
const FLOOR_BOUNCE = 0.28;   // vertical restitution on floor
const FLOOR_FRIC   = 0.82;   // horizontal friction on floor per frame
const OBJECT_RESTITUTION = 0.30; // energy kept after object–object collision
const MAX_VY       = 1200;   // terminal velocity
const DANGER_Y_RATIO = 0.15;

// Per-level mass (heavier dragons resist being pushed further)
const LEVEL_MASS = [1, 1.2, 1.4, 1.7, 2.0, 2.4, 2.9, 3.5, 4.2, 5.0, 6.0];

let _idCounter = 0;
const genId = () => `obj_${++_idCounter}_${Date.now()}`;

export const DANGER_RATIO = DANGER_Y_RATIO;

export function createObject(x: number, y: number, level: number): PhysicsObject {
  const def = getDragonDef(level);
  return {
    id: genId(), x, y, vx: 0, vy: 0,
    radius: def.radius, level,
    merging: false, settled: false, opacity: 0, scale: 1,
  };
}

export function tickPhysics(
  state: GameState,
  dt: number,
  boardWidth: number,
  boardHeight: number,
): { newObjects: PhysicsObject[]; merges: Array<{ a: PhysicsObject; b: PhysicsObject }> } {
  const frozen = state.freezeTimer > 0;
  // Clone shallowly once — avoid per-object spreading inside loop
  const objects: PhysicsObject[] = state.objects.map(o => ({
    id: o.id, x: o.x, y: o.y, vx: o.vx, vy: o.vy,
    radius: o.radius, level: o.level,
    merging: o.merging, settled: o.settled,
    opacity: o.opacity, scale: o.scale,
    isBomb: o.isBomb, isSpecial: o.isSpecial,
  }));
  const merges: Array<{ a: PhysicsObject; b: PhysicsObject }> = [];
  const cdt = Math.min(dt, 0.033); // cap sub-step at 33ms

  if (!frozen) {
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if (obj.merging) continue;
      const mass = LEVEL_MASS[Math.min(obj.level - 1, LEVEL_MASS.length - 1)];

      // Gravity (lighter dragons accelerate faster → more natural)
      obj.vy = Math.min(obj.vy + (GRAVITY / mass * 0.6 + GRAVITY * 0.4) * cdt, MAX_VY);
      obj.x += obj.vx * cdt;
      obj.y += obj.vy * cdt;

      // Fade in on spawn
      if (obj.opacity < 1) obj.opacity = Math.min(obj.opacity + cdt * 10, 1);
      // Squash/stretch settle
      if (obj.scale !== 1) {
        obj.scale += (1 - obj.scale) * cdt * 16;
        if (Math.abs(obj.scale - 1) < 0.005) obj.scale = 1;
      }

      // Left / right walls
      if (obj.x - obj.radius < 0) {
        obj.x = obj.radius;
        obj.vx = Math.abs(obj.vx) * WALL_DAMPING;
        obj.scale = 0.88;
      }
      if (obj.x + obj.radius > boardWidth) {
        obj.x = boardWidth - obj.radius;
        obj.vx = -Math.abs(obj.vx) * WALL_DAMPING;
        obj.scale = 0.88;
      }

      // Floor
      if (obj.y + obj.radius >= boardHeight) {
        obj.y = boardHeight - obj.radius;
        const spd = Math.abs(obj.vy);
        obj.vy = -spd * FLOOR_BOUNCE;
        obj.vx *= FLOOR_FRIC;
        if (spd < 60) {
          obj.vy = 0;
          obj.settled = true;
        } else {
          // squash on strong impact, stretch on gentle
          obj.scale = spd > 300 ? 0.75 : 0.88;
          obj.settled = false;
        }
      }
    }
  } else {
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if (obj.opacity < 1) obj.opacity = Math.min(obj.opacity + cdt * 10, 1);
      if (obj.scale !== 1) {
        obj.scale += (1 - obj.scale) * cdt * 16;
        if (Math.abs(obj.scale - 1) < 0.005) obj.scale = 1;
      }
    }
  }

  // ── Object–object collision resolution (4 passes for accuracy) ─────────
  const mergedSet = new Set<string>();
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const a = objects[i]; const b = objects[j];
        if (a.merging || b.merging) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy;
        const minDist = a.radius + b.radius;
        if (distSq >= minDist * minDist || distSq < 0.001) continue;

        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;

        // Mass-weighted position correction
        const massA = LEVEL_MASS[Math.min(a.level - 1, LEVEL_MASS.length - 1)];
        const massB = LEVEL_MASS[Math.min(b.level - 1, LEVEL_MASS.length - 1)];
        const totalMass = massA + massB;
        const pushA = overlap * (massB / totalMass);
        const pushB = overlap * (massA / totalMass);
        a.x -= nx * pushA; a.y -= ny * pushA;
        b.x += nx * pushB; b.y += ny * pushB;

        if (!frozen) {
          const dvx = a.vx - b.vx;
          const dvy = a.vy - b.vy;
          const dot = dvx * nx + dvy * ny;
          if (dot > 0) {
            const impulse = (1 + OBJECT_RESTITUTION) * dot / totalMass;
            a.vx -= impulse * nx * massB;
            a.vy -= impulse * ny * massB;
            b.vx += impulse * nx * massA;
            b.vy += impulse * ny * massA;
            a.scale = 0.88; b.scale = 0.88;
            a.settled = false; b.settled = false;
          }
        }

        // Queue merge (first pass only, each object once)
        if (pass === 0
          && a.level === b.level
          && a.level < MAX_DRAGON_LEVEL
          && !a.isBomb && !b.isBomb
          && !mergedSet.has(a.id) && !mergedSet.has(b.id)
        ) {
          merges.push({ a, b });
          a.merging = true; b.merging = true;
          mergedSet.add(a.id); mergedSet.add(b.id);
        }
      }
    }
  }
  return { newObjects: objects, merges };
}

// Shockwave ring data embedded in MergeEffect
export interface ShockwaveRing {
  id: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}

export function applyMerges(
  objects: PhysicsObject[],
  merges: Array<{ a: PhysicsObject; b: PhysicsObject }>,
  boardWidth: number,
  boardHeight: number,
  scoreMultiplier = 1,
): {
  updatedObjects: PhysicsObject[];
  effects: MergeEffect[];
  shockwaves: ShockwaveRing[];
  newParticles: Particle[];
  scoreGained: number;
} {
  const mergingIds = new Set(merges.flatMap(m => [m.a.id, m.b.id]));
  const remaining = objects.filter(o => !mergingIds.has(o.id));
  const effects: MergeEffect[] = [];
  const shockwaves: ShockwaveRing[] = [];
  const newParticles: Particle[] = [];
  let scoreGained = 0;

  const BURST_COLORS = ['#FCD34D', '#F9A8D4', '#60A5FA', '#4ADE80', '#C084FC', '#F87171', '#34D399', '#FB923C'];

  for (const { a, b } of merges) {
    const newLevel = a.level + 1;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const def = getDragonDef(newLevel);
    const cx = Math.max(def.radius, Math.min(boardWidth - def.radius, mx));
    const cy = Math.max(def.radius, Math.min(boardHeight - def.radius, my));

    const merged = createObject(cx, cy, newLevel);
    merged.scale = 1.4; // big pop
    merged.opacity = 1;
    remaining.push(merged);

    const gained = def.score * scoreMultiplier;
    scoreGained += gained;

    effects.push({ id: genId(), x: mx, y: my, level: newLevel, createdAt: Date.now(), scoreText: `+${gained}` });

    // Shockwave ring
    shockwaves.push({ id: genId(), x: mx, y: my, color: def.glowColor, createdAt: Date.now() });

    // Particle burst — 20 particles (mix circles + coins)
    for (let k = 0; k < 20; k++) {
      const angle = (k / 20) * Math.PI * 2 + Math.random() * 0.4;
      const speed = 120 + Math.random() * 180;
      newParticles.push({
        id: genId(), x: mx, y: my,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        color: k < 6 ? '#FCD34D' : BURST_COLORS[k % BURST_COLORS.length],
        size: k < 6 ? 8 : 5 + Math.random() * 6,
        life: 1,
        shape: k < 6 ? 'star' : 'circle',
      });
    }
  }

  return { updatedObjects: remaining, effects, shockwaves, newParticles, scoreGained };
}

export function tickParticles(particles: Particle[], dt: number): Particle[] {
  const result: Particle[] = [];
  for (const p of particles) {
    const life = p.life - dt * 2.0;
    if (life <= 0) continue;
    result.push({
      id: p.id,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vx: p.vx * 0.97,
      vy: p.vy + 260 * dt,
      color: p.color,
      size: p.size,
      life,
      shape: p.shape,
    });
  }
  return result;
}

export function spawnBombObject(boardWidth: number, warning: BombWarning): PhysicsObject {
  return { id: genId(), x: warning.x, y: -20, vx: 0, vy: 200, radius: 20, level: 0, merging: false, settled: false, opacity: 1, scale: 1, isBomb: true };
}

export function explodeBomb(
  objects: PhysicsObject[],
  bx: number,
  by: number,
  boardWidth: number,
  boardHeight: number,
): { updatedObjects: PhysicsObject[]; particles: Particle[]; scoreGained: number } {
  const EXPLODE_RADIUS = 80;
  const particles: Particle[] = [];
  let scoreGained = 0;
  const EXPLOSION_COLORS = ['#FCD34D', '#F97316', '#EF4444', '#FDE68A', '#FBBF24'];

  const updatedObjects = objects.filter(o => {
    if (o.isBomb) return false;
    const dist = Math.hypot(o.x - bx, o.y - by);
    if (dist < EXPLODE_RADIUS + o.radius) {
      scoreGained += getDragonDef(o.level).score * 0.5;
      return false;
    }
    return true;
  }).map(o => {
    const dist = Math.hypot(o.x - bx, o.y - by);
    const pushRange = EXPLODE_RADIUS * 2.5;
    if (dist < pushRange) {
      const force = (1 - dist / pushRange) * 600;
      const ang = Math.atan2(o.y - by, o.x - bx);
      return { ...o, vx: o.vx + Math.cos(ang) * force, vy: o.vy + Math.sin(ang) * force - 200, settled: false };
    }
    return o;
  });

  for (let k = 0; k < 24; k++) {
    const angle = (k / 24) * Math.PI * 2;
    const speed = 150 + Math.random() * 200;
    particles.push({
      id: genId(), x: bx, y: by,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 120,
      color: EXPLOSION_COLORS[k % EXPLOSION_COLORS.length],
      size: 6 + Math.random() * 10, life: 1, shape: 'circle',
    });
  }
  return { updatedObjects, particles, scoreGained: Math.round(scoreGained) };
}

export function applyMagnet(objects: PhysicsObject[]): PhysicsObject[] {
  const levelGroups: Record<number, PhysicsObject[]> = {};
  for (const o of objects) {
    if (!levelGroups[o.level]) levelGroups[o.level] = [];
    levelGroups[o.level].push(o);
  }
  return objects.map(o => {
    const group = levelGroups[o.level];
    if (!group || group.length < 2) return o;
    const others = group.filter(g => g.id !== o.id);
    const nearest = others.reduce((best, cur) =>
      Math.hypot(cur.x - o.x, cur.y - o.y) < Math.hypot(best.x - o.x, best.y - o.y) ? cur : best
    );
    const dx = nearest.x - o.x; const dy = nearest.y - o.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 5) {
      const force = 220 / dist;
      return { ...o, vx: o.vx + dx * force, vy: o.vy + dy * force, settled: false };
    }
    return o;
  });
}

export function checkDangerLine(
  objects: PhysicsObject[],
  boardHeight: number,
): boolean {
  const dangerY = boardHeight * DANGER_RATIO;
  return objects.some(o => !o.merging && !o.isBomb && o.y - o.radius < dangerY && o.settled);
}

export function checkLevelComplete(score: number, currentLevel: number): boolean {
  const target = LEVEL_TARGETS[Math.min(currentLevel - 1, LEVEL_TARGETS.length - 1)];
  return score >= target;
}

export function getLevelTarget(currentLevel: number): number {
  return LEVEL_TARGETS[Math.min(currentLevel - 1, LEVEL_TARGETS.length - 1)];
}

export function buildComboLabel(combo: number, x: number, y: number): ComboLabel {
  const { text, color } = getComboLabel(combo);
  return { id: genId(), text, color, x, y, createdAt: Date.now() };
}

export function pickSpecialEvent(): SpecialEvent {
  const events: SpecialEvent[] = [
    { type: 'coin_rain',    label: 'Coin Rain!',       emoji: '🪙', duration: 8,  color: '#F59E0B' },
    { type: 'double_score', label: '2× Score!',        emoji: '⚡', duration: 10, color: '#8B5CF6' },
    { type: 'freeze_time',  label: 'Time Freeze!',     emoji: '❄️', duration: 5,  color: '#3B82F6' },
    { type: 'golden_dragon',label: 'Golden Dragon!',   emoji: '👑', duration: 0,  color: '#EAB308' },
    { type: 'mystery_egg',  label: 'Mystery Egg!',     emoji: '🥚', duration: 0,  color: '#EC4899' },
  ];
  return events[Math.floor(Math.random() * events.length)];
}

export function createInitialState(): GameState {
  return {
    objects: [], score: 0, bestScore: 0, coins: 1000, gems: 120,
    nextLevel: getRandomDropLevel(),
    currentLevel: 1,
    levelTarget: LEVEL_TARGETS[0],
    isGameOver: false, isLevelComplete: false, isPaused: false,
    mergeEffects: [], particles: [], comboLabels: [],
    boosters: { undo: 3, bomb: 1, magnet: 1, freeze: 2, rainbow: 1 },
    lastDroppedId: null, canDrop: true, dropX: 0,
    combo: 0, comboTimer: 0,
    dangerTimer: 0, doubleScoreTimer: 0, freezeTimer: 0,
    specialEvent: null, bombWarning: null,
    nextBombIn: 20 + Math.random() * 20,
    nextEventIn: 15 + Math.random() * 15,
    totalMerges: 0, highestCombo: 0,
  };
}
