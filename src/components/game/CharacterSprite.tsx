// @ts-nocheck
/**
 * CharacterSprite — levels 1-5 pure SVG, levels 6-10 transparent PNG assets.
 * No rectangles, no frames, no background colors. Transparent sprites only.
 */
import React, { useRef, useEffect } from 'react';
import { Animated, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Ellipse, Path, G, Defs, RadialGradient as SvgRG, Stop, Polygon } from 'react-native-svg';

export interface CharacterDef {
  level: number; name: string; emoji: string;
  primaryColor: string; glowColor: string;
  score: number; radius: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  asset?: ReturnType<typeof require>;
}

export const CHARACTER_DEFS: CharacterDef[] = [
  { level:1,  name:'Magic Egg',       emoji:'🥚', primaryColor:'#FFFDE7', glowColor:'#FFF176', score:10,   radius:20, rarity:'Common'    },
  { level:2,  name:'Baby Bunny',      emoji:'🐰', primaryColor:'#FFCDD2', glowColor:'#F48FB1', score:30,   radius:22, rarity:'Common'    },
  { level:3,  name:'Baby Panda',      emoji:'🐼', primaryColor:'#ECEFF1', glowColor:'#B0BEC5', score:70,   radius:24, rarity:'Common'    },
  { level:4,  name:'Baby Fox',        emoji:'🦊', primaryColor:'#FFAB76', glowColor:'#FF7043', score:130,  radius:26, rarity:'Uncommon'  },
  { level:5,  name:'Baby Penguin',    emoji:'🐧', primaryColor:'#90CAF9', glowColor:'#42A5F5', score:220,  radius:28, rarity:'Uncommon'  },
  { level:6,  name:'Fire Dragon',     emoji:'🔥', primaryColor:'#EF5350', glowColor:'#FF8A65', score:360,  radius:33, rarity:'Rare',      asset: require('../../../assets/dragon_red.png')    },
  { level:7,  name:'Ice Dragon',      emoji:'❄️',  primaryColor:'#42A5F5', glowColor:'#80D8FF', score:550,  radius:38, rarity:'Epic',      asset: require('../../../assets/dragon_blue.png')   },
  { level:8,  name:'Storm Dragon',    emoji:'⚡', primaryColor:'#AB47BC', glowColor:'#E040FB', score:800,  radius:44, rarity:'Epic',      asset: require('../../../assets/dragon_purple.png') },
  { level:9,  name:'Golden Dragon',   emoji:'✨', primaryColor:'#FFA726', glowColor:'#FFD740', score:1200, radius:50, rarity:'Legendary', asset: require('../../../assets/dragon_gold.png')   },
  { level:10, name:'Dragon King',     emoji:'👑', primaryColor:'#FFD700', glowColor:'#FFFF00', score:2000, radius:56, rarity:'Mythic',    asset: require('../../../assets/dragon_gold.png')   },
];

export function getCharacterDef(level: number): CharacterDef {
  return CHARACTER_DEFS[Math.min(Math.max(level, 1), CHARACTER_DEFS.length) - 1] ?? CHARACTER_DEFS[0];
}

// ── SVG Helpers ───────────────────────────────────────────────────────────────
function Eye({ cx, cy, r = 5 }: { cx: number; cy: number; r?: number }) {
  return <G>
    <Circle cx={cx} cy={cy} r={r} fill="#1A1A2E" />
    <Circle cx={cx + r*0.35} cy={cy - r*0.35} r={r*0.35} fill="white" opacity={0.9} />
    <Circle cx={cx} cy={cy} r={r*0.15} fill="white" opacity={0.4} />
  </G>;
}
function Cheek({ cx, cy, r = 6 }: { cx: number; cy: number; r?: number }) {
  return <Ellipse cx={cx} cy={cy} rx={r} ry={r*0.6} fill="#FF8FAB" opacity={0.5} />;
}

// ── Level 1: Magic Egg ────────────────────────────────────────────────────────
function DrawEgg({ s }: { s: number }) {
  const cx = s/2, cy = s*0.52, gid = `e${s|0}`;
  return <G>
    <Defs><SvgRG id={gid} cx="38%" cy="28%" r="65%">
      <Stop offset="0%" stopColor="#FFFDE7"/><Stop offset="100%" stopColor="#F9D835"/>
    </SvgRG></Defs>
    <Ellipse cx={cx} cy={s*0.93} rx={s*0.27} ry={s*0.05} fill="#000" opacity={0.12}/>
    <Ellipse cx={cx} cy={cy} rx={s*0.3} ry={s*0.37} fill={`url(#${gid})`}/>
    <Ellipse cx={cx-s*0.08} cy={cy-s*0.1} rx={s*0.12} ry={s*0.07} fill="rgba(255,255,255,0.55)"/>
    {/* star pattern on egg */}
    <Path d={`M${cx} ${cy-s*0.14} L${cx+s*0.04} ${cy-s*0.05} L${cx+s*0.14} ${cy-s*0.05} L${cx+s*0.06} ${cy+s*0.02} L${cx+s*0.09} ${cy+s*0.12} L${cx} ${cy+s*0.06} L${cx-s*0.09} ${cy+s*0.12} L${cx-s*0.06} ${cy+s*0.02} L${cx-s*0.14} ${cy-s*0.05} L${cx-s*0.04} ${cy-s*0.05}Z`} fill="#FFD600" opacity={0.7}/>
    <Eye cx={cx-s*0.085} cy={cy-s*0.02} r={s*0.048}/>
    <Eye cx={cx+s*0.085} cy={cy-s*0.02} r={s*0.048}/>
    <Cheek cx={cx-s*0.15} cy={cy+s*0.07} r={s*0.065}/>
    <Cheek cx={cx+s*0.15} cy={cy+s*0.07} r={s*0.065}/>
    <Path d={`M${cx-s*0.07} ${cy+s*0.13} Q${cx} ${cy+s*0.21} ${cx+s*0.07} ${cy+s*0.13}`} stroke="#C8A000" strokeWidth={1.8} fill="none" strokeLinecap="round"/>
    {/* crack */}
    <Path d={`M${cx-s*0.03} ${cy-s*0.35} L${cx+s*0.02} ${cy-s*0.2} L${cx+s*0.07} ${cy-s*0.28}`} stroke="#C8B000" strokeWidth={2} fill="none"/>
  </G>;
}

// ── Level 2: Baby Bunny ───────────────────────────────────────────────────────
function DrawBunny({ s }: { s: number }) {
  const cx = s/2, cy = s*0.57, gid = `b${s|0}`;
  return <G>
    <Defs><SvgRG id={gid} cx="35%" cy="28%" r="68%">
      <Stop offset="0%" stopColor="#FFECF0"/><Stop offset="100%" stopColor="#F8BBD9"/>
    </SvgRG></Defs>
    <Ellipse cx={cx} cy={s*0.93} rx={s*0.28} ry={s*0.05} fill="#000" opacity={0.12}/>
    {/* ears */}
    <Ellipse cx={cx-s*0.14} cy={cy-s*0.38} rx={s*0.075} ry={s*0.19} fill={`url(#${gid})`}/>
    <Ellipse cx={cx+s*0.14} cy={cy-s*0.38} rx={s*0.075} ry={s*0.19} fill={`url(#${gid})`}/>
    <Ellipse cx={cx-s*0.14} cy={cy-s*0.38} rx={s*0.04} ry={s*0.13} fill="#FFB3C6"/>
    <Ellipse cx={cx+s*0.14} cy={cy-s*0.38} rx={s*0.04} ry={s*0.13} fill="#FFB3C6"/>
    {/* body */}
    <Circle cx={cx} cy={cy} r={s*0.27} fill={`url(#${gid})`}/>
    <Ellipse cx={cx} cy={cy+s*0.06} rx={s*0.16} ry={s*0.14} fill="#FFF0F5"/>
    {/* head */}
    <Circle cx={cx} cy={cy-s*0.3} r={s*0.22} fill={`url(#${gid})`}/>
    <Eye cx={cx-s*0.09} cy={cy-s*0.31} r={s*0.048}/>
    <Eye cx={cx+s*0.09} cy={cy-s*0.31} r={s*0.048}/>
    <Cheek cx={cx-s*0.16} cy={cy-s*0.21} r={s*0.065}/>
    <Cheek cx={cx+s*0.16} cy={cy-s*0.21} r={s*0.065}/>
    <Circle cx={cx} cy={cy-s*0.17} r={s*0.03} fill="#FF8FAB"/>
    <Path d={`M${cx-s*0.06} ${cy-s*0.1} Q${cx} ${cy-s*0.04} ${cx+s*0.06} ${cy-s*0.1}`} stroke="#3E2000" strokeWidth={1.5} fill="none" strokeLinecap="round"/>
    {/* whiskers */}
    <Path d={`M${cx-s*0.05} ${cy-s*0.16} L${cx-s*0.22} ${cy-s*0.18}`} stroke="#ccc" strokeWidth={1.2} opacity={0.6}/>
    <Path d={`M${cx+s*0.05} ${cy-s*0.16} L${cx+s*0.22} ${cy-s*0.18}`} stroke="#ccc" strokeWidth={1.2} opacity={0.6}/>
    <Ellipse cx={cx-s*0.09} cy={cy-s*0.4} rx={s*0.08} ry={s*0.04} fill="rgba(255,255,255,0.55)"/>
    {/* tiny bow */}
    <Path d={`M${cx-s*0.07} ${cy-s*0.47} Q${cx} ${cy-s*0.42} ${cx+s*0.07} ${cy-s*0.47}`} stroke="#FF8FAB" strokeWidth={2.5} fill="none"/>
    <Circle cx={cx} cy={cy-s*0.46} r={s*0.025} fill="#FF8FAB"/>
  </G>;
}

// ── Level 3: Baby Panda ───────────────────────────────────────────────────────
function DrawPanda({ s }: { s: number }) {
  const cx = s/2, cy = s*0.57;
  return <G>
    <Ellipse cx={cx} cy={s*0.93} rx={s*0.28} ry={s*0.05} fill="#000" opacity={0.12}/>
    <Circle cx={cx} cy={cy} r={s*0.27} fill="#F0F0F0"/>
    <Ellipse cx={cx} cy={cy+s*0.06} rx={s*0.17} ry={s*0.15} fill="white"/>
    <Circle cx={cx} cy={cy-s*0.3} r={s*0.22} fill="#F0F0F0"/>
    {/* eye patches */}
    <Ellipse cx={cx-s*0.1} cy={cy-s*0.3} rx={s*0.09} ry={s*0.08} fill="#2C2C2C"/>
    <Ellipse cx={cx+s*0.1} cy={cy-s*0.3} rx={s*0.09} ry={s*0.08} fill="#2C2C2C"/>
    <Eye cx={cx-s*0.1} cy={cy-s*0.3} r={s*0.042}/>
    <Eye cx={cx+s*0.1} cy={cy-s*0.3} r={s*0.042}/>
    {/* ears */}
    <Circle cx={cx-s*0.21} cy={cy-s*0.47} r={s*0.08} fill="#2C2C2C"/>
    <Circle cx={cx+s*0.21} cy={cy-s*0.47} r={s*0.08} fill="#2C2C2C"/>
    <Circle cx={cx-s*0.21} cy={cy-s*0.47} r={s*0.045} fill="#444"/>
    <Circle cx={cx+s*0.21} cy={cy-s*0.47} r={s*0.045} fill="#444"/>
    <Ellipse cx={cx} cy={cy-s*0.17} rx={s*0.045} ry={s*0.032} fill="#2C2C2C"/>
    <Cheek cx={cx-s*0.155} cy={cy-s*0.21} r={s*0.065}/>
    <Cheek cx={cx+s*0.155} cy={cy-s*0.21} r={s*0.065}/>
    <Path d={`M${cx-s*0.06} ${cy-s*0.1} Q${cx} ${cy-s*0.03} ${cx+s*0.06} ${cy-s*0.1}`} stroke="#2C2C2C" strokeWidth={1.8} fill="none" strokeLinecap="round"/>
    <Ellipse cx={cx-s*0.22} cy={cy+s*0.04} rx={s*0.1} ry={s*0.08} fill="#2C2C2C"/>
    <Ellipse cx={cx+s*0.22} cy={cy+s*0.04} rx={s*0.1} ry={s*0.08} fill="#2C2C2C"/>
    {/* bamboo */}
    <Path d={`M${cx+s*0.14} ${cy+s*0.07} L${cx+s*0.16} ${cy-s*0.08} L${cx+s*0.2} ${cy-s*0.12}`} stroke="#4CAF50" strokeWidth={3} fill="none" strokeLinecap="round"/>
    <Path d={`M${cx+s*0.17} ${cy-s*0.01} L${cx+s*0.22} ${cy-s*0.04}`} stroke="#4CAF50" strokeWidth={2.5} fill="none" strokeLinecap="round"/>
    <Ellipse cx={cx-s*0.08} cy={cy-s*0.41} rx={s*0.08} ry={s*0.04} fill="rgba(255,255,255,0.5)"/>
  </G>;
}

// ── Level 4: Baby Fox ─────────────────────────────────────────────────────────
function DrawFox({ s }: { s: number }) {
  const cx = s/2, cy = s*0.57, gid = `f${s|0}`;
  return <G>
    <Defs><SvgRG id={gid} cx="35%" cy="28%" r="68%">
      <Stop offset="0%" stopColor="#FFAB76"/><Stop offset="100%" stopColor="#E64A19"/>
    </SvgRG></Defs>
    <Ellipse cx={cx} cy={s*0.93} rx={s*0.28} ry={s*0.05} fill="#000" opacity={0.12}/>
    {/* tail */}
    <Path d={`M${cx+s*0.2} ${cy+s*0.08} Q${cx+s*0.46} ${cy+s*0.38} ${cx+s*0.3} ${cy+s*0.22}`} stroke="#E64A19" strokeWidth={s*0.08} fill="none" strokeLinecap="round"/>
    <Circle cx={cx+s*0.29} cy={cy+s*0.21} r={s*0.05} fill="white"/>
    <Circle cx={cx} cy={cy} r={s*0.27} fill={`url(#${gid})`}/>
    <Ellipse cx={cx} cy={cy+s*0.06} rx={s*0.17} ry={s*0.15} fill="white"/>
    {/* ears */}
    <Polygon points={`${cx-s*0.23},${cy-s*0.43} ${cx-s*0.08},${cy-s*0.54} ${cx-s*0.06},${cy-s*0.34}`} fill={`url(#${gid})`}/>
    <Polygon points={`${cx+s*0.23},${cy-s*0.43} ${cx+s*0.08},${cy-s*0.54} ${cx+s*0.06},${cy-s*0.34}`} fill={`url(#${gid})`}/>
    <Polygon points={`${cx-s*0.19},${cy-s*0.43} ${cx-s*0.1},${cy-s*0.5} ${cx-s*0.09},${cy-s*0.37}`} fill="#FF6D00"/>
    <Polygon points={`${cx+s*0.19},${cy-s*0.43} ${cx+s*0.1},${cy-s*0.5} ${cx+s*0.09},${cy-s*0.37}`} fill="#FF6D00"/>
    <Circle cx={cx} cy={cy-s*0.3} r={s*0.22} fill={`url(#${gid})`}/>
    <Ellipse cx={cx} cy={cy-s*0.17} rx={s*0.13} ry={s*0.11} fill="white"/>
    <Eye cx={cx-s*0.095} cy={cy-s*0.31} r={s*0.05}/>
    <Eye cx={cx+s*0.095} cy={cy-s*0.31} r={s*0.05}/>
    <Cheek cx={cx-s*0.17} cy={cy-s*0.22} r={s*0.065}/>
    <Cheek cx={cx+s*0.17} cy={cy-s*0.22} r={s*0.065}/>
    <Ellipse cx={cx} cy={cy-s*0.165} rx={s*0.045} ry={s*0.032} fill="#BF360C"/>
    <Path d={`M${cx-s*0.07} ${cy-s*0.1} Q${cx} ${cy-s*0.03} ${cx+s*0.07} ${cy-s*0.1}`} stroke="#3E2000" strokeWidth={1.6} fill="none" strokeLinecap="round"/>
    <Ellipse cx={cx-s*0.08} cy={cy-s*0.41} rx={s*0.08} ry={s*0.04} fill="rgba(255,255,255,0.5)"/>
  </G>;
}

// ── Level 5: Baby Penguin ─────────────────────────────────────────────────────
function DrawPenguin({ s }: { s: number }) {
  const cx = s/2, cy = s*0.57, gid = `p${s|0}`;
  return <G>
    <Defs><SvgRG id={gid} cx="35%" cy="28%" r="68%">
      <Stop offset="0%" stopColor="#1E88E5"/><Stop offset="100%" stopColor="#0D47A1"/>
    </SvgRG></Defs>
    <Ellipse cx={cx} cy={s*0.93} rx={s*0.28} ry={s*0.05} fill="#000" opacity={0.12}/>
    <Circle cx={cx} cy={cy} r={s*0.27} fill={`url(#${gid})`}/>
    <Ellipse cx={cx} cy={cy+s*0.04} rx={s*0.18} ry={s*0.21} fill="white"/>
    <Ellipse cx={cx-s*0.26} cy={cy} rx={s*0.1} ry={s*0.15} fill={`url(#${gid})`}/>
    <Ellipse cx={cx+s*0.26} cy={cy} rx={s*0.1} ry={s*0.15} fill={`url(#${gid})`}/>
    <Circle cx={cx} cy={cy-s*0.28} r={s*0.2} fill={`url(#${gid})`}/>
    <Polygon points={`${cx-s*0.05},${cy-s*0.17} ${cx},${cy-s*0.1} ${cx+s*0.05},${cy-s*0.17}`} fill="#FF8F00"/>
    <Eye cx={cx-s*0.075} cy={cy-s*0.29} r={s*0.048}/>
    <Eye cx={cx+s*0.075} cy={cy-s*0.29} r={s*0.048}/>
    <Cheek cx={cx-s*0.14} cy={cy-s*0.21} r={s*0.06}/>
    <Cheek cx={cx+s*0.14} cy={cy-s*0.21} r={s*0.06}/>
    <Ellipse cx={cx-s*0.1} cy={s*0.9} rx={s*0.075} ry={s*0.04} fill="#FF8F00"/>
    <Ellipse cx={cx+s*0.1} cy={s*0.9} rx={s*0.075} ry={s*0.04} fill="#FF8F00"/>
    {/* scarf */}
    <Path d={`M${cx-s*0.2} ${cy-s*0.1} Q${cx} ${cy-s*0.08} ${cx+s*0.2} ${cy-s*0.1}`} stroke="#EF5350" strokeWidth={s*0.05} fill="none" strokeLinecap="round"/>
    <Path d={`M${cx+s*0.16} ${cy-s*0.09} L${cx+s*0.18} ${cy+s*0.02}`} stroke="#EF5350" strokeWidth={s*0.04} fill="none" strokeLinecap="round"/>
    <Ellipse cx={cx-s*0.08} cy={cy-s*0.39} rx={s*0.08} ry={s*0.04} fill="rgba(255,255,255,0.5)"/>
  </G>;
}

const SVG_DRAWERS = [DrawEgg, DrawBunny, DrawPanda, DrawFox, DrawPenguin];

// ── CharacterSprite ───────────────────────────────────────────────────────────
interface Props { level: number; size: number; animate?: boolean; }

export const CharacterSprite = React.memo(function CharacterSprite({ level, size, animate = false }: Props) {
  const sc = useRef(new Animated.Value(1)).current;
  const def = getCharacterDef(level);
  const isAsset = !!def.asset;

  useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(sc, { toValue: 1.07, duration: 850, useNativeDriver: true }),
      Animated.timing(sc, { toValue: 0.95, duration: 850, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [animate]);

  if (isAsset) {
    return (
      <Animated.View style={{ width: size, height: size, transform: [{ scale: sc }] }}>
        {/* Level 10 crown — pure SVG, rendered ABOVE the image, no background */}
        {level === 10 && (
          <View style={{ position:'absolute', top:-size*0.13, left:0, right:0, alignItems:'center', zIndex:2, pointerEvents:'none' }}>
            <Svg width={size*0.52} height={size*0.26} viewBox="0 0 52 26">
              <Polygon points="5,26 0,5 13,16 26,0 39,16 52,5 47,26" fill="#FFD700"/>
              <Circle cx={26} cy={3} r={4} fill="#E91E63"/>
              <Circle cx={5} cy={8} r={3} fill="#FF4081"/>
              <Circle cx={47} cy={8} r={3} fill="#FF4081"/>
              <Ellipse cx={26} cy={4} rx={8} ry={2} fill="rgba(255,255,255,0.35)"/>
            </Svg>
          </View>
        )}
        {/*
          PNG dragon sprite — transparent background, no clip, no border-radius.
          contentFit="contain" ensures the dragon fills the box without cropping.
          transition={0} = instant render, no fade-in delay.
          cachePolicy="memory-disk" = stays in memory after first load.
        */}
        <Image
          source={def.asset}
          style={{ width: size, height: size }}
          contentFit="contain"
          contentPosition="center"
          transition={0}
          cachePolicy="memory-disk"
          priority="high"
        />
      </Animated.View>
    );
  }

  const Drawer = SVG_DRAWERS[level - 1] ?? SVG_DRAWERS[0];
  return (
    <Animated.View style={{ width: size, height: size, transform: [{ scale: sc }] }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Drawer s={size} />
      </Svg>
    </Animated.View>
  );
});

export default CharacterSprite;
