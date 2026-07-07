import React, {
  useRef, useEffect, useCallback, useState, memo, useMemo,
} from 'react';
import {
  View, Text, Pressable, Animated, PanResponder,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import {
  createInitialState, tickPhysics, applyMerges,
  tickParticles, applyMagnet, checkDangerLine,
  checkLevelComplete, getLevelTarget, buildComboLabel,
  explodeBomb, spawnBombObject, pickSpecialEvent,
  createObject, DANGER_RATIO,
} from '../../lib/gameEngine';
import type { ShockwaveRing } from '../../lib/gameEngine';
import { getDragonDef, getRandomDropLevel } from '../../lib/gameData';
import type {
  GameState, PhysicsObject, Particle, MergeEffect, ComboLabel,
} from '../../lib/gameTypes';

import DragonSprite from '../../components/game/DragonSprite';

// ─── Constants ────────────────────────────────────────────────────────────────
const BOARD_PADDING   = 6;
const DROP_ZONE_H     = 80;
const AIM_DOTS        = 10;
const AIM_DOT_SPACING = 38;
const EFFECT_TTL      = 1100;
const SHOCKWAVE_TTL   = 650;
const LABEL_TTL       = 1200;

// ─── Mutable physics store (never triggers React re-render directly) ──────────
interface PhysicsStore {
  objects: PhysicsObject[];
  particles: Particle[];
  effects: MergeEffect[];
  shockwaves: ShockwaveRing[];
  comboLabels: ComboLabel[];
  score: number;
  bestScore: number;
  coins: number;
  gems: number;
  combo: number;
  comboTimer: number;
  dangerTimer: number;
  doubleScoreTimer: number;
  freezeTimer: number;
  specialEvent: GameState['specialEvent'];
  bombWarning: GameState['bombWarning'];
  nextBombIn: number;
  nextEventIn: number;
  boosters: GameState['boosters'];
  currentLevel: number;
  nextLevel: number;
  lastDroppedId: string | null;
  canDrop: boolean;
  isGameOver: boolean;
  isLevelComplete: boolean;
  isPaused: boolean;
  highestCombo: number;
  totalMerges: number;
}

function storeFromState(s: GameState): PhysicsStore {
  return {
    objects: s.objects, particles: s.particles,
    effects: s.mergeEffects, shockwaves: [],
    comboLabels: s.comboLabels,
    score: s.score, bestScore: s.bestScore,
    coins: s.coins, gems: s.gems,
    combo: s.combo, comboTimer: s.comboTimer,
    dangerTimer: s.dangerTimer,
    doubleScoreTimer: s.doubleScoreTimer,
    freezeTimer: s.freezeTimer,
    specialEvent: s.specialEvent,
    bombWarning: s.bombWarning,
    nextBombIn: s.nextBombIn,
    nextEventIn: s.nextEventIn,
    boosters: s.boosters,
    currentLevel: s.currentLevel,
    nextLevel: s.nextLevel,
    lastDroppedId: s.lastDroppedId,
    canDrop: s.canDrop,
    isGameOver: s.isGameOver,
    isLevelComplete: s.isLevelComplete,
    isPaused: s.isPaused,
    highestCombo: s.highestCombo,
    totalMerges: s.totalMerges,
  };
}

// ─── Animated background: sky, clouds, mountains ─────────────────────────────
const Cloud = memo(function Cloud({
  x, y, size, speed, opacity,
}: { x: number; y: number; size: number; speed: number; opacity: number }) {
  const anim = useRef(new Animated.Value(x)).current;
  useEffect(() => {
    const screenW = 420;
    const travel = screenW + size * 2;
    const dur = (travel / speed) * 1000;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: screenW + size, duration: dur, useNativeDriver: true }),
        Animated.timing(anim, { toValue: -size, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, size, speed]);
  return (
    <Animated.Text style={{
      position: 'absolute', top: y, fontSize: size,
      opacity, transform: [{ translateX: anim }],
    }}>☁️</Animated.Text>
  );
});

const FloatParticle = memo(function FloatParticle({
  x, size, color, delay,
}: { x: number; size: number; color: string; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -120, duration: 3500, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);
  const opacity = anim.interpolate({ inputRange: [-120, -60, 0], outputRange: [0, 0.7, 0] });
  return (
    <Animated.View style={{
      position: 'absolute', bottom: 0, left: x,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity,
      transform: [{ translateY: anim }],
    }} />
  );
});

function GameBackground({ width }: { width: number }) {
  const FLOAT_PARTICLES = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    x: (i / 14) * width + Math.random() * 20,
    size: 4 + Math.random() * 5,
    color: ['#FCD34D', '#C4B5FD', '#6EE7B7', '#F9A8D4', '#93C5FD'][i % 5],
    delay: i * 260,
  })), [width]);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Sky gradient (stacked views) */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ADE3F7' }} />
      <View style={{ position: 'absolute', top: '35%', left: 0, right: 0, bottom: 0, backgroundColor: '#C8ECFB' }} />
      <View style={{ position: 'absolute', top: '65%', left: 0, right: 0, bottom: 0, backgroundColor: '#DFF5FF' }} />

      {/* Clouds */}
      <Cloud x={30}   y={18}  size={28} speed={22} opacity={0.55} />
      <Cloud x={160}  y={40}  size={22} speed={15} opacity={0.45} />
      <Cloud x={280}  y={12}  size={34} speed={18} opacity={0.5}  />
      <Cloud x={80}   y={65}  size={18} speed={12} opacity={0.35} />
      <Cloud x={220}  y={72}  size={24} speed={20} opacity={0.4}  />

      {/* Mountains (static emoji, subtle) */}
      <Text style={{ position: 'absolute', bottom: 0, left: -8,  fontSize: 80, opacity: 0.15 }}>⛰️</Text>
      <Text style={{ position: 'absolute', bottom: 0, right: -8, fontSize: 90, opacity: 0.13 }}>🏔️</Text>
      <Text style={{ position: 'absolute', bottom: 0, left: '20%', fontSize: 55, opacity: 0.12 }}>🌲</Text>
      <Text style={{ position: 'absolute', bottom: 0, right: '22%', fontSize: 48, opacity: 0.12 }}>🌳</Text>
      <Text style={{ position: 'absolute', bottom: 0, right: '8%', fontSize: 42, opacity: 0.1 }}>🏰</Text>

      {/* Floating sparkles */}
      {FLOAT_PARTICLES.map((p, i) => <FloatParticle key={i} {...p} />)}
    </View>
  );
}

// ─── Glowing aim line ────────────────────────────────────────────────────────
const AimLine = memo(function AimLine({
  x, boardHeight, topOffset,
}: { x: number; boardHeight: number; topOffset: number }) {
  const pulseAnims = useRef(
    Array.from({ length: AIM_DOTS }, () => new Animated.Value(1))
  ).current;

  useEffect(() => {
    pulseAnims.forEach((anim, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(anim, { toValue: 0.25, duration: 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      );
      loop.start();
    });
    return () => pulseAnims.forEach(a => a.stopAnimation());
  }, [pulseAnims]);

  return (
    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      {/* Glowing dots */}
      {Array.from({ length: AIM_DOTS }, (_, i) => {
        const dotY = topOffset + i * AIM_DOT_SPACING;
        if (dotY > boardHeight - 10) return null;
        const fadeFactor = 1 - i / AIM_DOTS;
        const dotSize = Math.max(4, 9 * fadeFactor);
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: x - dotSize / 2,
              top: dotY - dotSize / 2,
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: '#fff',
              opacity: Animated.multiply(pulseAnims[i], fadeFactor * 0.9 + 0.1),
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9,
              shadowRadius: 5,
            }}
          />
        );
      })}
      {/* Landing indicator ring */}
      <View style={{
        position: 'absolute',
        left: x - 18, bottom: 6,
        width: 36, height: 12, borderRadius: 18,
        borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)',
        backgroundColor: 'rgba(255,255,255,0.15)',
      }} />
    </View>
  );
});

// ─── Premium danger line ───────────────────────────────────────────────────────
const DangerLine = memo(function DangerLine({
  boardWidth, boardHeight, dangerTimer,
}: { boardWidth: number; boardHeight: number; dangerTimer: number }) {
  const dangerY = boardHeight * DANGER_RATIO;
  const pulse = useRef(new Animated.Value(0.5)).current;
  const flash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (dangerTimer > 0) {
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [Math.floor(dangerTimer), flash]);

  const countdown = dangerTimer > 0 ? 3 - Math.floor(dangerTimer) : null;

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, top: dangerY, pointerEvents: 'none' }}>
      {/* Flash overlay */}
      <Animated.View style={{
        position: 'absolute', left: 0, right: 0, top: -60, height: 60,
        backgroundColor: '#EF4444', opacity: Animated.multiply(flash, 0.25),
      }} />
      {/* Glow layer */}
      <Animated.View style={{
        position: 'absolute', left: 0, right: 0, top: -3, height: 8,
        backgroundColor: '#EF4444', opacity: Animated.multiply(pulse, 0.5),
        borderRadius: 4,
      }} />
      {/* Sharp line */}
      <View style={{ height: 2, backgroundColor: '#EF4444' }} />
      {/* Warning particles (static triangles) */}
      {Array.from({ length: 7 }, (_, i) => (
        <Animated.View key={i} style={{
          position: 'absolute',
          left: (i / 6) * (boardWidth - 16) + 4,
          top: -6,
          width: 0, height: 0,
          borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 7,
          borderLeftColor: 'transparent', borderRightColor: 'transparent',
          borderBottomColor: '#EF4444',
          opacity: pulse,
        }} />
      ))}
      {/* "DANGER" label + countdown */}
      <View style={{
        position: 'absolute', right: 4, top: -20,
        flexDirection: 'row', alignItems: 'center', gap: 6,
      }}>
        {countdown !== null && (
          <View style={{
            width: 22, height: 22, borderRadius: 11,
            borderWidth: 2, borderColor: '#EF4444',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#EF4444', fontWeight: '900', fontSize: 12 }}>{countdown}</Text>
          </View>
        )}
        <View style={{
          backgroundColor: '#EF4444', borderRadius: 6,
          paddingHorizontal: 5, paddingVertical: 1,
        }}>
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>DANGER</Text>
        </View>
      </View>
    </View>
  );
});

// ─── Shockwave ring animation ────────────────────────────────────────────────
const ShockwaveRingView = memo(function ShockwaveRingView({ ring }: { ring: ShockwaveRing }) {
  const scale = useRef(new Animated.Value(0.2)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 3.0, duration: SHOCKWAVE_TTL, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: SHOCKWAVE_TTL, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);
  return (
    <Animated.View style={{
      position: 'absolute',
      left: ring.x - 30, top: ring.y - 30,
      width: 60, height: 60, borderRadius: 30,
      borderWidth: 3, borderColor: ring.color,
      opacity, transform: [{ scale }],
      pointerEvents: 'none',
    }} />
  );
});

// ─── Score popup ────────────────────────────────────────────────────────────
const ScorePopup = memo(function ScorePopup({ effect }: { effect: MergeEffect }) {
  const def = getDragonDef(effect.level);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -54, duration: EFFECT_TTL, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: EFFECT_TTL * 0.55, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: EFFECT_TTL * 0.45, useNativeDriver: true }),
      ]),
      Animated.spring(scale, { toValue: 1.2, tension: 80, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [translateY, opacity, scale]);
  return (
    <Animated.View style={{
      position: 'absolute',
      left: effect.x - 36, top: effect.y - 12,
      transform: [{ translateY }, { scale }],
      opacity, alignItems: 'center', pointerEvents: 'none',
    }}>
      <View style={{
        backgroundColor: def.bgColor, borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 4,
        borderWidth: 2, borderColor: def.borderColor,
        flexDirection: 'row', alignItems: 'center', gap: 4,
      }}>
        <Text style={{ fontSize: 11 }}>{def.emoji}</Text>
        <Text style={{ color: def.color, fontWeight: '900', fontSize: 14 }}>{effect.scoreText}</Text>
      </View>
    </Animated.View>
  );
});

// ─── Combo label ─────────────────────────────────────────────────────────────
const ComboLabelView = memo(function ComboLabelView({ label }: { label: ComboLabel }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.3, tension: 90, friction: 4, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.delay(600),
        Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
      Animated.timing(translateY, { toValue: -70, duration: LABEL_TTL, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity, translateY]);
  return (
    <Animated.View style={{
      position: 'absolute',
      left: label.x - 65, top: label.y - 16,
      transform: [{ translateY }, { scale }],
      opacity, alignItems: 'center', pointerEvents: 'none',
    }}>
      <Text style={{
        fontSize: 24, fontWeight: '900', color: label.color,
        textShadowColor: 'rgba(0,0,0,0.35)',
        textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
      }}>{label.text}</Text>
    </Animated.View>
  );
});

// ─── Particle dot ──────────────────────────────────────────────────────────
const ParticleDot = memo(function ParticleDot({ p }: { p: Particle }) {
  return (
    <View style={{
      position: 'absolute',
      left: p.x - p.size / 2, top: p.y - p.size / 2,
      width: p.size, height: p.size,
      borderRadius: p.shape === 'star' ? 2 : p.size / 2,
      backgroundColor: p.color,
      opacity: Math.max(0, Math.min(1, p.life)),
      transform: p.shape === 'star' ? [{ rotate: '45deg' }] : [],
    }} />
  );
});

// ─── HUD Components ───────────────────────────────────────────────────────────
const TopHUD = memo(function TopHUD({
  score, bestScore, coins, gems, level, levelTarget, onPause,
}: {
  score: number; bestScore: number; coins: number; gems: number;
  level: number; levelTarget: number; onPause: () => void;
}) {
  const progress = Math.min(score / Math.max(levelTarget, 1), 1);
  return (
    <View style={{
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderRadius: 20, marginHorizontal: 8, marginBottom: 6,
      padding: 10,
      borderWidth: 2, borderColor: '#E8D5FF',
      shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15, shadowRadius: 8,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        {/* Pause */}
        <Pressable onPress={onPause} style={{
          width: 34, height: 34, borderRadius: 17,
          backgroundColor: '#F3F0FF', alignItems: 'center', justifyContent: 'center',
          borderWidth: 1.5, borderColor: '#C4B5FD', marginRight: 8,
        }}>
          <Text style={{ fontSize: 14 }}>⏸</Text>
        </Pressable>
        {/* Scores */}
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: '#8B5CF6', fontWeight: '800', letterSpacing: 0.8 }}>SCORE</Text>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#1E1B4B' }}>{score.toLocaleString()}</Text>
          </View>
          <View style={{
            backgroundColor: '#8B5CF6', borderRadius: 14,
            paddingHorizontal: 12, paddingVertical: 4, alignItems: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>LV</Text>
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900', lineHeight: 18 }}>{level}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 9, color: '#F59E0B', fontWeight: '800', letterSpacing: 0.8 }}>BEST</Text>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E1B4B' }}>{Math.max(score, bestScore).toLocaleString()}</Text>
          </View>
        </View>
        {/* Currency */}
        <View style={{ alignItems: 'flex-end', marginLeft: 8, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Text style={{ fontSize: 12 }}>🪙</Text>
            <Text style={{ fontWeight: '800', fontSize: 12, color: '#92400E' }}>{coins >= 1000 ? `${(coins/1000).toFixed(1)}k` : coins}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Text style={{ fontSize: 12 }}>💎</Text>
            <Text style={{ fontWeight: '800', fontSize: 12, color: '#5B21B6' }}>{gems}</Text>
          </View>
        </View>
      </View>
      {/* Progress bar */}
      <View style={{ height: 7, backgroundColor: '#EDE9FE', borderRadius: 4, overflow: 'hidden' }}>
        <View style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${progress * 100}%`,
          backgroundColor: progress >= 1 ? '#22C55E' : '#8B5CF6',
          borderRadius: 4,
        }} />
      </View>
      <Text style={{ fontSize: 9, color: '#9CA3AF', textAlign: 'right', marginTop: 2, fontWeight: '600' }}>
        {score.toLocaleString()} / {levelTarget.toLocaleString()}
      </Text>
    </View>
  );
});

interface NextPreviewProps { level: number; nextNextLevel?: number; }
const NextPreviewPanel = memo(function NextPreviewPanel({ level, nextNextLevel }: NextPreviewProps) {
  const def = getDragonDef(level);
  const appear = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.spring(appear, { toValue: 1, tension: 90, friction: 5, useNativeDriver: true }).start();
  }, [level, appear]);
  return (
    <View style={{
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderRadius: 16, padding: 8, alignItems: 'center', minWidth: 66,
      borderWidth: 2, borderColor: def.borderColor,
      shadowColor: def.color, shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25, shadowRadius: 8,
    }}>
      <Text style={{ fontSize: 9, color: '#8B5CF6', fontWeight: '800', letterSpacing: 0.5 }}>NEXT</Text>
      <Animated.View style={{
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: def.bgColor, borderWidth: 2, borderColor: def.borderColor,
        alignItems: 'center', justifyContent: 'center', marginVertical: 4,
        transform: [{ scale: appear }],
      }}>
        <Text style={{ fontSize: 24 }}>{def.emoji}</Text>
      </Animated.View>
      <Text style={{ fontSize: 9, color: '#374151', fontWeight: '700' }} numberOfLines={1}>{def.name}</Text>
      {nextNextLevel && (
        <View style={{ marginTop: 4, alignItems: 'center' }}>
          <Text style={{ fontSize: 8, color: '#9CA3AF' }}>then</Text>
          <View style={{
            width: 26, height: 26, borderRadius: 13,
            backgroundColor: getDragonDef(nextNextLevel).bgColor,
            borderWidth: 1.5, borderColor: getDragonDef(nextNextLevel).borderColor,
            alignItems: 'center', justifyContent: 'center', marginTop: 2,
          }}>
            <Text style={{ fontSize: 12 }}>{getDragonDef(nextNextLevel).emoji}</Text>
          </View>
        </View>
      )}
    </View>
  );
});

interface BoosterBtnProps {
  emoji: string; label: string; count: number;
  color: string; bgColor: string; onPress: () => void;
}
const BoosterBtn = memo(function BoosterBtn({ emoji, label, count, color, bgColor, onPress }: BoosterBtnProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    if (count === 0) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 90, friction: 4, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Pressable onPress={press} style={{ flex: 1, alignItems: 'center' }}>
      <Animated.View style={{
        backgroundColor: count === 0 ? '#F3F4F6' : bgColor,
        borderRadius: 14, paddingVertical: 8,
        borderWidth: 2, borderColor: count === 0 ? '#E5E7EB' : color,
        opacity: count === 0 ? 0.5 : 1,
        alignItems: 'center', width: '100%',
        transform: [{ scale }],
      }}>
        {count > 0 && (
          <View style={{
            position: 'absolute', top: -7, right: -7,
            backgroundColor: color, borderRadius: 9, width: 18, height: 18,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: '#fff',
          }}>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{count}</Text>
          </View>
        )}
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
        <Text style={{
          fontSize: 9, fontWeight: '800', letterSpacing: 0.3, marginTop: 1,
          color: count === 0 ? '#9CA3AF' : color,
        }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
});

// ─── Pause / Game-Over / Level-Complete overlays ──────────────────────────────
const PauseOverlay = memo(function PauseOverlay({ onResume, onHome }: { onResume: () => void; onHome: () => void }) {
  return (
    <View style={{
      position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center', justifyContent: 'center', borderRadius: 14,
    }}>
      <View style={{
        backgroundColor: '#fff', borderRadius: 24, padding: 28,
        alignItems: 'center', gap: 12, width: 240,
      }}>
        <Text style={{ fontSize: 36 }}>⏸️</Text>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#1E1B4B' }}>Paused</Text>
        <Pressable onPress={onResume} style={{
          backgroundColor: '#22C55E', borderRadius: 14, paddingVertical: 12,
          width: '100%', alignItems: 'center',
        }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>▶ Resume</Text>
        </Pressable>
        <Pressable onPress={onHome} style={{
          backgroundColor: '#F3F0FF', borderRadius: 14, paddingVertical: 12,
          width: '100%', alignItems: 'center', borderWidth: 2, borderColor: '#8B5CF6',
        }}>
          <Text style={{ color: '#8B5CF6', fontWeight: '800', fontSize: 14 }}>🏠 Home</Text>
        </Pressable>
      </View>
    </View>
  );
});

const GameOverOverlay = memo(function GameOverOverlay({
  score, bestScore, highestCombo, onRetry, onHome,
}: {
  score: number; bestScore: number; highestCombo: number;
  onRetry: () => void; onHome: () => void;
}) {
  const scale = useRef(new Animated.Value(0.5)).current;
  useEffect(() => { Animated.spring(scale, { toValue: 1, tension: 55, friction: 6, useNativeDriver: true }).start(); }, [scale]);
  return (
    <View style={{
      position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)',
      alignItems: 'center', justifyContent: 'center', borderRadius: 14,
    }}>
      <Animated.View style={{
        backgroundColor: '#fff', borderRadius: 28, padding: 22,
        alignItems: 'center', gap: 10, width: 270, transform: [{ scale }],
      }}>
        <Text style={{ fontSize: 48 }}>😢</Text>
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#EF4444' }}>Game Over!</Text>
        <View style={{ backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12, width: '100%', gap: 6 }}>
          {([['🎯 Score', score.toLocaleString()], ['🏆 Best', Math.max(score, bestScore).toLocaleString()], ['⚡ Best Combo', `×${highestCombo}`]] as [string,string][]).map(([l, v]) => (
            <View key={l} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#6B7280', fontSize: 13 }}>{l}</Text>
              <Text style={{ color: '#1E1B4B', fontWeight: '800', fontSize: 13 }}>{v}</Text>
            </View>
          ))}
        </View>
        <Pressable onPress={onRetry} style={{ backgroundColor: '#8B5CF6', borderRadius: 16, paddingVertical: 12, width: '100%', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>🔄 Retry</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
          <Pressable onPress={onHome} style={{ flex: 1, backgroundColor: '#F3F0FF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 2, borderColor: '#8B5CF6' }}>
            <Text style={{ color: '#8B5CF6', fontWeight: '800', fontSize: 13 }}>🏠</Text>
          </Pressable>
          <Pressable onPress={onRetry} style={{ flex: 1, backgroundColor: '#FEF3C7', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 2, borderColor: '#FCD34D' }}>
            <Text style={{ color: '#B45309', fontWeight: '800', fontSize: 13 }}>📺 +1 Life</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
});

// ─── Main GameScreen ─────────────────────────────────────────────────────────
export default function GameScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const BOARD_W = Math.min(screenWidth - 100, 320);
  const BOARD_H = Math.round(BOARD_W * 1.48);

  // Physics store — never triggers re-render
  const storeRef = useRef<PhysicsStore>(storeFromState(createInitialState()));
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Aim / drag state — dropX drives aim line + preview dragon
  const dropXRef = useRef(BOARD_W / 2);
  const [dropX, setDropX] = useState(BOARD_W / 2);

  // Pending "next next" level (shown in preview panel after drop queued)
  const queuedNextRef = useRef(storeRef.current.nextLevel);
  const [nextNextLevel] = useState(getRandomDropLevel());

  // Display snapshot — triggers actual React re-render at 60fps
  const [display, setDisplay] = useState<{
    objects: PhysicsObject[];
    particles: Particle[];
    effects: MergeEffect[];
    shockwaves: ShockwaveRing[];
    comboLabels: ComboLabel[];
    score: number; bestScore: number; coins: number; gems: number;
    combo: number; dangerTimer: number; doubleScoreTimer: number; freezeTimer: number;
    specialEvent: GameState['specialEvent'];
    bombWarning: GameState['bombWarning'];
    boosters: GameState['boosters'];
    currentLevel: number; nextLevel: number;
    isGameOver: boolean; isLevelComplete: boolean; isPaused: boolean;
    highestCombo: number;
  }>(() => {
    const s = storeRef.current;
    return {
      objects: [], particles: [], effects: [], shockwaves: [], comboLabels: [],
      score: s.score, bestScore: s.bestScore, coins: s.coins, gems: s.gems,
      combo: s.combo, dangerTimer: 0, doubleScoreTimer: 0, freezeTimer: 0,
      specialEvent: null, bombWarning: null, boosters: s.boosters,
      currentLevel: s.currentLevel, nextLevel: s.nextLevel,
      isGameOver: false, isLevelComplete: false, isPaused: false,
      highestCombo: 0,
    };
  });

  // Camera shake
  const shakeXY = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const triggerShake = useCallback((intensity: number = 7) => {
    Animated.sequence([
      Animated.timing(shakeXY, { toValue: { x: -intensity, y: -intensity * 0.6 }, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeXY, { toValue: { x: intensity, y: intensity * 0.6 }, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeXY, { toValue: { x: -intensity * 0.4, y: 0 }, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeXY, { toValue: { x: 0, y: 0 }, duration: 45, useNativeDriver: true }),
    ]).start();
  }, [shakeXY]);

  // Fake state for GameState-compatible tickPhysics call
  const buildFakeState = useCallback((): GameState => {
    const s = storeRef.current;
    return {
      objects: s.objects, particles: s.particles,
      mergeEffects: s.effects, comboLabels: s.comboLabels,
      score: s.score, bestScore: s.bestScore, coins: s.coins, gems: s.gems,
      nextLevel: s.nextLevel, currentLevel: s.currentLevel,
      levelTarget: getLevelTarget(s.currentLevel),
      isGameOver: s.isGameOver, isLevelComplete: s.isLevelComplete, isPaused: s.isPaused,
      boosters: s.boosters, lastDroppedId: s.lastDroppedId,
      canDrop: s.canDrop, dropX: dropXRef.current,
      combo: s.combo, comboTimer: s.comboTimer,
      dangerTimer: s.dangerTimer, doubleScoreTimer: s.doubleScoreTimer,
      freezeTimer: s.freezeTimer, specialEvent: s.specialEvent,
      bombWarning: s.bombWarning, nextBombIn: s.nextBombIn, nextEventIn: s.nextEventIn,
      totalMerges: s.totalMerges, highestCombo: s.highestCombo,
    };
  }, []);

  // ── Main game loop ─────────────────────────────────────────────────────────
  const gameLoop = useCallback((ts: number) => {
    const s = storeRef.current;
    if (!s.isPaused && !s.isGameOver && !s.isLevelComplete) {
      if (lastTimeRef.current === null) lastTimeRef.current = ts;
      const dt = Math.min((ts - lastTimeRef.current) / 1000, 0.033);
      lastTimeRef.current = ts;

      const fake = buildFakeState();

      // Physics tick
      const { newObjects, merges } = tickPhysics(fake, dt, BOARD_W, BOARD_H);
      s.objects = newObjects;

      // Merges
      if (merges.length > 0) {
        const mult = s.doubleScoreTimer > 0 ? 2 : 1;
        const res = applyMerges(s.objects, merges, BOARD_W, BOARD_H, mult);
        s.objects = res.updatedObjects;
        s.score += res.scoreGained;
        s.effects = [...s.effects, ...res.effects];
        s.shockwaves = [...s.shockwaves, ...res.shockwaves];
        s.particles = [...s.particles, ...res.newParticles];
        s.combo += merges.length;
        s.comboTimer = 2.5;
        s.totalMerges += merges.length;
        if (s.combo >= 2) {
          s.comboLabels = [...s.comboLabels, buildComboLabel(s.combo, BOARD_W / 2, BOARD_H / 3)];
        }
        if (merges.length > 0) triggerShake(merges.length > 2 ? 9 : 6);
      }

      // Particles + timers
      s.particles = tickParticles(s.particles, dt);
      s.doubleScoreTimer = Math.max(0, s.doubleScoreTimer - dt);
      s.freezeTimer = Math.max(0, s.freezeTimer - dt);
      s.comboTimer -= dt;
      if (s.comboTimer <= 0) s.combo = 0;

      // Bomb warning tick
      if (s.bombWarning) {
        const age = (Date.now() - s.bombWarning.createdAt) / 1000;
        const cd = 3 - Math.floor(age);
        if (cd <= 0) {
          const bomb = spawnBombObject(BOARD_W, s.bombWarning);
          s.objects = [...s.objects, bomb];
          s.bombWarning = null;
        } else {
          s.bombWarning = { ...s.bombWarning, countdown: cd };
        }
      }

      // Explode bombs on floor
      const floorBombs = s.objects.filter(o => o.isBomb && o.y + o.radius >= BOARD_H);
      for (const b of floorBombs) {
        const res = explodeBomb(s.objects, b.x, b.y, BOARD_W, BOARD_H);
        s.objects = res.updatedObjects;
        s.particles = [...s.particles, ...res.particles];
        s.score += res.scoreGained;
        triggerShake(12);
      }

      // Schedule bomb
      s.nextBombIn -= dt;
      if (s.nextBombIn <= 0 && !s.bombWarning) {
        s.bombWarning = { x: 40 + Math.random() * (BOARD_W - 80), countdown: 3, createdAt: Date.now() };
        s.nextBombIn = 20 + Math.random() * 20;
      }

      // Special events
      s.nextEventIn -= dt;
      if (s.nextEventIn <= 0 && !s.specialEvent) {
        const ev = pickSpecialEvent();
        s.specialEvent = ev;
        s.nextEventIn = 15 + Math.random() * 15;
        if (ev.type === 'double_score') s.doubleScoreTimer = 10;
        if (ev.type === 'freeze_time') s.freezeTimer = 5;
      }
      if (s.specialEvent && s.specialEvent.duration > 0) {
        const newDur = s.specialEvent.duration - dt;
        s.specialEvent = newDur <= 0 ? null : { ...s.specialEvent, duration: newDur };
      }

      // Danger check
      const inDanger = checkDangerLine(s.objects, BOARD_H);
      s.dangerTimer = inDanger ? s.dangerTimer + dt : 0;
      if (s.dangerTimer >= 3) s.isGameOver = true;

      // Level complete
      if (checkLevelComplete(s.score, s.currentLevel)) s.isLevelComplete = true;

      // Prune old effects
      const now = Date.now();
      s.effects = s.effects.filter(e => now - e.createdAt < EFFECT_TTL);
      s.shockwaves = s.shockwaves.filter(w => now - w.createdAt < SHOCKWAVE_TTL);
      s.comboLabels = s.comboLabels.filter(l => now - l.createdAt < LABEL_TTL);
      s.highestCombo = Math.max(s.highestCombo, s.combo);
    } else {
      lastTimeRef.current = null;
    }

    // Push display snapshot to React
    const s2 = storeRef.current;
    setDisplay({
      objects: [...s2.objects],
      particles: [...s2.particles],
      effects: [...s2.effects],
      shockwaves: [...s2.shockwaves],
      comboLabels: [...s2.comboLabels],
      score: s2.score, bestScore: s2.bestScore, coins: s2.coins, gems: s2.gems,
      combo: s2.combo, dangerTimer: s2.dangerTimer,
      doubleScoreTimer: s2.doubleScoreTimer, freezeTimer: s2.freezeTimer,
      specialEvent: s2.specialEvent, bombWarning: s2.bombWarning,
      boosters: { ...s2.boosters },
      currentLevel: s2.currentLevel, nextLevel: s2.nextLevel,
      isGameOver: s2.isGameOver, isLevelComplete: s2.isLevelComplete,
      isPaused: s2.isPaused, highestCombo: s2.highestCombo,
    });

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [BOARD_W, BOARD_H, buildFakeState, triggerShake]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [gameLoop]);

  // ── Touch / PanResponder for buttery smooth aiming ──────────────────────
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const x = Math.max(20, Math.min(BOARD_W - 20, evt.nativeEvent.locationX));
      dropXRef.current = x;
      setDropX(x);
    },
    onPanResponderMove: (evt) => {
      const x = Math.max(20, Math.min(BOARD_W - 20, evt.nativeEvent.locationX));
      dropXRef.current = x;
      setDropX(x);
    },
    onPanResponderRelease: () => {
      // Drop on release
      dropDragon();
    },
  }), [BOARD_W]);

  const dropDragon = useCallback(() => {
    const s = storeRef.current;
    if (!s.canDrop || s.isGameOver || s.isPaused || s.isLevelComplete) return;
    const def = getDragonDef(s.nextLevel);
    const obj = createObject(dropXRef.current, def.radius, s.nextLevel);
    obj.opacity = 1;
    obj.scale = 1.2; // slight stretch on drop
    s.objects = [...s.objects, obj];
    s.lastDroppedId = obj.id;
    s.canDrop = false;
    const prevNext = s.nextLevel;
    s.nextLevel = getRandomDropLevel();
    queuedNextRef.current = prevNext;
    // re-enable drop after short delay
    setTimeout(() => { storeRef.current.canDrop = true; }, 420);
  }, []);

  // ── Booster handlers ───────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    const s = storeRef.current;
    if (s.boosters.undo === 0 || !s.lastDroppedId) return;
    s.objects = s.objects.filter(o => o.id !== s.lastDroppedId);
    s.boosters = { ...s.boosters, undo: s.boosters.undo - 1 };
    s.lastDroppedId = null;
  }, []);

  const handleBomb = useCallback(() => {
    const s = storeRef.current;
    if (s.boosters.bomb === 0) return;
    const top = [...s.objects].sort((a, b) => a.y - b.y)[0];
    if (top) s.objects = s.objects.filter(o => o.id !== top.id);
    s.boosters = { ...s.boosters, bomb: s.boosters.bomb - 1 };
    triggerShake(10);
  }, [triggerShake]);

  const handleMagnet = useCallback(() => {
    const s = storeRef.current;
    if (s.boosters.magnet === 0) return;
    s.objects = applyMagnet(s.objects);
    s.boosters = { ...s.boosters, magnet: s.boosters.magnet - 1 };
  }, []);

  const handleFreeze = useCallback(() => {
    const s = storeRef.current;
    if (s.boosters.freeze === 0) return;
    s.freezeTimer = 5;
    s.boosters = { ...s.boosters, freeze: s.boosters.freeze - 1 };
  }, []);

  const handleRainbow = useCallback(() => {
    const s = storeRef.current;
    if (s.boosters.rainbow === 0 || s.objects.length < 2) return;
    const a = s.objects[s.objects.length - 1];
    const b = s.objects[s.objects.length - 2];
    const newLevel = Math.min(Math.max(a.level, b.level) + 1, 11);
    const def = getDragonDef(newLevel);
    const merged = createObject((a.x + b.x) / 2, (a.y + b.y) / 2, newLevel);
    merged.scale = 1.4; merged.opacity = 1;
    s.objects = [...s.objects.filter(o => o.id !== a.id && o.id !== b.id), merged];
    s.score += def.score;
    s.boosters = { ...s.boosters, rainbow: s.boosters.rainbow - 1 };
  }, []);

  const handleRetry = useCallback(() => {
    const fresh = storeFromState(createInitialState());
    storeRef.current = fresh;
    dropXRef.current = BOARD_W / 2;
    setDropX(BOARD_W / 2);
  }, [BOARD_W]);

  const handlePause = useCallback(() => {
    storeRef.current.isPaused = true;
  }, []);

  const handleResume = useCallback(() => {
    storeRef.current.isPaused = false;
    lastTimeRef.current = null;
  }, []);

  // Current preview dragon def for the drop zone
  const previewDef = getDragonDef(display.nextLevel);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <GameBackground width={screenWidth} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Top HUD */}
        <TopHUD
          score={display.score}
          bestScore={display.bestScore}
          coins={display.coins}
          gems={display.gems}
          level={display.currentLevel}
          levelTarget={getLevelTarget(display.currentLevel)}
          onPause={handlePause}
        />

        {/* Board row */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 8, flex: 1, gap: 8 }}>
          {/* Wooden frame + board */}
          <Animated.View style={{
            transform: [{ translateX: shakeXY.x }, { translateY: shakeXY.y }],
          }}>
            <View style={{
              backgroundColor: '#7A4E22',
              borderRadius: 22,
              padding: BOARD_PADDING,
              shadowColor: '#3D2409',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.55,
              shadowRadius: 14,
              borderWidth: 3.5,
              borderColor: '#4E2E0A',
            }}>
              {/* Wooden top rail with dragon preview */}
              <View style={{
                height: DROP_ZONE_H,
                backgroundColor: '#A0672F',
                borderRadius: 14,
                marginBottom: 4,
                overflow: 'visible',
                borderWidth: 1.5, borderColor: '#7A4E22',
              }}>
                {/* Wood grain lines */}
                {[14, 32, 50].map(y => (
                  <View key={y} style={{
                    position: 'absolute', left: 8, right: 8, top: y, height: 1,
                    backgroundColor: 'rgba(100,60,10,0.2)',
                  }} />
                ))}
                {/* Aim dots on drop zone */}
                <AimLine x={dropX} boardHeight={DROP_ZONE_H + BOARD_H} topOffset={previewDef.radius * 1.8} />
                {/* Preview dragon follows finger */}
                <View style={{
                  position: 'absolute',
                  left: dropX - previewDef.radius,
                  bottom: 4,
                  width: previewDef.radius * 2,
                  height: previewDef.radius * 2,
                  borderRadius: previewDef.radius,
                  backgroundColor: previewDef.bgColor,
                  borderWidth: 2.5, borderColor: previewDef.borderColor,
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: previewDef.glowColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.9, shadowRadius: 8,
                }}>
                  {/* Gloss */}
                  <View style={{
                    position: 'absolute', top: 3, left: 4,
                    width: previewDef.radius * 0.4, height: previewDef.radius * 0.22,
                    borderRadius: previewDef.radius * 0.18, backgroundColor: 'rgba(255,255,255,0.6)',
                  }} />
                  <Text style={{ fontSize: previewDef.radius * 0.82 }}>{previewDef.emoji}</Text>
                </View>
              </View>

              {/* Play area */}
              <View
                {...panResponder.panHandlers}
                style={{
                  width: BOARD_W,
                  height: BOARD_H,
                  backgroundColor: '#E8F8FF',
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderWidth: 1.5, borderColor: '#BAD8F0',
                }}
              >
                {/* Inner glow at top */}
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 60,
                  backgroundColor: 'rgba(200,240,255,0.4)',
                }} />
                {/* Grid hint lines */}
                {[80, 160, 240, 320, 400].map(yy => (
                  <View key={yy} style={{
                    position: 'absolute', left: 0, right: 0, top: yy, height: 1,
                    backgroundColor: 'rgba(100,170,220,0.08)',
                  }} />
                ))}

                {/* Dragons */}
                {display.objects.map(obj => (
                  <DragonSprite key={obj.id} obj={obj} />
                ))}

                {/* Particles */}
                {display.particles.map(p => <ParticleDot key={p.id} p={p} />)}

                {/* Shockwave rings */}
                {display.shockwaves.map(r => <ShockwaveRingView key={r.id} ring={r} />)}

                {/* Score popups */}
                {display.effects.map(e => <ScorePopup key={e.id} effect={e} />)}

                {/* Combo labels */}
                {display.comboLabels.map(l => <ComboLabelView key={l.id} label={l} />)}

                {/* Danger line */}
                <DangerLine boardWidth={BOARD_W} boardHeight={BOARD_H} dangerTimer={display.dangerTimer} />

                {/* Freeze overlay */}
                {display.freezeTimer > 0 && (
                  <View style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: 'rgba(147,210,255,0.18)',
                    borderWidth: 2, borderColor: 'rgba(56,189,248,0.45)', borderRadius: 12,
                  }}>
                    <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#0EA5E9', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>❄️ {Math.ceil(display.freezeTimer)}s</Text>
                    </View>
                  </View>
                )}

                {/* 2× score */}
                {display.doubleScoreTimer > 0 && (
                  <View style={{
                    position: 'absolute', top: 8, left: 8,
                    backgroundColor: '#8B5CF6', borderRadius: 12,
                    paddingHorizontal: 8, paddingVertical: 3,
                  }}>
                    <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>⚡ 2× {Math.ceil(display.doubleScoreTimer)}s</Text>
                  </View>
                )}

                {/* Special event banner */}
                {display.specialEvent && (
                  <View style={{
                    position: 'absolute', top: 8, left: 8, right: 8,
                    backgroundColor: display.specialEvent.color, borderRadius: 14,
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                    paddingVertical: 7, gap: 6,
                  }}>
                    <Text style={{ fontSize: 18 }}>{display.specialEvent.emoji}</Text>
                    <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>{display.specialEvent.label}</Text>
                  </View>
                )}

                {/* Bomb warning */}
                {display.bombWarning && (
                  <View style={{ position: 'absolute', top: 4, left: display.bombWarning.x - 20 }}>
                    <Text style={{ fontSize: 22 }}>💣</Text>
                    <View style={{ backgroundColor: '#EF4444', borderRadius: 8, alignItems: 'center', marginTop: -4, paddingHorizontal: 4 }}>
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>{display.bombWarning.countdown}</Text>
                    </View>
                  </View>
                )}

                {/* Overlays */}
                {display.isPaused && !display.isGameOver && !display.isLevelComplete && (
                  <PauseOverlay onResume={handleResume} onHome={() => router.push('/(app)/home' as never)} />
                )}
                {display.isGameOver && (
                  <GameOverOverlay
                    score={display.score} bestScore={display.bestScore}
                    highestCombo={display.highestCombo}
                    onRetry={handleRetry}
                    onHome={() => router.push('/(app)/home' as never)}
                  />
                )}
                {display.isLevelComplete && (
                  <View style={{
                    position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
                    alignItems: 'center', justifyContent: 'center', borderRadius: 12,
                  }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', gap: 10, width: 250 }}>
                      <Text style={{ fontSize: 48 }}>🎉</Text>
                      <Text style={{ fontSize: 22, fontWeight: '900', color: '#22C55E' }}>Level Complete!</Text>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {[1,2,3].map(i => <Text key={i} style={{ fontSize: 36 }}>⭐</Text>)}
                      </View>
                      <Pressable onPress={() => {
                        const s = storeRef.current;
                        const next = storeFromState({
                          ...createInitialState(),
                          currentLevel: s.currentLevel + 1,
                          bestScore: Math.max(s.score, s.bestScore),
                          coins: s.coins + 100,
                          gems: s.gems,
                        } as GameState);
                        storeRef.current = next;
                      }} style={{ backgroundColor: '#8B5CF6', borderRadius: 16, paddingVertical: 12, width: '100%', alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>Next Level ➡️</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Right panel: next preview + evolution guide */}
          <View style={{ gap: 8, paddingTop: 4, alignItems: 'center', justifyContent: 'flex-start' }}>
            <NextPreviewPanel level={display.nextLevel} nextNextLevel={nextNextLevel} />
            {/* Mini chain */}
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.85)',
              borderRadius: 14, padding: 8, alignItems: 'center', gap: 3, minWidth: 66,
            }}>
              <Text style={{ fontSize: 9, color: '#8B5CF6', fontWeight: '800', marginBottom: 2 }}>CHAIN</Text>
              {[1,2,3,4,5].map(lvl => {
                const d = getDragonDef(lvl);
                return (
                  <View key={lvl} style={{ alignItems: 'center' }}>
                    <View style={{
                      width: 26, height: 26, borderRadius: 13,
                      backgroundColor: d.bgColor, borderWidth: 2, borderColor: d.borderColor,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 12 }}>{d.emoji}</Text>
                    </View>
                    {lvl < 5 && <Text style={{ color: '#D1D5DB', fontSize: 8, lineHeight: 10 }}>↓</Text>}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Booster bar */}
        <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 8, paddingTop: 6, paddingBottom: 4 }}>
          <BoosterBtn emoji="↩️" label="UNDO"    count={display.boosters.undo}    color="#8B5CF6" bgColor="#EDE9FE" onPress={handleUndo} />
          <BoosterBtn emoji="💣" label="BOMB"    count={display.boosters.bomb}    color="#EF4444" bgColor="#FEE2E2" onPress={handleBomb} />
          <BoosterBtn emoji="🧲" label="MAGNET"  count={display.boosters.magnet}  color="#3B82F6" bgColor="#DBEAFE" onPress={handleMagnet} />
          <BoosterBtn emoji="❄️" label="FREEZE"  count={display.boosters.freeze}  color="#06B6D4" bgColor="#CFFAFE" onPress={handleFreeze} />
          <BoosterBtn emoji="🌈" label="RAINBOW" count={display.boosters.rainbow} color="#EC4899" bgColor="#FCE7F3" onPress={handleRainbow} />
        </View>
      </SafeAreaView>
    </View>
  );
}
