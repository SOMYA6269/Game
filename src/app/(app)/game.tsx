// @ts-nocheck
/**
 * GAME SCREEN v6 — AAA Visual Polish
 * Warm oak board, glossy HUD capsules, animated XP bar, danger triangles,
 * squash-bounce landing, soft contact shadows, golden dust particles.
 */
import React, { useRef, useEffect, useCallback, useState, memo } from 'react';
import {
  View, Text, Pressable, Animated, StyleSheet,
  useWindowDimensions, PanResponder, ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, {
  Path, Circle, G, Polygon, Defs,
  RadialGradient, Stop, Rect, Line,
} from 'react-native-svg';

import { CharacterSprite, getCharacterDef } from '../../components/game/CharacterSprite';
import {
  createPhysicsState, dropAnimal, tickPhysics,
  resetPhysics, getLevelTarget,
} from '../../lib/physicsEngine';
import type { PhysicsState, PhysicsCircle } from '../../lib/physicsEngine';

// ─────────────────────────────────────────────────────────────────────────────
// WARM OAK PALETTE
// ─────────────────────────────────────────────────────────────────────────────
const OAK = {
  light:   '#F5C87A',
  mid:     '#D4956A',
  dark:    '#A0622A',
  deep:    '#7B4A18',
  grain1:  'rgba(180,100,20,0.18)',
  grain2:  'rgba(255,220,120,0.12)',
  gold:    '#FFD700',
  goldDim: '#B8952A',
  surface: 'rgba(62,30,4,0.72)',   // warm dark brown (NOT black)
  edge:    'rgba(255,200,80,0.18)',
};

// ─────────────────────────────────────────────────────────────────────────────
// PRELOAD ALL PNG ASSETS AT MODULE LEVEL (runs once, before any render)
// ─────────────────────────────────────────────────────────────────────────────
// Dragon asset references (prefetched inside component)

// ─────────────────────────────────────────────────────────────────────────────
// GOLDEN DUST PARTICLES — gentle upward drift
// ─────────────────────────────────────────────────────────────────────────────
const DUST_COUNT = 14;
const DustParticle = memo(function DustParticle({ boardW, boardH, idx }: { boardW: number; boardH: number; idx: number }) {
  const rx = useRef(20 + Math.random() * (boardW - 40)).current;
  const startY = useRef(boardH * 0.35 + Math.random() * boardH * 0.55).current;
  const endY   = useRef(boardH * 0.05 + Math.random() * boardH * 0.25).current;
  const dur    = useRef(3200 + Math.random() * 2400).current;
  const delay  = useRef(idx * 550 + Math.random() * 800).current;
  const sz     = useRef(2 + Math.random() * 3).current;
  const y   = useRef(new Animated.Value(startY)).current;
  const op  = useRef(new Animated.Value(0)).current;
  const sc  = useRef(new Animated.Value(0.6 + Math.random() * 0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(op, { toValue: 0.7, duration: 500, useNativeDriver: true }),
        Animated.timing(y,  { toValue: endY, duration: dur, useNativeDriver: true }),
      ]),
      Animated.timing(op, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.timing(y,  { toValue: startY, duration: 0, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', left: rx - sz / 2,
      width: sz, height: sz, borderRadius: sz / 2,
      backgroundColor: '#FFE066', opacity: op,
      transform: [{ translateY: y }, { scale: sc }],
      pointerEvents: 'none',
    }} />
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SQUASH-BOUNCE — plays once when a character first lands
// ─────────────────────────────────────────────────────────────────────────────
const BounceSprite = memo(function BounceSprite({ level, size }: { level: number; size: number }) {
  const scX = useRef(new Animated.Value(1)).current;
  const scY = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      // squash on impact
      Animated.parallel([
        Animated.timing(scX, { toValue: 1.28, duration: 75, useNativeDriver: true }),
        Animated.timing(scY, { toValue: 0.78, duration: 75, useNativeDriver: true }),
      ]),
      // spring back
      Animated.parallel([
        Animated.spring(scX, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }),
        Animated.spring(scY, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ width: size, height: size, transform: [{ scaleX: scX }, { scaleY: scY }] }}>
      <CharacterSprite level={level} size={size} animate={false} />
    </Animated.View>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// SOFT CONTACT SHADOW — layered translucent ellipses, no hard edge
// ─────────────────────────────────────────────────────────────────────────────
function ContactShadow({ sz }: { sz: number }) {
  return (
    <>
      <View style={{
        position: 'absolute', bottom: -4, left: sz * 0.15,
        width: sz * 0.70, height: sz * 0.18, borderRadius: sz * 0.35,
        backgroundColor: 'rgba(60,25,0,0.28)',
      }} />
      <View style={{
        position: 'absolute', bottom: -2, left: sz * 0.22,
        width: sz * 0.56, height: sz * 0.10, borderRadius: sz * 0.28,
        backgroundColor: 'rgba(40,15,0,0.14)',
      }} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORE POP
// ─────────────────────────────────────────────────────────────────────────────
function ScorePop({ x, y, score, onDone }: { x: number; y: number; score: number; onDone: () => void }) {
  const ty = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(1)).current;
  const sc = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(sc, { toValue: 1.5, friction: 3, useNativeDriver: true }),
      Animated.timing(ty, { toValue: -80, duration: 950, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(220),
        Animated.timing(op, { toValue: 0, duration: 680, useNativeDriver: true }),
      ]),
    ]).start(onDone);
  }, []);
  return (
    <Animated.Text style={{
      position: 'absolute', left: x - 32, top: y - 16, pointerEvents: 'none',
      color: '#FFD700', fontWeight: '900', fontSize: 24,
      textShadowColor: '#C84000', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 10,
      opacity: op, transform: [{ translateY: ty }, { scale: sc }],
    }}>+{score}</Animated.Text>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENCOURAGE POP
// ─────────────────────────────────────────────────────────────────────────────
function EncouragePop({ msg, onDone }: { msg: string; onDone: () => void }) {
  const sc = useRef(new Animated.Value(0.1)).current;
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(sc, { toValue: 1.22, friction: 4, useNativeDriver: true }),
      Animated.timing(sc, { toValue: 1, duration: 90, useNativeDriver: true }),
      Animated.delay(450),
      Animated.parallel([
        Animated.timing(sc, { toValue: 1.5, duration: 260, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]),
    ]).start(onDone);
  }, []);
  return (
    <Animated.Text style={{
      position: 'absolute', alignSelf: 'center', top: 80, pointerEvents: 'none',
      color: '#FFFDE7', fontWeight: '900', fontSize: 28,
      textShadowColor: '#E65100', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 16,
      opacity: op, transform: [{ scale: sc }],
    }}>{msg}</Animated.Text>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MERGE BURST
// ─────────────────────────────────────────────────────────────────────────────
const MergeBurst = memo(function MergeBurst({ x, y, color, onDone }: {
  x: number; y: number; color: string; onDone: () => void;
}) {
  const DIRS = [0, 45, 90, 135, 180, 225, 270, 315];
  const anim = useRef(DIRS.map(() => ({ d: new Animated.Value(0), op: new Animated.Value(1) }))).current;
  const flash = useRef(new Animated.Value(0.85)).current;
  useEffect(() => {
    Animated.parallel([
      ...anim.flatMap(({ d, op }) => [
        Animated.timing(d, { toValue: 68, duration: 500, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(flash, { toValue: 0.6, duration: 60, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]),
    ]).start(onDone);
  }, []);
  return (
    <>
      <Animated.View style={{
        position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60,
        borderRadius: 30, backgroundColor: color, opacity: flash, pointerEvents: 'none',
      }} />
      {DIRS.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const tx = anim[i].d.interpolate({ inputRange: [0, 68], outputRange: [0, Math.cos(rad) * 68] });
        const ty = anim[i].d.interpolate({ inputRange: [0, 68], outputRange: [0, Math.sin(rad) * 68] });
        return (
          <Animated.View key={deg} style={{
            position: 'absolute', left: x - 5, top: y - 5, width: 10, height: 10,
            borderRadius: 5, backgroundColor: color, pointerEvents: 'none',
            opacity: anim[i].op, transform: [{ translateX: tx }, { translateY: ty }],
          }} />
        );
      })}
    </>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// DROP GUIDE
// ─────────────────────────────────────────────────────────────────────────────
function DropGuide({ x, h }: { x: number; h: number }) {
  const op = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(op, { toValue: 0.75, duration: 340, useNativeDriver: true }),
      Animated.timing(op, { toValue: 0.15, duration: 340, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', left: x - 1, top: 0, width: 2, height: h,
      backgroundColor: 'rgba(255,240,160,0.85)', opacity: op, pointerEvents: 'none',
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DANGER LINE — pulsing thin red glow + warning triangles
// ─────────────────────────────────────────────────────────────────────────────
function DangerLine({ w, active }: { w: number; active: boolean }) {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) { Animated.timing(op, { toValue: 0, duration: 300, useNativeDriver: true }).start(); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(op, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(op, { toValue: 0.15, duration: 260, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [active]);
  if (!active) return null;
  const TRIS = 5;
  return (
    <Animated.View style={{ position: 'absolute', top: 0, left: 0, width: w, height: 22, opacity: op, pointerEvents: 'none' }}>
      {/* Glow line */}
      <View style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 2,
        backgroundColor: '#FF1744', shadowColor: '#FF1744', shadowOpacity: 0.9, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }} />
      {/* Warning triangles */}
      {Array.from({ length: TRIS }).map((_, i) => {
        const tx = (w / (TRIS + 1)) * (i + 1);
        return (
          <View key={i} style={{ position: 'absolute', top: 0, left: tx - 7, width: 14, height: 14 }}>
            <Svg width={14} height={14} viewBox="0 0 14 14">
              <Polygon points="7,1 13,13 1,13" fill="#FF1744" opacity={0.9} />
              <Polygon points="7,4 11,12 3,12" fill="#FF6D6D" opacity={0.6} />
            </Svg>
          </View>
        );
      })}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// XP BAR — golden frame, glossy green fill, animated shine
// ─────────────────────────────────────────────────────────────────────────────
function XpBar({ pct }: { pct: number }) {
  const [trackW, setTrackW] = useState(200);
  const shine = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shine, { toValue: 1, duration: 2200, useNativeDriver: true })
    ).start();
  }, []);
  const shineX = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [-trackW * 0.5, trackW * 1.2],
  });
  const fillW = Math.max(2, (pct / 100) * trackW);
  return (
    <View style={styles.xpOuter}>
      <View style={styles.xpFrame}>
        <View style={styles.xpTrack} onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}>
          <LinearGradient
            colors={['#76FF03', '#33A800', '#1B5E20']}
            style={[styles.xpFill, { width: fillW }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          />
          <Animated.View style={[styles.xpShine, { transform: [{ translateX: shineX }] }]} />
        </View>
      </View>
      <Text style={styles.xpPct}>{Math.round(pct)}%</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL STARS — shows ⭐⭐☆ based on XP progress
// ─────────────────────────────────────────────────────────────────────────────
function LevelStars({ pct }: { pct: number }) {
  const filled = pct >= 67 ? 3 : pct >= 34 ? 2 : pct >= 5 ? 1 : 0;
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[0, 1, 2].map((i) => (
        <Text key={i} style={{ fontSize: 10, opacity: i < filled ? 1 : 0.3 }}>⭐</Text>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM WOOD FRAME — warm oak, grain, varnish, golden bolts, leaf vines
// ─────────────────────────────────────────────────────────────────────────────
function WoodFrame({ w, h }: { w: number; h: number }) {
  const T = 18;
  const R = 20;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Defs>
        {/* Warm oak gradient */}
        <LinearGradient id="oakH" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={OAK.light} />
          <Stop offset="45%" stopColor={OAK.mid} />
          <Stop offset="100%" stopColor={OAK.dark} />
        </LinearGradient>
        <LinearGradient id="oakV" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor={OAK.dark} />
          <Stop offset="50%" stopColor={OAK.mid} />
          <Stop offset="100%" stopColor={OAK.dark} />
        </LinearGradient>
        {/* Bolt gradient */}
        <RadialGradient id="bolt" cx="38%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#FFF9C4" />
          <Stop offset="55%" stopColor="#FFD700" />
          <Stop offset="100%" stopColor="#8B6914" />
        </RadialGradient>
        {/* Varnish gloss */}
        <LinearGradient id="varnish" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.32)" />
          <Stop offset="60%" stopColor="rgba(255,255,255,0.04)" />
          <Stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
        </LinearGradient>
      </Defs>

      {/* ── FRAME RAILS ── */}
      <Rect x={0} y={0} width={w} height={T} rx={R} fill="url(#oakH)" />
      <Rect x={0} y={h - T} width={w} height={T} rx={R} fill="url(#oakH)" />
      <Rect x={0} y={0} width={T} height={h} rx={R} fill="url(#oakV)" />
      <Rect x={w - T} y={0} width={T} height={h} rx={R} fill="url(#oakV)" />

      {/* ── VARNISH GLOSS ── */}
      <Rect x={0} y={0} width={w} height={T} rx={R} fill="url(#varnish)" />
      <Rect x={0} y={0} width={T} height={h} rx={R} fill="url(#varnish)" />

      {/* ── WOOD GRAIN (horizontal) ── */}
      {[0.18, 0.38, 0.56, 0.74, 0.90].map((t, i) => (
        <G key={`gh${i}`}>
          <Line x1={T + 4} y1={h * t} x2={w - T - 4} y2={h * t + 2}
            stroke={OAK.grain1} strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={T + 4} y1={h * t + 1.5} x2={w - T - 4} y2={h * t + 3.5}
            stroke={OAK.grain2} strokeWidth={0.7} strokeLinecap="round" />
        </G>
      ))}
      {/* ── WOOD GRAIN (vertical sides) ── */}
      {[0.25, 0.5, 0.75].map((t, i) => (
        <Line key={`gv${i}`} x1={w * t} y1={T + 3} x2={w * t + 1.5} y2={h - T - 3}
          stroke={OAK.grain1} strokeWidth={0.8} opacity={0.5} />
      ))}

      {/* ── GOLDEN CORNER ORNAMENTS ── */}
      {[[22, 22], [w - 22, 22], [22, h - 22], [w - 22, h - 22]].map(([cx, cy], i) => (
        <G key={`bolt${i}`}>
          <Circle cx={cx} cy={cy} r={11} fill={OAK.deep} />
          <Circle cx={cx} cy={cy} r={9.5} fill="url(#bolt)" />
          <Circle cx={cx} cy={cy} r={5.5} fill={OAK.gold} opacity={0.95} />
          <Circle cx={cx - 2} cy={cy - 2} r={2.2} fill="rgba(255,255,255,0.75)" />
          {/* Decorative ring */}
          <Circle cx={cx} cy={cy} r={8} fill="none" stroke="rgba(255,215,0,0.5)" strokeWidth={1} />
        </G>
      ))}

      {/* ── CORNER LEAF VINES ── */}
      {[
        [T + 6, T + 6,  1,  1],
        [w - T - 28, T + 6, -1,  1],
        [T + 6, h - T - 28,  1, -1],
        [w - T - 28, h - T - 28, -1, -1],
      ].map(([px, py, fx, fy], idx) => {
        const bx = px + 14;
        const by = py + 10;
        return (
          <G key={`leaf${idx}`}>
            {/* stem */}
            <Path d={`M${bx} ${by} Q${bx + fx * 10} ${by - fy * 14} ${bx + fx * 18} ${by - fy * 8}`}
              stroke="#5D8E3A" strokeWidth={1.4} fill="none" opacity={0.85} />
            {/* leaf 1 */}
            <Path d={`M${bx + fx*8} ${by - fy*8} Q${bx + fx*14} ${by - fy*18} ${bx + fx*18} ${by - fy*8} Q${bx + fx*10} ${by - fy*6} ${bx + fx*8} ${by - fy*8}Z`}
              fill="#4CAF50" opacity={0.82} />
            {/* leaf 2 — smaller */}
            <Path d={`M${bx + fx*4} ${by - fy*4} Q${bx + fx*10} ${by - fy*12} ${bx + fx*14} ${by - fy*4} Q${bx + fx*7} ${by - fy*2} ${bx + fx*4} ${by - fy*4}Z`}
              fill="#81C784" opacity={0.65} />
          </G>
        );
      })}

      {/* ── INNER BEVEL GLOW ── */}
      <Rect x={T - 1} y={T - 1} width={w - T * 2 + 2} height={h - T * 2 + 2}
        rx={10} fill="none" stroke="rgba(255,230,100,0.28)" strokeWidth={2.5} />
      {/* Top inner specular highlight */}
      <Rect x={T + 2} y={T + 1} width={w - T * 2 - 4} height={4} rx={2}
        fill="rgba(255,255,255,0.14)" />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAUNCHER PLATFORM
// ─────────────────────────────────────────────────────────────────────────────
function LauncherPlatform({ w, aimX, level, dragging }: {
  w: number; aimX: number; level: number; dragging: boolean;
}) {
  const def = getCharacterDef(level);
  const sz = def.radius * 2 * 1.42;
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: -7, duration: 720, useNativeDriver: true }),
      Animated.timing(bob, { toValue: 0, duration: 720, useNativeDriver: true }),
    ])).start();
    return () => bob.stopAnimation();
  }, []);
  const clampX = Math.max(sz / 2 + 4, Math.min(w - sz / 2 - 4, aimX));
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: sz + 28, pointerEvents: 'none' }}>
      {/* Wooden plank */}
      <LinearGradient
        colors={[OAK.light, OAK.mid, OAK.dark]}
        style={{ position: 'absolute', bottom: 2, left: clampX - 44, width: 88, height: 13, borderRadius: 7 }}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      />
      {/* Plank gloss */}
      <View style={{ position: 'absolute', bottom: 12, left: clampX - 42, width: 84, height: 3,
        backgroundColor: 'rgba(255,240,180,0.35)', borderRadius: 2 }} />
      {/* Soft shadow under character */}
      <View style={{ position: 'absolute', bottom: 14, left: clampX - sz * 0.28, width: sz * 0.56, height: 6,
        borderRadius: 3, backgroundColor: 'rgba(60,20,0,0.2)' }} />
      {/* Character */}
      <Animated.View style={{
        position: 'absolute', bottom: 13, left: clampX - sz / 2, width: sz, height: sz,
        opacity: dragging ? 0.42 : 1, transform: [{ translateY: bob }],
      }}>
        <CharacterSprite level={level} size={sz} animate />
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOSSY CAPSULE
// ─────────────────────────────────────────────────────────────────────────────
function Capsule({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View style={[styles.capsule, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.22)', 'rgba(255,240,160,0.06)', 'rgba(0,0,0,0.25)']}
        style={styles.capsuleGrad}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME OVER OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function GameOverOverlay({ score, best, onRetry, onHome }: {
  score: number; best: number; onRetry: () => void; onHome: () => void;
}) {
  const sc = useRef(new Animated.Value(0.5)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(sc, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.overlay, { opacity: op }]}>
      <Animated.View style={[styles.popup, { transform: [{ scale: sc }] }]}>
        <LinearGradient colors={['#6D0000', '#2D0000']} style={styles.popHead}>
          <Text style={styles.popIcon}>💀</Text>
          <Text style={styles.popTitle}>GAME OVER</Text>
        </LinearGradient>
        <View style={styles.popBody}>
          <Text style={styles.popSubLabel}>FINAL SCORE</Text>
          <Text style={styles.popBigNum}>{score.toLocaleString()}</Text>
          <View style={styles.popRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>🏆 Best  {best.toLocaleString()}</Text></View>
          </View>
          <Pressable style={styles.popBtn} onPress={onRetry}>
            <LinearGradient colors={['#4CAF50', '#1B5E20']} style={styles.btnFill}>
              <Text style={styles.btnTxt}>🔄  PLAY AGAIN</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.popLink} onPress={onHome}>
            <Text style={styles.linkTxt}>🏠  Home</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL COMPLETE OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function LevelDoneOverlay({ level, score, onNext, onHome }: {
  level: number; score: number; onNext: () => void; onHome: () => void;
}) {
  const sc = useRef(new Animated.Value(0.4)).current;
  const op = useRef(new Animated.Value(0)).current;
  const star0 = useRef(new Animated.Value(0)).current;
  const star1 = useRef(new Animated.Value(0)).current;
  const star2 = useRef(new Animated.Value(0)).current;
  const stars = [star0, star1, star2];
  useEffect(() => {
    Animated.parallel([
      Animated.spring(sc, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start(() => {
      stars.forEach((s, i) => setTimeout(() =>
        Animated.spring(s, { toValue: 1, friction: 4, useNativeDriver: true }).start(), i * 200)
      );
    });
  }, []);
  return (
    <Animated.View style={[styles.overlay, { opacity: op }]}>
      <Animated.View style={[styles.popup, { transform: [{ scale: sc }] }]}>
        <LinearGradient colors={['#F9A825', '#C84B00']} style={styles.popHead}>
          <Text style={styles.popIcon}>🏆</Text>
          <Text style={styles.popTitle}>LEVEL {level} CLEAR!</Text>
        </LinearGradient>
        <View style={styles.popBody}>
          <View style={styles.starsRow}>
            {stars.map((s, i) => (
              <Animated.Text key={i} style={{ fontSize: 42, transform: [{ scale: s }] }}>⭐</Animated.Text>
            ))}
          </View>
          <View style={styles.popRow}>
            <View style={styles.chip}><Text style={styles.chipTxt}>🪙  +{score}</Text></View>
            <View style={styles.chip}><Text style={styles.chipTxt}>💎  +{level * 5}</Text></View>
          </View>
          <Pressable style={styles.popBtn} onPress={onNext}>
            <LinearGradient colors={['#FDD835', '#F57F17']} style={styles.btnFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.btnTxt}>NEXT LEVEL →</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.popLink} onPress={onHome}>
            <Text style={styles.linkTxt}>🏠  Home</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAUSE OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function PauseOverlay({ onResume, onHome }: { onResume: () => void; onHome: () => void }) {
  return (
    <View style={styles.overlay}>
      <View style={[styles.popup, { paddingVertical: 36, alignItems: 'center' }]}>
        <Text style={{ fontSize: 60, marginBottom: 8 }}>⏸</Text>
        <Text style={[styles.popTitle, { color: '#FFD700', marginBottom: 28 }]}>PAUSED</Text>
        <Pressable style={[styles.popBtn, { width: 230 }]} onPress={onResume}>
          <LinearGradient colors={['#4CAF50', '#1B5E20']} style={styles.btnFill}>
            <Text style={styles.btnTxt}>▶  RESUME</Text>
          </LinearGradient>
        </Pressable>
        <Pressable style={[styles.popLink, { marginTop: 14 }]} onPress={onHome}>
          <Text style={styles.linkTxt}>🏠  Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GAME SCREEN
// ─────────────────────────────────────────────────────────────────────────────
type Phase = 'playing' | 'paused' | 'gameover' | 'levelcomplete';
const MSGS = ['Awesome! ✨', 'Magic! 🔮', 'Brilliant! 💥', 'Perfect! 🌟', 'Legendary! 👑'];
// size multiplier: 1.18 = ~20% smaller than v21's 1.45
const getCharSz = (r: number) => r * 2 * 1.18;

export default function GameScreen() {
  const { width: W, height: H } = useWindowDimensions();

  const HM     = 8;
  const BOARD_W = W - HM * 2;
  const WOOD    = 18;
  const INNER_W = BOARD_W - WOOD * 2;
  const HUD_H   = 98;
  const BOARD_H = H * 0.78;
  const INNER_H = BOARD_H - WOOD * 2;
  const LAUNCH_H = 70;
  const PLAY_H   = INNER_H - LAUNCH_H;

  const [physState, setPhysState] = useState<PhysicsState>(() =>
    createPhysicsState(INNER_W, PLAY_H)
  );
  const [level, setLevel]   = useState(1);
  const [score, setScore]   = useState(0);
  const [best, setBest]     = useState(0);
  const [phase, setPhase]   = useState<Phase>('playing');
  const [aimX, setAimX]     = useState(INNER_W / 2);
  const [dragging, setDragging] = useState(false);

  const [scorePops, setScorePops] = useState<{ id: number; x: number; y: number; score: number }[]>([]);
  const [encPops,   setEncPops]   = useState<{ id: number; msg: string }[]>([]);
  const [bursts,    setBursts]    = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const popId = useRef(0);
  const raf   = useRef<ReturnType<typeof setInterval>>();

  const levelTarget = getLevelTarget(level);
  const prevTarget  = level > 1 ? getLevelTarget(level - 1) : 0;
  const xpPct = Math.min(100, Math.max(0, ((score - prevTarget) / Math.max(1, levelTarget - prevTarget)) * 100));
  const isDanger = physState.dangerTimer > 0;

  // Physics loop
  useEffect(() => {
    if (phase !== 'playing') { if (raf.current) clearInterval(raf.current); return; }
    raf.current = setInterval(() => {
      setPhysState((prev) => {
        const next = tickPhysics(prev);
        if (next.pendingMerges.length > 0) {
          const gain = next.pendingMerges.reduce((s, m) => s + m.score, 0);
          setScore(next.score);
          setBest((b) => Math.max(b, next.score));
          next.pendingMerges.forEach((m) => {
            const id = ++popId.current;
            setScorePops((ps) => [...ps, { id, x: m.x, y: m.y, score: m.score }]);
            const def = getCharacterDef(m.level);
            setBursts((bs) => [...bs, { id, x: m.x, y: m.y, color: def.glowColor }]);
            if (gain > 100) {
              const eid = ++popId.current;
              setEncPops((ps) => [...ps, { id: eid, msg: MSGS[Math.floor(Math.random() * MSGS.length)] }]);
            }
          });
          if (next.score >= getLevelTarget(level)) setPhase('levelcomplete');
        }
        if (next.isGameOver) setPhase('gameover');
        return { ...next, pendingMerges: [] };
      });
    }, 16);
    return () => { if (raf.current) clearInterval(raf.current); };
  }, [phase, level]);

  // Pan responder
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder:  () => true,
    onPanResponderGrant:   (e) => { setDragging(true);  setAimX(Math.max(0, Math.min(INNER_W, e.nativeEvent.locationX))); },
    onPanResponderMove:    (e) => { setAimX(Math.max(0, Math.min(INNER_W, e.nativeEvent.locationX))); },
    onPanResponderRelease: (e) => {
      setDragging(false);
      setPhysState((prev) => dropAnimal(prev, Math.max(0, Math.min(INNER_W, e.nativeEvent.locationX))));
    },
  })).current;

  const handleRetry = useCallback(() => {
    setPhysState(createPhysicsState(INNER_W, PLAY_H));
    setScore(0); setLevel(1); setPhase('playing');
  }, [INNER_W, PLAY_H]);

  const handleNext = useCallback(() => {
    setLevel((l) => l + 1);
    setPhysState((prev) => resetPhysics(prev));
    setScore(0); setPhase('playing');
  }, []);

  const nextDef = getCharacterDef(physState.nextLevel ?? 1);

  return (
    <View style={{ flex: 1, backgroundColor: '#160B02' }}>
      <StatusBar style="light" />

      {/* ── BACKGROUND — deeper blur for depth of field ── */}
      <ImageBackground
        source={require('../../../assets/castle_bg.png')}
        style={StyleSheet.absoluteFillObject}
        blurRadius={18}
      >
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(8,4,0,0.52)' }]} />
      </ImageBackground>

      {/* ── TOP HUD ── */}
      <SafeAreaView style={styles.hudSafe} pointerEvents="box-none">

        {/* Row 1 */}
        <View style={styles.hudRow}>

          {/* Pause */}
          <Pressable style={styles.pauseBtn}
            onPress={() => setPhase((p) => (p === 'paused' ? 'playing' : 'paused'))}>
            <Text style={{ color: '#FFD700', fontSize: 17, lineHeight: 20 }}>⏸</Text>
          </Pressable>

          {/* Level badge + stars */}
          <View style={styles.lvlBox}>
            <LinearGradient colors={['#FF8F00', '#E65100', '#BF360C']} style={styles.lvlBadge}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.lvlTxt}>LV {level}</Text>
            </LinearGradient>
            <LevelStars pct={xpPct} />
          </View>

          {/* Best */}
          <Capsule style={{ flex: 1.0 }}>
            <Text style={styles.hudLabel}>BEST</Text>
            <Text style={styles.hudVal}>{best.toLocaleString()}</Text>
          </Capsule>

          {/* Score */}
          <Capsule style={{ flex: 1.25 }}>
            <Text style={styles.hudLabel}>SCORE</Text>
            <Text style={[styles.hudVal, { color: '#FFE57F', fontSize: 16 }]}>{score.toLocaleString()}</Text>
          </Capsule>

          {/* Coins */}
          <Capsule>
            <Text style={styles.hudLabel}>🪙</Text>
            <Text style={styles.hudVal}>{physState.coins ?? 0}</Text>
          </Capsule>

          {/* Gems */}
          <Capsule>
            <Text style={styles.hudLabel}>💎</Text>
            <Text style={styles.hudVal}>{physState.gems ?? 0}</Text>
          </Capsule>

          {/* Next preview */}
          <View style={styles.nextBox}>
            <Text style={styles.nextLabel}>NEXT</Text>
            <CharacterSprite level={nextDef.level} size={42} animate />
            <Text style={styles.nextName} numberOfLines={1}>{nextDef.name}</Text>
          </View>
        </View>

        {/* Row 2 — XP bar */}
        <XpBar pct={xpPct} />

      </SafeAreaView>

      {/* ── WOODEN BOARD ── */}
      <View style={[styles.boardOuter, { width: BOARD_W, height: BOARD_H, left: HM, top: HUD_H }]}>

        {/* Warm drop shadow */}
        <View style={[styles.boardShadow, { width: BOARD_W + 12, height: BOARD_H + 12, left: -6, top: 8 }]} />

        {/* SVG premium wood frame */}
        <WoodFrame w={BOARD_W} h={BOARD_H} />

        {/* Inner surface — warm dark brown, NOT black */}
        <View style={[styles.innerSurface, { left: WOOD, top: WOOD, width: INNER_W, height: INNER_H }]}>

          {/* Warm floor gradient */}
          <LinearGradient
            colors={['rgba(100,55,10,0.55)', 'rgba(40,18,3,0.72)', 'rgba(80,40,8,0.48)']}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Side warmth glow */}
          <LinearGradient
            colors={['rgba(255,180,60,0.10)', 'transparent', 'rgba(255,180,60,0.10)']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          />
          {/* Inner vignette (top shadow) */}
          <LinearGradient
            colors={['rgba(0,0,0,0.30)', 'transparent']}
            style={[StyleSheet.absoluteFillObject, { height: 60 }]}
          />

          {/* ── LAUNCHER ZONE ── */}
          <View style={{ position: 'absolute', top: 0, left: 0, width: INNER_W, height: LAUNCH_H, overflow: 'visible' }}>
            {/* Divider plank */}
            <LinearGradient
              colors={[OAK.light, OAK.mid, OAK.dark]}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 11, borderRadius: 6 }}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            />
            <View style={{ position: 'absolute', bottom: 10, left: 6, right: 6, height: 2.5,
              backgroundColor: 'rgba(255,240,160,0.25)', borderRadius: 1 }} />
            <LauncherPlatform w={INNER_W} aimX={aimX} level={physState.dropLevel ?? 1} dragging={dragging} />
          </View>

          {/* ── PLAY AREA ── */}
          <View
            style={{ position: 'absolute', top: LAUNCH_H, left: 0, width: INNER_W, height: PLAY_H }}
            {...pan.panHandlers}
          >
            {/* Golden dust */}
            {Array.from({ length: DUST_COUNT }).map((_, i) => (
              <DustParticle key={i} idx={i} boardW={INNER_W} boardH={PLAY_H} />
            ))}

            {/* Drop guide */}
            {dragging && <DropGuide x={aimX} h={PLAY_H} />}

            {/* Danger line — warning triangles + glowing line */}
            <DangerLine w={INNER_W} active={isDanger} />

            {/* Characters */}
            {physState.circles.map((c: PhysicsCircle) => {
              const sz = getCharSz(c.radius);
              return (
                <View key={c.id} style={{
                  position: 'absolute',
                  left: c.x - sz / 2, top: c.y - sz / 2,
                  width: sz, height: sz,
                }}>
                  {/* Soft layered contact shadow — NO hard black */}
                  <ContactShadow sz={sz} />
                  <BounceSprite level={c.level} size={sz} />
                </View>
              );
            })}

            {/* VFX */}
            {scorePops.map((p) => (
              <ScorePop key={p.id} x={p.x} y={p.y} score={p.score}
                onDone={() => setScorePops((ps) => ps.filter((q) => q.id !== p.id))} />
            ))}
            {bursts.map((b) => (
              <MergeBurst key={b.id} x={b.x} y={b.y} color={b.color}
                onDone={() => setBursts((bs) => bs.filter((q) => q.id !== b.id))} />
            ))}
            {encPops.map((p) => (
              <EncouragePop key={p.id} msg={p.msg}
                onDone={() => setEncPops((ps) => ps.filter((q) => q.id !== p.id))} />
            ))}
          </View>
        </View>
      </View>

      {/* ── OVERLAYS ── */}
      {phase === 'gameover'      && <GameOverOverlay score={score} best={best} onRetry={handleRetry} onHome={() => router.back()} />}
      {phase === 'levelcomplete' && <LevelDoneOverlay level={level} score={score} onNext={handleNext} onHome={() => router.back()} />}
      {phase === 'paused'        && <PauseOverlay onResume={() => setPhase('playing')} onHome={() => router.back()} />}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // HUD
  hudSafe:     { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, pointerEvents: 'box-none' },
  hudRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingTop: 7, gap: 4 },
  pauseBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.65)',
                 justifyContent: 'center', alignItems: 'center',
                 borderWidth: 1.5, borderColor: 'rgba(255,215,0,0.5)',
                 shadowColor: '#FFD700', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  lvlBox:      { alignItems: 'center', gap: 2 },
  lvlBadge:    { borderRadius: 18, paddingHorizontal: 11, paddingVertical: 6,
                 shadowColor: '#FF6D00', shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  lvlTxt:      { color: 'white', fontWeight: '900', fontSize: 12, letterSpacing: 0.5,
                 textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  capsule:     { borderRadius: 20, overflow: 'hidden', borderWidth: 1.2,
                 borderColor: 'rgba(255,215,0,0.38)',
                 shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  capsuleGrad: { paddingHorizontal: 9, paddingVertical: 5, alignItems: 'center', minWidth: 42 },
  hudLabel:    { color: 'rgba(255,210,100,0.65)', fontSize: 7.5, fontWeight: '800', letterSpacing: 1.1 },
  hudVal:      { color: '#FFE082', fontWeight: '900', fontSize: 13 },
  nextBox:     { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)',
                 borderRadius: 16, paddingHorizontal: 7, paddingVertical: 4, minWidth: 56,
                 borderWidth: 1.2, borderColor: 'rgba(255,215,0,0.32)' },
  nextLabel:   { color: 'rgba(255,210,100,0.65)', fontSize: 7.5, fontWeight: '800', letterSpacing: 1 },
  nextName:    { color: '#FFE082', fontSize: 7.5, fontWeight: '700', marginTop: 1, maxWidth: 54 },

  // XP bar
  xpOuter:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginTop: 4, gap: 5 },
  xpFrame:    { flex: 1, borderRadius: 7, borderWidth: 1.5, borderColor: 'rgba(255,215,0,0.55)',
                padding: 1.5,
                shadowColor: '#FFD700', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  xpTrack:    { height: 9, backgroundColor: 'rgba(0,0,0,0.40)', borderRadius: 5, overflow: 'hidden', position: 'relative' },
  xpFill:     { height: 9, borderRadius: 5 },
  xpShine:    { position: 'absolute', top: 0, bottom: 0, width: 60,
                backgroundColor: 'rgba(255,255,255,0.30)', borderRadius: 5 },
  xpPct:      { color: 'rgba(255,230,100,0.7)', fontSize: 9, fontWeight: '800', minWidth: 28, textAlign: 'right' },

  // Board
  boardOuter:  { position: 'absolute', borderRadius: 22 },
  boardShadow: { position: 'absolute', borderRadius: 26,
                 backgroundColor: 'rgba(80,30,0,0.45)' },
  innerSurface:{ position: 'absolute', borderRadius: 8, overflow: 'hidden',
                 backgroundColor: 'rgba(55,25,4,0.85)' },

  // Overlays
  overlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.80)',
                justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  popup:      { width: 308, borderRadius: 28, overflow: 'hidden',
                shadowColor: '#000', shadowOpacity: 0.8, shadowRadius: 36, shadowOffset: { width: 0, height: 14 } },
  popHead:    { paddingVertical: 24, alignItems: 'center' },
  popIcon:    { fontSize: 52 },
  popTitle:   { color: 'white', fontWeight: '900', fontSize: 22, letterSpacing: 2, marginTop: 4 },
  popBody:    { backgroundColor: '#120700', paddingHorizontal: 24, paddingVertical: 22,
                alignItems: 'center', gap: 12 },
  popSubLabel:{ color: 'rgba(255,200,100,0.65)', fontWeight: '700', fontSize: 11, letterSpacing: 2 },
  popBigNum:  { color: '#FFD700', fontWeight: '900', fontSize: 48 },
  popRow:     { flexDirection: 'row', gap: 10 },
  chip:       { backgroundColor: 'rgba(255,215,0,0.12)', borderRadius: 16,
                paddingHorizontal: 14, paddingVertical: 7,
                borderWidth: 1, borderColor: 'rgba(255,215,0,0.38)' },
  chipTxt:    { color: '#FFE082', fontWeight: '800', fontSize: 14 },
  popBtn:     { borderRadius: 20, overflow: 'hidden', width: 258 },
  btnFill:    { paddingVertical: 15, alignItems: 'center' },
  btnTxt:     { color: 'white', fontWeight: '900', fontSize: 15, letterSpacing: 1.8,
                textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  popLink:    { paddingVertical: 6 },
  linkTxt:    { color: 'rgba(255,200,100,0.65)', fontWeight: '700', fontSize: 14 },
  starsRow:   { flexDirection: 'row', gap: 6 },
});
