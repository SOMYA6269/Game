import type { DragonDef, WorldLevel, ShopItem } from './gameTypes';

// Dragon evolution chain: 11 levels
// Levels 1-6: Magical Eggs
// Levels 7-11: Baby/Teen/Adult Dragons
export const DRAGON_LEVELS: DragonDef[] = [
  {
    level: 1,
    name: 'Green Egg',
    emoji: '🥚',
    color: '#4ADE80',
    bgColor: '#14532D',
    glowColor: 'rgba(74,222,128,0.6)',
    radius: 22,
    score: 10,
    rarity: 'common',
  },
  {
    level: 2,
    name: 'Blue Egg',
    emoji: '💎',
    color: '#60A5FA',
    bgColor: '#1E3A8A',
    glowColor: 'rgba(96,165,250,0.6)',
    radius: 27,
    score: 20,
    rarity: 'common',
  },
  {
    level: 3,
    name: 'Purple Egg',
    emoji: '✨',
    color: '#C084FC',
    bgColor: '#581C87',
    glowColor: 'rgba(192,132,252,0.6)',
    radius: 32,
    score: 40,
    rarity: 'common',
  },
  {
    level: 4,
    name: 'Red Egg',
    emoji: '🌟',
    color: '#F87171',
    bgColor: '#7F1D1D',
    glowColor: 'rgba(248,113,113,0.6)',
    radius: 36,
    score: 80,
    rarity: 'rare',
  },
  {
    level: 5,
    name: 'Golden Egg',
    emoji: '⭐',
    color: '#FCD34D',
    bgColor: '#78350F',
    glowColor: 'rgba(252,211,77,0.7)',
    radius: 40,
    score: 160,
    rarity: 'rare',
  },
  {
    level: 6,
    name: 'Pink Egg',
    emoji: '💗',
    color: '#F9A8D4',
    bgColor: '#831843',
    glowColor: 'rgba(249,168,212,0.6)',
    radius: 44,
    score: 320,
    rarity: 'rare',
  },
  {
    level: 7,
    name: 'Green Dragon',
    emoji: '🐲',
    color: '#34D399',
    bgColor: '#064E3B',
    glowColor: 'rgba(52,211,153,0.7)',
    radius: 50,
    score: 640,
    rarity: 'rare',
  },
  {
    level: 8,
    name: 'Blue Dragon',
    emoji: '🐉',
    color: '#38BDF8',
    bgColor: '#0C4A6E',
    glowColor: 'rgba(56,189,248,0.7)',
    radius: 56,
    score: 1280,
    rarity: 'legendary',
  },
  {
    level: 9,
    name: 'Purple Dragon',
    emoji: '🦄',
    color: '#A78BFA',
    bgColor: '#3B0764',
    glowColor: 'rgba(167,139,250,0.8)',
    radius: 62,
    score: 2560,
    rarity: 'legendary',
  },
  {
    level: 10,
    name: 'Golden Dragon',
    emoji: '👑',
    color: '#FBBF24',
    bgColor: '#451A03',
    glowColor: 'rgba(251,191,36,0.9)',
    radius: 68,
    score: 5120,
    rarity: 'legendary',
  },
  {
    level: 11,
    name: 'Rainbow Dragon',
    emoji: '🌈',
    color: '#EC4899',
    bgColor: '#500724',
    glowColor: 'rgba(236,72,153,0.9)',
    radius: 74,
    score: 10240,
    rarity: 'legendary',
  },
];

export const MAX_DRAGON_LEVEL = DRAGON_LEVELS.length;

// Levels that can be randomly dropped (lower levels more common)
export const DROP_POOL = [1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5];

export const getDragonDef = (level: number): DragonDef => {
  const idx = Math.min(level - 1, DRAGON_LEVELS.length - 1);
  return DRAGON_LEVELS[idx];
};

export const getRandomDropLevel = (): number => {
  return DROP_POOL[Math.floor(Math.random() * DROP_POOL.length)];
};

// World map levels
export const WORLD_LEVELS: WorldLevel[] = [
  { id: 1, name: 'Meadow Start', x: 50, y: 85, stars: 3, locked: false, islandType: 'forest' },
  { id: 2, name: 'Green Glade', x: 30, y: 75, stars: 3, locked: false, islandType: 'forest' },
  { id: 3, name: 'Blue Lake', x: 60, y: 65, stars: 2, locked: false, islandType: 'ocean' },
  { id: 4, name: 'Purple Peak', x: 40, y: 55, stars: 1, locked: false, islandType: 'castle' },
  { id: 5, name: 'Fire Mountain', x: 65, y: 45, stars: 0, locked: false, islandType: 'volcano' },
  { id: 6, name: 'Sky Castle', x: 35, y: 38, stars: 0, locked: true, islandType: 'sky' },
  { id: 7, name: 'Dragon Throne', x: 55, y: 28, stars: 0, locked: true, islandType: 'castle' },
  { id: 8, name: 'Cloud Temple', x: 45, y: 18, stars: 0, locked: true, islandType: 'sky' },
];

// Shop items
export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'undo_3',
    name: 'Undo Pack',
    emoji: '↩️',
    price: 200,
    currency: 'coins',
    description: '+3 Undo moves',
    type: 'booster',
  },
  {
    id: 'shake_3',
    name: 'Shake Pack',
    emoji: '🌀',
    price: 300,
    currency: 'coins',
    description: '+3 Shake moves',
    type: 'booster',
  },
  {
    id: 'bomb_3',
    name: 'Bomb Pack',
    emoji: '💣',
    price: 400,
    currency: 'coins',
    description: '+3 Bombs',
    type: 'booster',
  },
  {
    id: 'magnet_3',
    name: 'Magnet Pack',
    emoji: '🧲',
    price: 500,
    currency: 'coins',
    description: '+3 Magnets',
    type: 'booster',
  },
  {
    id: 'coins_500',
    name: '500 Coins',
    emoji: '🪙',
    price: 10,
    currency: 'gems',
    description: 'Get 500 gold coins',
    type: 'pack',
  },
  {
    id: 'gems_50',
    name: '50 Gems',
    emoji: '💎',
    price: 0,
    currency: 'gems',
    description: 'Watch ad to earn 50 gems',
    type: 'pack',
  },
];

// Daily reward schedule (7-day cycle)
export const DAILY_REWARDS = [
  { day: 1, emoji: '🪙', label: '100 Coins', coins: 100, gems: 0 },
  { day: 2, emoji: '🪙', label: '200 Coins', coins: 200, gems: 0 },
  { day: 3, emoji: '💎', label: '5 Gems', coins: 0, gems: 5 },
  { day: 4, emoji: '↩️', label: '1 Undo', coins: 0, gems: 0, booster: 'undo' },
  { day: 5, emoji: '🪙', label: '500 Coins', coins: 500, gems: 0 },
  { day: 6, emoji: '💣', label: '1 Bomb', coins: 0, gems: 0, booster: 'bomb' },
  { day: 7, emoji: '💎', label: '20 Gems', coins: 0, gems: 20 },
];
