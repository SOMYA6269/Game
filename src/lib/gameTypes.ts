// Core game types for Dragon Merge Kingdom

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface DragonDef {
  level: number;
  name: string;
  emoji: string;
  face: string;        // face emoji for cute expression
  color: string;       // primary bright color
  bgColor: string;     // circle background
  borderColor: string; // bright border
  glowColor: string;
  radius: number;
  score: number;
  rarity: Rarity;
  description: string;
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
  isBomb?: boolean;
  isSpecial?: boolean;
}

export interface MergeEffect {
  id: string;
  x: number;
  y: number;
  level: number;
  createdAt: number;
  scoreText: string;
}

export interface ShockwaveRing {
  id: string;
  x: number;
  y: number;
  color: string;
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
  shape?: 'circle' | 'star';
}

export interface ComboLabel {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  createdAt: number;
}

export type SpecialEventType =
  | 'coin_rain'
  | 'double_score'
  | 'freeze_time'
  | 'golden_dragon'
  | 'rainbow_dragon'
  | 'mystery_egg';

export interface SpecialEvent {
  type: SpecialEventType;
  label: string;
  emoji: string;
  duration: number; // seconds remaining
  color: string;
}

export interface BombWarning {
  x: number;
  countdown: number; // 3..1
  createdAt: number;
}

export interface GameState {
  objects: PhysicsObject[];
  score: number;
  bestScore: number;
  coins: number;
  gems: number;
  nextLevel: number;
  currentLevel: number;        // which world level (1-8)
  levelTarget: number;         // score target for this level
  isGameOver: boolean;
  isLevelComplete: boolean;
  isPaused: boolean;
  mergeEffects: MergeEffect[];
  particles: Particle[];
  comboLabels: ComboLabel[];
  boosters: {
    undo: number;
    bomb: number;
    magnet: number;
    freeze: number;
    rainbow: number;
  };
  lastDroppedId: string | null;
  canDrop: boolean;
  dropX: number;
  combo: number;
  comboTimer: number;
  dangerTimer: number;      // seconds object has been above danger line (0-3)
  doubleScoreTimer: number; // seconds remaining for 2× multiplier
  freezeTimer: number;      // seconds remaining for freeze
  specialEvent: SpecialEvent | null;
  bombWarning: BombWarning | null;
  nextBombIn: number;       // seconds until next random bomb (20-40)
  nextEventIn: number;      // seconds until next special event (15-30)
  totalMerges: number;
  highestCombo: number;
}

export interface WorldLevel {
  id: number;
  name: string;
  x: number;
  y: number;
  stars: number;
  locked: boolean;
  theme: 'forest' | 'volcano' | 'ice' | 'sky' | 'cave' | 'palace' | 'volcano2' | 'space';
  targetScore: number;
  emoji: string;
  bgFrom: string;
  bgTo: string;
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  currency: 'coins' | 'gems';
  description: string;
  type: 'booster' | 'coins' | 'gems';
  badge?: string;
}
