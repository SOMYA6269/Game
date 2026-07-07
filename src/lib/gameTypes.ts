// Core game types for Dragon Merge Kingdom

export interface DragonDef {
  level: number;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  glowColor: string;
  radius: number;
  score: number;
  rarity: 'common' | 'rare' | 'legendary';
}

export interface PhysicsObject {
  id: string;
  x: number;       // center x
  y: number;       // center y
  vx: number;
  vy: number;
  radius: number;
  level: number;
  merging: boolean;
  settled: boolean;
  opacity: number; // for spawn/merge animations
  scale: number;   // for bounce squash effect
}

export interface MergeEffect {
  id: string;
  x: number;
  y: number;
  level: number;
  createdAt: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number; // 0-1, decreases over time
}

export interface GameState {
  objects: PhysicsObject[];
  score: number;
  bestScore: number;
  coins: number;
  gems: number;
  nextLevel: number;
  currentLevel: number;
  isGameOver: boolean;
  isPaused: boolean;
  mergeEffects: MergeEffect[];
  particles: Particle[];
  boosters: {
    undo: number;
    shake: number;
    bomb: number;
    magnet: number;
  };
  lastDroppedId: string | null;
  canDrop: boolean;
  dropX: number;
  combo: number;
  comboTimer: number;
}

export interface WorldLevel {
  id: number;
  name: string;
  x: number;
  y: number;
  stars: number;
  locked: boolean;
  islandType: 'forest' | 'volcano' | 'castle' | 'ocean' | 'sky';
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  currency: 'coins' | 'gems';
  description: string;
  type: 'booster' | 'pack';
}
