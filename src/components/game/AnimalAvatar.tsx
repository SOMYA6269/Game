// @ts-nocheck
/**
 * AnimalAvatar — pure sprite drop, no circular masking, no badges.
 * Each creature is a transparent-bg illustration that falls as itself.
 */
import React, { useRef, useEffect } from 'react';
import { Animated, Image } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

export interface AnimalDef {
  level: number;
  name: string;
  emoji: string;
  imageSource: ImageSourcePropType;
  bodyColor: string;
  bodyColorDark: string;
  accentColor: string;
  glowColor: string;
  score: number;
  radius: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
}

export const RARITY_COLORS: Record<string, string> = {
  Common:    '#9CA3AF',
  Uncommon:  '#10B981',
  Rare:      '#3B82F6',
  Epic:      '#8B5CF6',
  Legendary: '#F59E0B',
  Mythic:    '#FF00FF',
};

// ── Character sprites ──────────────────────────────────────────────────────────
// Levels 1-4  : cute everyday animals (starter tier)
// Levels 5-7  : dragon transition tier
// Levels 8-10 : hero dragons (bigger, more majestic)
const SPRITE_URLS: Record<number, ImageSourcePropType> = {
  1:  { uri: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8f5f9012-d25c-4cf5-bed7-5dfcdac3e2cb.jpg' }, // Egg
  2:  { uri: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_fc0ae00d-c0f3-4f47-99a2-c28307b71aa5.jpg' }, // Bunny
  3:  { uri: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8c4e8aec-9ce3-40f7-9d8d-b092acbb713f.jpg' }, // Panda
  4:  { uri: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_5c018be0-0168-45f4-9b1c-e5629e92799d.jpg' }, // Fox Cub
  5:  { uri: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_8fe3667d-17a3-4fbb-8b63-4689128db492.jpg' }, // Penguin (transition)
  6:  { uri: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_17c5c9d4-c502-4037-9a40-50ba17a822cc.jpg' }, // Baby Dragon
  7:  { uri: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_14083c93-8fa3-46aa-9983-569555319b84.jpg' }, // Fire Drake
  8:  { uri: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_64cc2d69-6b7f-4b26-8981-f0a365ccde88.jpg' }, // Storm Dragon
  9:  { uri: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d2218dbe-685b-44ac-bc05-9f2a0b167c94.jpg' }, // Ancient Dragon
  10: { uri: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_40b0a1ae-9e82-4cb5-abca-d1e0a267e647.jpg' }, // Legendary Golden Dragon
};

// ── Booster icons ──────────────────────────────────────────────────────────────
export const BOOSTER_ICONS: Record<string, ImageSourcePropType> = {
  undo:    { uri: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_2bf96986-d247-4474-b963-485866adf2b5.jpg' },
  freeze:  require('../../../assets/freeze.png'),
  rainbow: require('../../../assets/rainbow.png'),
};

// ── Shared currency & nav icons ────────────────────────────────────────────────
export const COIN_SRC: ImageSourcePropType  = require('../../../assets/coin.png');
export const GEM_SRC: ImageSourcePropType   = require('../../../assets/gem.png');
export const NAV_ICONS: Record<string, ImageSourcePropType> = {
  world:      require('../../../assets/nav_map.png'),
  collection: require('../../../assets/nav_collection.png'),
  daily:      require('../../../assets/nav_daily.png'),
  shop:       require('../../../assets/nav_shop.png'),
  settings:   require('../../../assets/nav_settings.png'),
};

// ── Merge chain definition ─────────────────────────────────────────────────────
export const ANIMAL_DEFS: AnimalDef[] = [
  { level:1,  name:'Egg',                    emoji:'🥚', imageSource:SPRITE_URLS[1],  bodyColor:'#FFF9C4', bodyColorDark:'#F9A825', accentColor:'#FFEB3B', glowColor:'#FFFDE7', score:10,   radius:18, rarity:'Common'    },
  { level:2,  name:'Bunny',                  emoji:'🐰', imageSource:SPRITE_URLS[2],  bodyColor:'#FCE4EC', bodyColorDark:'#E91E8C', accentColor:'#F48FB1', glowColor:'#FCE4EC', score:30,   radius:20, rarity:'Common'    },
  { level:3,  name:'Panda',                  emoji:'🐼', imageSource:SPRITE_URLS[3],  bodyColor:'#ECEFF1', bodyColorDark:'#455A64', accentColor:'#B0BEC5', glowColor:'#ECEFF1', score:70,   radius:22, rarity:'Common'    },
  { level:4,  name:'Fox Cub',                emoji:'🦊', imageSource:SPRITE_URLS[4],  bodyColor:'#FBE9E7', bodyColorDark:'#BF360C', accentColor:'#FF8A65', glowColor:'#FBE9E7', score:130,  radius:24, rarity:'Uncommon'  },
  { level:5,  name:'Penguin',                emoji:'🐧', imageSource:SPRITE_URLS[5],  bodyColor:'#E3F2FD', bodyColorDark:'#1565C0', accentColor:'#90CAF9', glowColor:'#BBDEFB', score:220,  radius:27, rarity:'Uncommon'  },
  { level:6,  name:'Baby Dragon',            emoji:'🐲', imageSource:SPRITE_URLS[6],  bodyColor:'#E8F5E9', bodyColorDark:'#2E7D32', accentColor:'#A5D6A7', glowColor:'#C8E6C9', score:360,  radius:32, rarity:'Rare'      },
  { level:7,  name:'Fire Drake',             emoji:'🔥', imageSource:SPRITE_URLS[7],  bodyColor:'#FFCDD2', bodyColorDark:'#B71C1C', accentColor:'#EF5350', glowColor:'#FFCDD2', score:550,  radius:38, rarity:'Epic'      },
  { level:8,  name:'Storm Dragon',           emoji:'⚡', imageSource:SPRITE_URLS[8],  bodyColor:'#EDE7F6', bodyColorDark:'#4A148C', accentColor:'#AB47BC', glowColor:'#F3E5F5', score:800,  radius:44, rarity:'Epic'      },
  { level:9,  name:'Ancient Dragon',         emoji:'💎', imageSource:SPRITE_URLS[9],  bodyColor:'#E3F2FD', bodyColorDark:'#0D47A1', accentColor:'#1565C0', glowColor:'#BBDEFB', score:1200, radius:50, rarity:'Legendary' },
  { level:10, name:'Legendary Gold Dragon',  emoji:'👑', imageSource:SPRITE_URLS[10], bodyColor:'#FFFDE7', bodyColorDark:'#F57F17', accentColor:'#FFD700', glowColor:'#FFF9C4', score:2000, radius:56, rarity:'Mythic'    },
];

export function getAnimalDef(level: number): AnimalDef {
  return ANIMAL_DEFS[Math.min(Math.max(level, 1), ANIMAL_DEFS.length) - 1] ?? ANIMAL_DEFS[0];
}

// ── AnimalAvatar — pure sprite, no masking, no ring ───────────────────────────
// The character image IS the sprite. It falls as itself.
export function AnimalAvatar({
  level, size, animate = true,
}: {
  level: number; size: number; animate?: boolean;
}) {
  const def = getAnimalDef(level);
  const sc  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(sc, { toValue: 1.04, duration: 800, useNativeDriver: true }),
      Animated.timing(sc, { toValue: 0.97, duration: 800, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [animate, sc]);

  return (
    <Animated.View style={{ width: size, height: size, transform: animate ? [{ scale: sc }] : [] }}>
      <Image source={def.imageSource} style={{ width: size, height: size }} resizeMode="contain" />
    </Animated.View>
  );
}

export default AnimalAvatar;

