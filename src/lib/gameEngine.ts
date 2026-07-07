// Physics engine for Dragon Merge Kingdom
// Pure JS, works on iOS, Android, and Web

import type { PhysicsObject, GameState, Particle, MergeEffect } from './gameTypes';
import { getDragonDef, getRandomDropLevel, MAX_DRAGON_LEVEL } from './gameData';

const GRAVITY = 1200;      // px/s²
const DAMPING = 0.55;      // velocity damping on wall bounce
const FRICTION = 0.92;     // floor friction
const RESTITUTION = 0.3;   // bounciness between objects
const MAX_VY = 900;        // terminal velocity

let _idCounter = 0;
const genId = () => `obj_${++_idCounter}_${Date.now()}`;

export function createObject(
  x: number,
  y: number,
  level: number
): PhysicsObject {
  const def = getDragonDef(level);
  return {
    id: genId(),
    x,
    y,
    vx: 0,
    vy: 0,
    radius: def.radius,
    level,
    merging: false,
    settled: false,
    opacity: 0,  // start invisible, fade in
    scale: 1,
  };
}

export function tickPhysics(
  state: GameState,
  dt: number, // seconds
  boardWidth: number,
  boardHeight: number
): { newObjects: PhysicsObject[]; merges: Array<{ a: PhysicsObject; b: PhysicsObject }> } {
  const objects = state.objects.map(o => ({ ...o }));
  const merges: Array<{ a: PhysicsObject; b: PhysicsObject }> = [];

  const clampedDt = Math.min(dt, 0.05); // cap delta to avoid tunneling

  // Integrate velocity & position
  for (const obj of objects) {
    if (obj.merging) continue;

    // Gravity
    obj.vy = Math.min(obj.vy + GRAVITY * clampedDt, MAX_VY);

    // Position update
    obj.x += obj.vx * clampedDt;
    obj.y += obj.vy * clampedDt;

    // Fade in new objects
    if (obj.opacity < 1) {
      obj.opacity = Math.min(obj.opacity + clampedDt * 6, 1);
    }

    // Scale bounce
    if (obj.scale !== 1) {
      obj.scale += (1 - obj.scale) * clampedDt * 12;
      if (Math.abs(obj.scale - 1) < 0.01) obj.scale = 1;
    }

    // Left wall
    if (obj.x - obj.radius < 0) {
      obj.x = obj.radius;
      obj.vx = Math.abs(obj.vx) * DAMPING;
      obj.scale = 0.85;
    }
    // Right wall
    if (obj.x + obj.radius > boardWidth) {
      obj.x = boardWidth - obj.radius;
      obj.vx = -Math.abs(obj.vx) * DAMPING;
      obj.scale = 0.85;
    }
    // Floor
    if (obj.y + obj.radius >= boardHeight) {
      obj.y = boardHeight - obj.radius;
      const speed = Math.abs(obj.vy);
      obj.vy = -speed * DAMPING;
      obj.vx *= FRICTION;
      if (speed < 40) {
        obj.vy = 0;
        obj.settled = true;
      } else {
        obj.scale = 0.8;
        obj.settled = false;
      }
    }
  }

  // Circle-circle collision resolution (multiple passes for stability)
  const passes = 3;
  for (let pass = 0; pass < passes; pass++) {
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const a = objects[i];
        const b = objects[j];
        if (a.merging || b.merging) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy;
        const minDist = a.radius + b.radius;

        if (distSq < minDist * minDist && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;

          // Push apart
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;

          // Velocity exchange
          const dvx = a.vx - b.vx;
          const dvy = a.vy - b.vy;
          const dot = dvx * nx + dvy * ny;

          if (dot > 0) {
            const impulse = (1 + RESTITUTION) * dot * 0.5;
            a.vx -= impulse * nx;
            a.vy -= impulse * ny;
            b.vx += impulse * nx;
            b.vy += impulse * ny;

            // squash on impact
            a.scale = 0.88;
            b.scale = 0.88;
          }

          // Check merge eligibility (pass=0 only to avoid duplicates)
          if (pass === 0 && a.level === b.level && a.level < MAX_DRAGON_LEVEL) {
            merges.push({ a, b });
            a.merging = true;
            b.merging = true;
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
  boardHeight: number
): { updatedObjects: PhysicsObject[]; effects: MergeEffect[]; newParticles: Particle[]; scoreGained: number } {
  const mergingIds = new Set(merges.flatMap(m => [m.a.id, m.b.id]));
  const remaining = objects.filter(o => !mergingIds.has(o.id));

  const effects: MergeEffect[] = [];
  const newParticles: Particle[] = [];
  let scoreGained = 0;

  for (const { a, b } of merges) {
    const newLevel = a.level + 1;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;

    // Clamp to board
    const def = getDragonDef(newLevel);
    const clampedX = Math.max(def.radius, Math.min(boardWidth - def.radius, mx));
    const clampedY = Math.max(def.radius, Math.min(boardHeight - def.radius, my));

    const merged = createObject(clampedX, clampedY, newLevel);
    merged.opacity = 0;
    merged.scale = 1.3; // pop effect
    remaining.push(merged);

    // Score
    scoreGained += def.score;

    // Merge effect
    effects.push({ id: genId(), x: mx, y: my, level: newLevel, createdAt: Date.now() });

    // Particles burst
    const colors = ['#FCD34D', '#F9A8D4', '#60A5FA', '#4ADE80', '#C084FC', '#F87171'];
    for (let k = 0; k < 12; k++) {
      const angle = (k / 12) * Math.PI * 2;
      const speed = 80 + Math.random() * 120;
      newParticles.push({
        id: genId(),
        x: mx,
        y: my,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        color: colors[k % colors.length],
        size: 4 + Math.random() * 6,
        life: 1,
      });
    }
  }

  return { updatedObjects: remaining, effects, newParticles, scoreGained };
}

export function tickParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vy: p.vy + 200 * dt,
      life: p.life - dt * 2.5,
    }))
    .filter(p => p.life > 0);
}

export function shakeBoard(objects: PhysicsObject[]): PhysicsObject[] {
  return objects.map(o => ({
    ...o,
    vx: (Math.random() - 0.5) * 300,
    vy: -100 - Math.random() * 200,
    settled: false,
    scale: 0.85,
  }));
}

export function removeBombTarget(
  objects: PhysicsObject[],
  targetId: string
): PhysicsObject[] {
  return objects.filter(o => o.id !== targetId);
}

export function applyMagnet(objects: PhysicsObject[]): PhysicsObject[] {
  // Group same-level objects toward each other
  const levelGroups: Record<number, PhysicsObject[]> = {};
  for (const o of objects) {
    if (!levelGroups[o.level]) levelGroups[o.level] = [];
    levelGroups[o.level].push(o);
  }

  return objects.map(o => {
    const group = levelGroups[o.level];
    if (group.length < 2) return o;
    // Attract toward nearest same-level
    const others = group.filter(g => g.id !== o.id);
    const nearest = others.reduce((best, cur) => {
      const db = Math.hypot(best.x - o.x, best.y - o.y);
      const dc = Math.hypot(cur.x - o.x, cur.y - o.y);
      return dc < db ? cur : best;
    });
    const dx = nearest.x - o.x;
    const dy = nearest.y - o.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 5) {
      const force = 200 / dist;
      return { ...o, vx: o.vx + dx * force, vy: o.vy + dy * force, settled: false };
    }
    return o;
  });
}

export function checkGameOver(
  objects: PhysicsObject[],
  boardHeight: number,
  dropZoneY: number
): boolean {
  // Game over if any settled object occupies the drop zone
  return objects.some(o => !o.merging && o.y - o.radius < dropZoneY && o.settled);
}

export function createInitialState(): GameState {
  return {
    objects: [],
    score: 0,
    bestScore: 0,
    coins: 1000,
    gems: 120,
    nextLevel: getRandomDropLevel(),
    currentLevel: 1,
    isGameOver: false,
    isPaused: false,
    mergeEffects: [],
    particles: [],
    boosters: { undo: 3, shake: 2, bomb: 1, magnet: 1 },
    lastDroppedId: null,
    canDrop: true,
    dropX: 0,
    combo: 0,
    comboTimer: 0,
  };
}
