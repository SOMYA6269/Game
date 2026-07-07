import type { DragonDef, WorldLevel, ShopItem } from './gameTypes';

// ── Dragon evolution chain: 11 levels ───────────────────────────────────────
// Levels 1-3:  Common eggs (bright candy pastels)
// Levels 4-5:  Rare eggs   (vivid jewel tones)
// Levels 6-7:  Epic dragons (bold neons)
// Levels 8-9:  Legendary dragons (gold & royal)
// Levels 10-11: Mythic dragons (rainbow / cosmic)
export const DRAGON_LEVELS: DragonDef[] = [
  {
    level: 1,
    name: 'Leafy Egg',
    emoji: '🥚',
    face: '😊',
    color: '#22C55E',
    bgColor: '#DCFCE7',
    borderColor: '#16A34A',
    glowColor: 'rgba(34,197,94,0.5)',
    radius: 22,
    score: 10,
    rarity: 'common',
    description: 'A tiny egg that loves sunshine and green meadows.',
  },
  {
    level: 2,
    name: 'Sky Egg',
    emoji: '💙',
    face: '🥰',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    borderColor: '#2563EB',
    glowColor: 'rgba(59,130,246,0.5)',
    radius: 27,
    score: 20,
    rarity: 'common',
    description: 'A dreamy blue egg that rains tiny clouds.',
  },
  {
    level: 3,
    name: 'Candy Egg',
    emoji: '💜',
    face: '😄',
    color: '#A855F7',
    bgColor: '#F3E8FF',
    borderColor: '#7C3AED',
    glowColor: 'rgba(168,85,247,0.5)',
    radius: 30,
    score: 40,
    rarity: 'common',
    description: 'Sweet as candy, sparkles when touched.',
  },
  {
    level: 4,
    name: 'Ember Egg',
    emoji: '🔥',
    face: '😎',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    borderColor: '#DC2626',
    glowColor: 'rgba(239,68,68,0.6)',
    radius: 34,
    score: 80,
    rarity: 'rare',
    description: 'Burns bright with inner fire. Handle with care!',
  },
  {
    level: 5,
    name: 'Sunburst Egg',
    emoji: '⭐',
    face: '🤩',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    borderColor: '#D97706',
    glowColor: 'rgba(245,158,11,0.7)',
    radius: 38,
    score: 160,
    rarity: 'rare',
    description: 'Radiates golden warmth and good fortune.',
  },
  {
    level: 6,
    name: 'Sprout Dragon',
    emoji: '🐲',
    face: '😁',
    color: '#10B981',
    bgColor: '#D1FAE5',
    borderColor: '#059669',
    glowColor: 'rgba(16,185,129,0.7)',
    radius: 43,
    score: 320,
    rarity: 'epic',
    description: 'Tiny but mighty! Loves playing in flower fields.',
  },
  {
    level: 7,
    name: 'Aqua Dragon',
    emoji: '🐉',
    face: '😃',
    color: '#06B6D4',
    bgColor: '#CFFAFE',
    borderColor: '#0891B2',
    glowColor: 'rgba(6,182,212,0.7)',
    radius: 49,
    score: 640,
    rarity: 'epic',
    description: 'Swims through clouds and brings gentle rain.',
  },
  {
    level: 8,
    name: 'Blaze Dragon',
    emoji: '🦁',
    face: '😤',
    color: '#F97316',
    bgColor: '#FFEDD5',
    borderColor: '#EA580C',
    glowColor: 'rgba(249,115,22,0.8)',
    radius: 55,
    score: 1280,
    rarity: 'legendary',
    description: 'Commands fire storms with a mighty roar!',
  },
  {
    level: 9,
    name: 'Crystal Dragon',
    emoji: '💎',
    face: '🤯',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    borderColor: '#7C3AED',
    glowColor: 'rgba(139,92,246,0.9)',
    radius: 61,
    score: 2560,
    rarity: 'legendary',
    description: 'Body made of living crystal, refracts rainbow light.',
  },
  {
    level: 10,
    name: 'Solar Dragon',
    emoji: '👑',
    face: '😇',
    color: '#EAB308',
    bgColor: '#FEF9C3',
    borderColor: '#CA8A04',
    glowColor: 'rgba(234,179,8,0.9)',
    radius: 67,
    score: 5120,
    rarity: 'mythic',
    description: 'Ancient ruler of the skies. Its roar shakes mountains.',
  },
  {
    level: 11,
    name: 'Rainbow Dragon',
    emoji: '🌈',
    face: '🥳',
    color: '#EC4899',
    bgColor: '#FCE7F3',
    borderColor: '#DB2777',
    glowColor: 'rgba(236,72,153,0.9)',
    radius: 73,
    score: 10240,
    rarity: 'mythic',
    description: 'The ultimate dragon! Brings magic wherever it flies.',
  },
];

export const MAX_DRAGON_LEVEL = DRAGON_LEVELS.length;

// Levels that can be randomly dropped (lower levels more common)
export const DROP_POOL = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4, 5];

export const getDragonDef = (level: number): DragonDef => {
  const idx = Math.min(level - 1, DRAGON_LEVELS.length - 1);
  return DRAGON_LEVELS[idx];
};

export const getRandomDropLevel = (): number =>
  DROP_POOL[Math.floor(Math.random() * DROP_POOL.length)];

// Rarity display config
export const RARITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  common:    { label: 'Common',    color: '#6B7280', bg: '#F3F4F6' },
  rare:      { label: 'Rare',      color: '#3B82F6', bg: '#DBEAFE' },
  epic:      { label: 'Epic',      color: '#8B5CF6', bg: '#EDE9FE' },
  legendary: { label: 'Legendary', color: '#F59E0B', bg: '#FEF3C7' },
  mythic:    { label: 'Mythic',    color: '#EC4899', bg: '#FCE7F3' },
};

// Level targets and worlds
export const LEVEL_TARGETS = [500, 1200, 2500, 4200, 6500, 10000, 15000, 22000];

// World map levels — 8 themed kingdoms
export const WORLD_LEVELS: WorldLevel[] = [
  {
    id: 1, name: 'Green Forest',     x: 50, y: 84, stars: 3, locked: false,
    theme: 'forest',   targetScore: 500,   emoji: '🌲', bgFrom: '#4ADE80', bgTo: '#16A34A',
  },
  {
    id: 2, name: 'Fire Mountain',    x: 28, y: 73, stars: 3, locked: false,
    theme: 'volcano',  targetScore: 1200,  emoji: '🌋', bgFrom: '#F97316', bgTo: '#DC2626',
  },
  {
    id: 3, name: 'Ice Kingdom',      x: 65, y: 63, stars: 2, locked: false,
    theme: 'ice',      targetScore: 2500,  emoji: '❄️', bgFrom: '#7DD3FC', bgTo: '#3B82F6',
  },
  {
    id: 4, name: 'Sky Castle',       x: 38, y: 54, stars: 1, locked: false,
    theme: 'sky',      targetScore: 4200,  emoji: '🏰', bgFrom: '#C4B5FD', bgTo: '#7C3AED',
  },
  {
    id: 5, name: 'Mystic Cave',      x: 63, y: 44, stars: 0, locked: false,
    theme: 'cave',     targetScore: 6500,  emoji: '🌑', bgFrom: '#6B7280', bgTo: '#1F2937',
  },
  {
    id: 6, name: 'Dragon Palace',    x: 32, y: 36, stars: 0, locked: true,
    theme: 'palace',   targetScore: 10000, emoji: '🐉', bgFrom: '#FCD34D', bgTo: '#D97706',
  },
  {
    id: 7, name: 'Volcano World',    x: 58, y: 26, stars: 0, locked: true,
    theme: 'volcano2', targetScore: 15000, emoji: '🔥', bgFrom: '#F87171', bgTo: '#B91C1C',
  },
  {
    id: 8, name: 'Space Kingdom',    x: 44, y: 15, stars: 0, locked: true,
    theme: 'space',    targetScore: 22000, emoji: '🚀', bgFrom: '#818CF8', bgTo: '#312E81',
  },
];

// Shop items
export const SHOP_ITEMS: ShopItem[] = [
  // Boosters
  { id: 'undo_3',    name: 'Undo ×3',      emoji: '↩️', price: 150,  currency: 'coins', description: 'Take back your last drop', type: 'booster' },
  { id: 'bomb_3',    name: 'Bomb ×3',      emoji: '💣', price: 300,  currency: 'coins', description: 'Destroy any dragon',       type: 'booster' },
  { id: 'magnet_3',  name: 'Magnet ×3',    emoji: '🧲', price: 400,  currency: 'coins', description: 'Attract same dragons',     type: 'booster' },
  { id: 'freeze_3',  name: 'Freeze ×3',    emoji: '❄️', price: 250,  currency: 'coins', description: 'Freeze time 5 seconds',    type: 'booster' },
  { id: 'rainbow_3', name: 'Rainbow ×3',   emoji: '🌈', price: 500,  currency: 'coins', description: 'Merge any 2 dragons',      type: 'booster' },
  // Coin packs
  { id: 'coins_500',  name: '500 Coins',   emoji: '🪙', price: 5,    currency: 'gems',  description: 'Bag of 500 gold coins',    type: 'coins',   badge: '' },
  { id: 'coins_2000', name: '2000 Coins',  emoji: '💰', price: 15,   currency: 'gems',  description: 'Chest of 2,000 coins',    type: 'coins',   badge: '🔥' },
  { id: 'coins_6000', name: '6000 Coins',  emoji: '🏆', price: 40,   currency: 'gems',  description: 'Vault of 6,000 coins',    type: 'coins',   badge: '👑' },
  // Gem packs
  { id: 'gems_30',   name: '30 Gems',      emoji: '💎', price: 0,    currency: 'gems',  description: 'Watch an ad for 30 gems',  type: 'gems',    badge: '📺' },
  { id: 'gems_100',  name: '100 Gems',     emoji: '💎', price: 1000, currency: 'coins', description: '100 shiny gems',           type: 'gems',    badge: '' },
];

// Daily reward schedule (7-day cycle)
export const DAILY_REWARDS = [
  { day: 1, emoji: '🪙', label: '100 Coins',  coins: 100, gems: 0,  special: null },
  { day: 2, emoji: '💣', label: '2 Bombs',    coins: 0,   gems: 0,  special: 'bomb' },
  { day: 3, emoji: '💎', label: '10 Gems',    coins: 0,   gems: 10, special: null },
  { day: 4, emoji: '🪙', label: '300 Coins',  coins: 300, gems: 0,  special: null },
  { day: 5, emoji: '❄️', label: '2 Freeze',   coins: 0,   gems: 0,  special: 'freeze' },
  { day: 6, emoji: '🪙', label: '500 Coins',  coins: 500, gems: 0,  special: null },
  { day: 7, emoji: '💎', label: '30 Gems',    coins: 0,   gems: 30, special: null },
];

// Combo labels by combo count
export const COMBO_LABELS: Array<{ minCombo: number; text: string; color: string }> = [
  { minCombo: 2,  text: 'Nice!',     color: '#22C55E' },
  { minCombo: 3,  text: 'Great!',    color: '#3B82F6' },
  { minCombo: 5,  text: 'Awesome!',  color: '#8B5CF6' },
  { minCombo: 8,  text: 'Amazing!',  color: '#F59E0B' },
  { minCombo: 12, text: 'LEGENDARY!', color: '#EC4899' },
];

export const getComboLabel = (combo: number): { text: string; color: string } => {
  let result = COMBO_LABELS[0];
  for (const c of COMBO_LABELS) {
    if (combo >= c.minCombo) result = c;
  }
  return result;
};
