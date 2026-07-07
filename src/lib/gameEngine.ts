// Physics engine for Dragon Merge Kingdom — Production Rework
// Pure JS, works on iOS, Android, and Web

import type {
  PhysicsObject, GameState, Particle, MergeEffect,
  ComboLabel, SpecialEvent, BombWarning,
} from './gameTypes';
import {
  getDragonDef, getRandomDropLevel, MAX_DRAGON_LEVEL,
  LEVEL_TARGETS, getComboLabel,
} from './gameData';

const GRAVITY = 1400;      // px/s²  (snappier feel)
const DAMPING = 0.50;      // velocity damping on wall bounce
const FRICTION = 0.88;     // floor friction
const RESTITUTION = 0.35;  // bounciness
const MAX_VY = 1000;       // terminal velocity
const DANGER_Y_RATIO = 0.15; // danger line at 15% from top of board

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
  const objects = state.objects.map(o => ({ ...o }));
  const merges: Array<{ a: PhysicsObject; b: PhysicsObject }> = [];
  const clampedDt = Math.min(dt, 0.05);

  if (!frozen) {
    for (const obj of objects) {
      if (obj.merging) continue;
      obj.vy = Math.min(obj.vy + GRAVITY * clampedDt, MAX_VY);
      obj.x += obj.vx * clampedDt;
      obj.y += obj.vy * clampedDt;

      if (obj.opacity < 1) obj.opacity = Math.min(obj.opacity + clampedDt * 8, 1);
      if (obj.scale !== 1) {
        obj.scale += (1 - obj.scale) * clampedDt * 14;
        if (Math.abs(obj.scale - 1) < 0.01) obj.scale = 1;
      }

      if (obj.x - obj.radius < 0) { obj.x = obj.radius; obj.vx = Math.abs(obj.vx) * DAMPING; obj.scale = 0.85; }
      if (obj.x + obj.radius > boardWidth) { obj.x = boardWidth - obj.radius; obj.vx = -Math.abs(obj.vx) * DAMPING; obj.scale = 0.85; }
      if (obj.y + obj.radius >= boardHeight) {
        obj.y = boardHeight - obj.radius;
        const speed = Math.abs(obj.vy);
        obj.vy = -speed * DAMPING;
        obj.vx *= FRICTION;
        if (speed < 40) { obj.vy = 0; obj.settled = true; } else { obj.scale = 0.82; obj.settled = false; }
      }
    }
  } else {
    // Still fade in + scale settle while frozen
    for (const obj of objects) {
      if (obj.opacity < 1) obj.opacity = Math.min(obj.opacity + clampedDt * 8, 1);
      if (obj.scale !== 1) {
        obj.scale += (1 - obj.scale) * clampedDt * 14;
        if (Math.abs(obj.scale - 1) < 0.01) obj.scale = 1;
      }
    }
  }

  // Collision resolution (3 passes)
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const a = objects[i]; const b = objects[j];
        if (a.merging || b.merging) continue;
        const dx = b.x - a.x; const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy;
        const minDist = a.radius + b.radius;
        if (distSq < minDist * minDist && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist; const ny = dy / dist;
          const overlap = minDist - dist;
          a.x -= nx * overlap * 0.5; a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5; b.y += ny * overlap * 0.5;
          if (!frozen) {
            const dvx = a.vx - b.vx; const dvy = a.vy - b.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot > 0) {
              const impulse = (1 + RESTITUTION) * dot * 0.5;
              a.vx -= impulse * nx; a.vy -= impulse * ny;
              b.vx += impulse * nx; b.vy += impulse * ny;
              a.scale = 0.87; b.scale = 0.87;
            }
          }
          if (pass === 0 && a.level === b.level && a.level < MAX_DRAGON_LEVEL && !a.isBomb && !b.isBomb) {
            merges.push({ a, b }); a.merging = true; b.merging = true;
          }
        }
      }
    }
  }
  return { newObjects: objects, merges };
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
  newParticles: Particle[];
  scoreGained: number;
  newComboLabels: ComboLabel[];
} {
  const mergingIds = new Set(merges.flatMap(m => [m.a.id, m.b.id]));
  const remaining = objects.filter(o => !mergingIds.has(o.id));
  const effects: MergeEffect[] = [];
  const newParticles: Particle[] = [];
  const newComboLabels: ComboLabel[] = [];
  let scoreGained = 0;

  const BURST_COLORS = ['#FCD34D', '#F9A8D4', '#60A5FA', '#4ADE80', '#C084FC', '#F87171', '#34D399', '#FB923C'];

  for (const { a, b } of merges) {
    const newLevel = a.level + 1;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const def = getDragonDef(newLevel);
    const clampedX = Math.max(def.radius, Math.min(boardWidth - def.radius, mx));
    const clampedY = Math.max(def.radius, Math.min(boardHeight - def.radius, my));

    const merged = createObject(clampedX, clampedY, newLevel);
    merged.scale = 1.35;
    remaining.push(merged);

    const gained = def.score * scoreMultiplier;
    scoreGained += gained;

    effects.push({ id: genId(), x: mx, y: my, level: newLevel, createdAt: Date.now(), scoreText: `+${gained}` });

    // Big burst — 16 particles
    for (let k = 0; k < 16; k++) {
      const angle = (k / 16) * Math.PI * 2 + Math.random() * 0.3;
      const speed = 100 + Math.random() * 160;
      newParticles.push({
        id: genId(), x: mx, y: my,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        color: BURST_COLORS[k % BURST_COLORS.length],
        size: 5 + Math.random() * 7,
        life: 1,
        shape: Math.random() > 0.5 ? 'star' : 'circle',
      });
    }
  }

  return { updatedObjects: remaining, effects, newParticles, scoreGained, newComboLabels };
}

export function tickParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map(p => ({ ...p, x: p.x + p.vx * dt, y: p.y + p.vy * dt, vy: p.vy + 240 * dt, life: p.life - dt * 2.2 }))
    .filter(p => p.life > 0);
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
