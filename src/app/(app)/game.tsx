import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  View, Text, Pressable, Animated, ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import {
  createInitialState, tickPhysics, applyMerges,
  tickParticles, applyMagnet, checkDangerLine, checkLevelComplete,
  getLevelTarget, buildComboLabel, explodeBomb,
  spawnBombObject, pickSpecialEvent, createObject, DANGER_RATIO,
} from '../../lib/gameEngine';
import { getDragonDef, getRandomDropLevel } from '../../lib/gameData';
import type { GameState, PhysicsObject, BombWarning } from '../../lib/gameTypes';

import ScorePanel from '../../components/game/ScorePanel';
import NextPreview from '../../components/game/NextPreview';
import BoosterBar from '../../components/game/BoosterBar';
import DragonSprite from '../../components/game/DragonSprite';
import MergeEffectsLayer from '../../components/game/MergeEffectsLayer';

const BOARD_W = 340;
const BOARD_H = 480;
const DROP_ZONE_H = 70;
const AIMING_DOTS = 8;

// ── Bomb warning indicator ──────────────────────────────────────
function BombWarningUI({ warning }: { warning: BombWarning }) {
  const blink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.2, duration: 300, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [blink]);
  return (
    <Animated.View style={{
      position: 'absolute', top: 4, left: warning.x - 20, opacity: blink,
    }}>
      <Text style={{ fontSize: 24 }}>💣</Text>
      <View style={{
        backgroundColor: '#EF4444', borderRadius: 8, alignItems: 'center',
        paddingHorizontal: 4, marginTop: -4,
      }}>
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{warning.countdown}</Text>
      </View>
    </Animated.View>
  );
}

// ── Special event banner ────────────────────────────────────────
function SpecialEventBanner({ event }: { event: NonNullable<GameState['specialEvent']> }) {
  const slide = useRef(new Animated.Value(-80)).current;
  useEffect(() => {
    Animated.spring(slide, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }).start();
  }, [slide]);
  return (
    <Animated.View style={{
      position: 'absolute', top: 8, left: 8, right: 8,
      backgroundColor: event.color, borderRadius: 16,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      padding: 10, gap: 8, transform: [{ translateY: slide }],
      shadowColor: event.color, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5, shadowRadius: 10,
    }}>
      <Text style={{ fontSize: 24 }}>{event.emoji}</Text>
      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{event.label}</Text>
      {event.duration > 0 && (
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 13 }}>{Math.ceil(event.duration)}s</Text>
      )}
    </Animated.View>
  );
}

// ── Danger line ────────────────────────────────────────────────
function DangerLine({ boardWidth, boardHeight, dangerTimer }: {
  boardWidth: number; boardHeight: number; dangerTimer: number;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const dangerY = boardHeight * DANGER_RATIO;
  useEffect(() => {
    if (dangerTimer > 0) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.3, duration: 200, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulse.setValue(0.6);
    }
  }, [dangerTimer, pulse]);
  return (
    <Animated.View style={{
      position: 'absolute', left: 0, right: 0,
      top: dangerY, height: 2,
      backgroundColor: '#EF4444',
      opacity: pulse,
    }}>
      <View style={{
        position: 'absolute', right: 2, top: -12,
        backgroundColor: '#EF4444', borderRadius: 8,
        paddingHorizontal: 5, paddingVertical: 1,
      }}>
        <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800' }}>DANGER</Text>
      </View>
    </Animated.View>
  );
}

// ── Pause overlay ──────────────────────────────────────────────
function PauseOverlay({ onResume, onHome }: { onResume: () => void; onHome: () => void }) {
  return (
    <View style={{
      position: 'absolute', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
      borderRadius: 16,
    }}>
      <View style={{
        backgroundColor: '#fff', borderRadius: 24, padding: 28,
        alignItems: 'center', gap: 14, width: 250,
      }}>
        <Text style={{ fontSize: 40 }}>⏸️</Text>
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#1E1B4B' }}>Paused</Text>
        <Pressable onPress={onResume} style={{
          backgroundColor: '#22C55E', borderRadius: 16, paddingVertical: 12,
          paddingHorizontal: 32, width: '100%', alignItems: 'center',
        }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>▶️  Resume</Text>
        </Pressable>
        <Pressable onPress={onHome} style={{
          backgroundColor: '#F3F0FF', borderRadius: 16, paddingVertical: 12,
          paddingHorizontal: 32, width: '100%', alignItems: 'center',
          borderWidth: 2, borderColor: '#8B5CF6',
        }}>
          <Text style={{ color: '#8B5CF6', fontWeight: '800', fontSize: 15 }}>🏠  Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Game Over overlay ──────────────────────────────────────────
function GameOverOverlay({
  state, onRetry, onHome,
}: { state: GameState; onRetry: () => void; onHome: () => void }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start();
  }, [scale]);
  return (
    <View style={{
      position: 'absolute', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center',
      borderRadius: 16,
    }}>
      <Animated.View style={{
        backgroundColor: '#fff', borderRadius: 28, padding: 24,
        alignItems: 'center', gap: 10, width: 280,
        transform: [{ scale }],
      }}>
        <Text style={{ fontSize: 52 }}>😢</Text>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#EF4444' }}>Game Over!</Text>
        <View style={{ backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12, width: '100%', gap: 6 }}>
          {[
            ['🎯 Score', state.score.toLocaleString()],
            ['🏆 Best', Math.max(state.score, state.bestScore).toLocaleString()],
            ['🪙 Coins Earned', `+${Math.floor(state.score / 20)}`],
            ['⚡ Best Combo', `×${state.highestCombo}`],
          ].map(([label, val]) => (
            <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#6B7280', fontWeight: '600', fontSize: 13 }}>{label}</Text>
              <Text style={{ color: '#1E1B4B', fontWeight: '800', fontSize: 13 }}>{val}</Text>
            </View>
          ))}
        </View>
        <Pressable onPress={onRetry} style={{
          backgroundColor: '#8B5CF6', borderRadius: 16, paddingVertical: 13,
          width: '100%', alignItems: 'center',
        }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>🔄  Retry</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
          <Pressable onPress={onHome} style={{
            flex: 1, backgroundColor: '#F3F0FF', borderRadius: 14,
            paddingVertical: 11, alignItems: 'center',
            borderWidth: 2, borderColor: '#8B5CF6',
          }}>
            <Text style={{ color: '#8B5CF6', fontWeight: '800' }}>🏠 Home</Text>
          </Pressable>
          <Pressable style={{
            flex: 1, backgroundColor: '#FEF3C7', borderRadius: 14,
            paddingVertical: 11, alignItems: 'center',
            borderWidth: 2, borderColor: '#FCD34D',
          }} onPress={onRetry}>
            <Text style={{ color: '#B45309', fontWeight: '800' }}>📺 Continue</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

// ── Level Complete overlay ─────────────────────────────────────
function LevelCompleteOverlay({
  state, onNext, onHome,
}: { state: GameState; onNext: () => void; onHome: () => void }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const stars = state.score >= getLevelTarget(state.currentLevel) * 1.5 ? 3
               : state.score >= getLevelTarget(state.currentLevel) * 1.2 ? 2 : 1;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start();
  }, [scale]);
  return (
    <View style={{
      position: 'absolute', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
      borderRadius: 16,
    }}>
      <Animated.View style={{
        backgroundColor: '#fff', borderRadius: 28, padding: 24,
        alignItems: 'center', gap: 12, width: 280,
        transform: [{ scale }],
      }}>
        <Text style={{ fontSize: 52 }}>🎉</Text>
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#22C55E' }}>Level Complete!</Text>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[1,2,3].map(i => (
            <Text key={i} style={{ fontSize: 36, opacity: i <= stars ? 1 : 0.25 }}>⭐</Text>
          ))}
        </View>
        <View style={{ backgroundColor: '#F0FDF4', borderRadius: 14, padding: 12, width: '100%', gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#6B7280', fontSize: 13 }}>🎯 Score</Text>
            <Text style={{ color: '#1E1B4B', fontWeight: '800', fontSize: 13 }}>{state.score.toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#6B7280', fontSize: 13 }}>🪙 Reward</Text>
            <Text style={{ color: '#F59E0B', fontWeight: '800', fontSize: 13 }}>+{stars * 100} coins</Text>
          </View>
        </View>
        <Pressable onPress={onNext} style={{
          backgroundColor: '#8B5CF6', borderRadius: 16, paddingVertical: 13,
          width: '100%', alignItems: 'center',
        }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>Next Level ➡️</Text>
        </Pressable>
        <Pressable onPress={onHome} style={{
          backgroundColor: '#F3F0FF', borderRadius: 14, paddingVertical: 11,
          width: '100%', alignItems: 'center', borderWidth: 2, borderColor: '#8B5CF6',
        }}>
          <Text style={{ color: '#8B5CF6', fontWeight: '800' }}>🏠 Home</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Main game screen ────────────────────────────────────────────
export default function GameScreen() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [dropX, setDropX] = useState(BOARD_W / 2);
  const [touching, setTouching] = useState(false);
  const stateRef = useRef(gameState);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const boardRef = useRef<View>(null);
  const camShake = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  stateRef.current = gameState;

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(camShake, { toValue: { x: -6, y: -4 }, duration: 60, useNativeDriver: true }),
      Animated.timing(camShake, { toValue: { x: 6, y: 4 }, duration: 60, useNativeDriver: true }),
      Animated.timing(camShake, { toValue: { x: -4, y: 2 }, duration: 50, useNativeDriver: true }),
      Animated.timing(camShake, { toValue: { x: 0, y: 0 }, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [camShake]);

  const gameLoop = useCallback((timestamp: number) => {
    const s = stateRef.current;
    if (s.isPaused || s.isGameOver || s.isLevelComplete) {
      lastTimeRef.current = null;
      animFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    if (lastTimeRef.current === null) { lastTimeRef.current = timestamp; }
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    setGameState(prev => {
      let next = { ...prev };

      // Tick timers
      let nextBombIn = prev.nextBombIn - dt;
      let nextEventIn = prev.nextEventIn - dt;
      let doubleScoreTimer = Math.max(0, prev.doubleScoreTimer - dt);
      let freezeTimer = Math.max(0, prev.freezeTimer - dt);
      let comboTimer = prev.comboTimer - dt;
      let combo = comboTimer > 0 ? prev.combo : 0;
      let specialEvent = prev.specialEvent;
      let bombWarning = prev.bombWarning;

      // Special event tick
      if (specialEvent && specialEvent.duration > 0) {
        const newDur = specialEvent.duration - dt;
        if (newDur <= 0) { specialEvent = null; }
        else { specialEvent = { ...specialEvent, duration: newDur }; }
      }

      // Bomb warning countdown
      if (bombWarning) {
        const age = (Date.now() - bombWarning.createdAt) / 1000;
        if (age >= 1) {
          const newCountdown = 3 - Math.floor(age);
          if (newCountdown <= 0) {
            // drop bomb
            const bomb = spawnBombObject(BOARD_W, bombWarning);
            next.objects = [...next.objects, bomb];
            bombWarning = null;
          } else {
            bombWarning = { ...bombWarning, countdown: newCountdown };
          }
        }
      }

      // Schedule bomb
      if (nextBombIn <= 0 && !bombWarning) {
        bombWarning = {
          x: 40 + Math.random() * (BOARD_W - 80),
          countdown: 3,
          createdAt: Date.now(),
        };
        nextBombIn = 20 + Math.random() * 20;
      }

      // Schedule special event
      if (nextEventIn <= 0 && !specialEvent) {
        specialEvent = pickSpecialEvent();
        nextEventIn = 15 + Math.random() * 15;
        if (specialEvent.type === 'double_score') doubleScoreTimer = 10;
        if (specialEvent.type === 'freeze_time') freezeTimer = 5;
      }

      // Physics
      const { newObjects, merges } = tickPhysics(
        { ...prev, freezeTimer },
        dt, BOARD_W, BOARD_H
      );

      // Explode bombs that hit floor
      let physObjects = newObjects;
      const bombs = physObjects.filter(o => o.isBomb && o.y + o.radius >= BOARD_H);
      for (const b of bombs) {
        const { updatedObjects, particles: newP, scoreGained } = explodeBomb(physObjects, b.x, b.y, BOARD_W, BOARD_H);
        physObjects = updatedObjects;
        next.particles = [...(next.particles || []), ...newP];
        next.score = (next.score || prev.score) + scoreGained;
        triggerShake();
      }

      // Merges
      let scoreGained = 0;
      let mergeParticles: typeof prev.particles = [];
      let mergeEffects = [...prev.mergeEffects];
      let comboLabels = [...prev.comboLabels];

      if (merges.length > 0) {
        const mult = doubleScoreTimer > 0 ? 2 : 1;
        const result = applyMerges(physObjects, merges, BOARD_W, BOARD_H, mult);
        physObjects = result.updatedObjects;
        scoreGained = result.scoreGained;
        mergeEffects = [...mergeEffects, ...result.effects];
        mergeParticles = result.newParticles;
        combo = (comboTimer > 0 ? prev.combo : 0) + merges.length;
        comboTimer = 2.5;

        // Combo label
        if (combo >= 2) {
          const lx = BOARD_W / 2;
          const ly = BOARD_H / 3;
          comboLabels = [...comboLabels, buildComboLabel(combo, lx, ly)];
        }
      }

      // Tick particles
      const ticked = tickParticles([...prev.particles, ...mergeParticles], dt);

      // Danger check
      const inDanger = checkDangerLine(physObjects, BOARD_H);
      const dangerTimer = inDanger ? prev.dangerTimer + dt : 0;
      const isGameOver = dangerTimer >= 3;

      // Level complete check
      const newScore = prev.score + scoreGained + (next.score ? next.score - prev.score : 0);
      const isLevelComplete = checkLevelComplete(newScore, prev.currentLevel);

      return {
        ...prev,
        ...next,
        objects: physObjects,
        score: newScore,
        mergeEffects: mergeEffects.filter(e => Date.now() - e.createdAt < 1200),
        particles: ticked,
        comboLabels: comboLabels.filter(l => Date.now() - l.createdAt < 1300),
        combo, comboTimer,
        dangerTimer,
        isGameOver,
        isLevelComplete,
        doubleScoreTimer,
        freezeTimer,
        specialEvent,
        bombWarning,
        nextBombIn,
        nextEventIn,
        highestCombo: Math.max(prev.highestCombo, combo),
      };
    });

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [triggerShake]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [gameLoop]);

  const handleBoardMove = useCallback((evt: { nativeEvent: { locationX: number } }) => {
    const x = Math.max(20, Math.min(BOARD_W - 20, evt.nativeEvent.locationX));
    setDropX(x);
  }, []);

  const handleDrop = useCallback(() => {
    setGameState(prev => {
      if (!prev.canDrop || prev.isGameOver || prev.isPaused || prev.isLevelComplete) return prev;
      const def = getDragonDef(prev.nextLevel);
      const obj = createObject(dropX, def.radius + 2, prev.nextLevel);
      obj.opacity = 1;
      return {
        ...prev,
        objects: [...prev.objects, obj],
        nextLevel: getRandomDropLevel(),
        lastDroppedId: obj.id,
        canDrop: false,
      };
    });
    setTimeout(() => setGameState(s => ({ ...s, canDrop: true })), 500);
  }, [dropX]);

  const handleUndo = useCallback(() => {
    setGameState(prev => {
      if (prev.boosters.undo === 0 || !prev.lastDroppedId) return prev;
      return {
        ...prev,
        objects: prev.objects.filter(o => o.id !== prev.lastDroppedId),
        boosters: { ...prev.boosters, undo: prev.boosters.undo - 1 },
        lastDroppedId: null,
      };
    });
  }, []);

  const handleBomb = useCallback(() => {
    setGameState(prev => {
      if (prev.boosters.bomb === 0) return prev;
      // Remove topmost dragon
      const topmost = [...prev.objects].sort((a, b) => a.y - b.y)[0];
      if (!topmost) return prev;
      return {
        ...prev,
        objects: prev.objects.filter(o => o.id !== topmost.id),
        boosters: { ...prev.boosters, bomb: prev.boosters.bomb - 1 },
      };
    });
    triggerShake();
  }, [triggerShake]);

  const handleMagnet = useCallback(() => {
    setGameState(prev => {
      if (prev.boosters.magnet === 0) return prev;
      return {
        ...prev,
        objects: applyMagnet(prev.objects),
        boosters: { ...prev.boosters, magnet: prev.boosters.magnet - 1 },
      };
    });
  }, []);

  const handleFreeze = useCallback(() => {
    setGameState(prev => {
      if (prev.boosters.freeze === 0) return prev;
      return {
        ...prev,
        freezeTimer: 5,
        boosters: { ...prev.boosters, freeze: prev.boosters.freeze - 1 },
      };
    });
  }, []);

  const handleRainbow = useCallback(() => {
    setGameState(prev => {
      if (prev.boosters.rainbow === 0) return prev;
      // Merge any two adjacent objects
      const objs = prev.objects;
      if (objs.length < 2) return prev;
      const a = objs[objs.length - 1];
      const b = objs[objs.length - 2];
      const maxLvl = Math.max(a.level, b.level);
      const def = getDragonDef(Math.min(maxLvl + 1, 11));
      const newObj = createObject((a.x + b.x) / 2, (a.y + b.y) / 2, def.level);
      newObj.scale = 1.4;
      return {
        ...prev,
        objects: [...objs.filter(o => o.id !== a.id && o.id !== b.id), newObj],
        boosters: { ...prev.boosters, rainbow: prev.boosters.rainbow - 1 },
        score: prev.score + def.score,
      };
    });
  }, []);

  const handleRetry = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  const { isGameOver, isLevelComplete, isPaused, specialEvent, bombWarning, dangerTimer } = gameState;
  const currentDef = getDragonDef(gameState.nextLevel);

  // Aiming dotted line
  const dots = Array.from({ length: AIMING_DOTS }, (_, i) => ({
    y: i * (DROP_ZONE_H / AIMING_DOTS),
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#87CEEB' }}>
      <StatusBar style="dark" backgroundColor="#ADE3F7" />
      {/* Sky background layers */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ADE3F7' }} />
      <View style={{ position: 'absolute', top: '50%', left: 0, right: 0, bottom: 0, backgroundColor: '#C5EDFC' }} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          scrollEnabled={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Score panel */}
          <ScorePanel
            score={gameState.score}
            bestScore={gameState.bestScore}
            coins={gameState.coins}
            gems={gameState.gems}
            levelTarget={getLevelTarget(gameState.currentLevel)}
            currentLevel={gameState.currentLevel}
            onPause={() => setGameState(s => ({ ...s, isPaused: true }))}
            onShop={() => router.push('/(app)/shop' as never)}
          />

          {/* Board + side */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', paddingHorizontal: 8, gap: 8 }}>
            {/* Game board */}
            <Animated.View
              style={{
                transform: [{ translateX: camShake.x }, { translateY: camShake.y }],
              }}
            >
              <View style={{
                width: BOARD_W + 12, height: BOARD_H + 56,
                backgroundColor: '#8B6914',
                borderRadius: 18,
                padding: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4, shadowRadius: 12,
                borderWidth: 3, borderColor: '#6D4C10',
              }}>
                {/* Wooden top beam */}
                <View style={{
                  height: DROP_ZONE_H, backgroundColor: '#A0784E',
                  borderRadius: 12, marginBottom: 4, justifyContent: 'center',
                  borderWidth: 1, borderColor: '#7A5C35',
                }}>
                  {/* Drop indicator */}
                  {dots.map((d, i) => (
                    <View key={i} style={{
                      position: 'absolute', left: dropX - 1, top: d.y,
                      width: 2, height: 5, borderRadius: 1,
                      backgroundColor: 'rgba(255,255,255,0.6)',
                    }} />
                  ))}
                  {/* Ghost preview of next object */}
                  <View style={{
                    position: 'absolute',
                    left: dropX - currentDef.radius,
                    bottom: 4,
                    width: currentDef.radius * 2,
                    height: currentDef.radius * 2,
                    borderRadius: currentDef.radius,
                    backgroundColor: currentDef.bgColor,
                    borderWidth: 2, borderColor: currentDef.borderColor,
                    alignItems: 'center', justifyContent: 'center',
                    opacity: 0.75,
                  }}>
                    <Text style={{ fontSize: currentDef.radius * 0.8 }}>{currentDef.emoji}</Text>
                  </View>
                </View>

                {/* Play area */}
                <Pressable
                  ref={boardRef}
                  onPress={handleDrop}
                  onPressIn={(e) => { setTouching(true); handleBoardMove(e); }}
                  onPressOut={() => setTouching(false)}
                  style={{
                    width: BOARD_W, height: BOARD_H,
                    backgroundColor: '#E8F8FF',
                    borderRadius: 10, overflow: 'hidden',
                    borderWidth: 1, borderColor: '#BAD8F0',
                  }}
                >
                  {/* Subtle grid lines */}
                  {[100, 200, 300, 400].map(yy => (
                    <View key={yy} style={{
                      position: 'absolute', left: 0, right: 0, top: yy,
                      height: 1, backgroundColor: 'rgba(100,160,220,0.1)',
                    }} />
                  ))}

                  {/* Dragon objects */}
                  {gameState.objects.map(obj => (
                    <DragonSprite key={obj.id} obj={obj} boardWidth={BOARD_W} boardHeight={BOARD_H} />
                  ))}

                  {/* Danger line */}
                  <DangerLine boardWidth={BOARD_W} boardHeight={BOARD_H} dangerTimer={dangerTimer} />

                  {/* Merge effects */}
                  <MergeEffectsLayer
                    effects={gameState.mergeEffects}
                    particles={gameState.particles}
                    comboLabels={gameState.comboLabels}
                  />

                  {/* Bomb warning */}
                  {bombWarning && <BombWarningUI warning={bombWarning} />}

                  {/* Special event banner */}
                  {specialEvent && <SpecialEventBanner event={specialEvent} />}

                  {/* Freeze overlay */}
                  {gameState.freezeTimer > 0 && (
                    <View style={{
                      position: 'absolute', inset: 0,
                      backgroundColor: 'rgba(147,210,255,0.15)',
                      borderWidth: 2, borderColor: 'rgba(56,189,248,0.4)', borderRadius: 10,
                    }}>
                      <Text style={{ position: 'absolute', top: 8, right: 8, fontSize: 22 }}>❄️</Text>
                    </View>
                  )}

                  {/* Double score overlay */}
                  {gameState.doubleScoreTimer > 0 && (
                    <View style={{
                      position: 'absolute', top: 8, left: 8,
                      backgroundColor: '#8B5CF6', borderRadius: 12,
                      paddingHorizontal: 8, paddingVertical: 3,
                    }}>
                      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>
                        ⚡ 2× SCORE {Math.ceil(gameState.doubleScoreTimer)}s
                      </Text>
                    </View>
                  )}

                  {/* Paused/Game Over/Level Complete overlays */}
                  {isPaused && !isGameOver && !isLevelComplete && (
                    <PauseOverlay
                      onResume={() => setGameState(s => ({ ...s, isPaused: false }))}
                      onHome={() => router.push('/(app)/home' as never)}
                    />
                  )}
                  {isGameOver && !isLevelComplete && (
                    <GameOverOverlay state={gameState} onRetry={handleRetry}
                      onHome={() => router.push('/(app)/home' as never)} />
                  )}
                  {isLevelComplete && (
                    <LevelCompleteOverlay state={gameState}
                      onNext={() => setGameState(s => ({
                        ...createInitialState(),
                        currentLevel: s.currentLevel + 1,
                        bestScore: Math.max(s.score, s.bestScore),
                        coins: s.coins + 100,
                      }))}
                      onHome={() => router.push('/(app)/home' as never)}
                    />
                  )}
                </Pressable>
              </View>
            </Animated.View>

            {/* Side panel */}
            <View style={{ gap: 10, paddingTop: 6, alignItems: 'center' }}>
              <NextPreview level={gameState.nextLevel} />
              {/* Mini dragon guide */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                borderRadius: 14, padding: 8, alignItems: 'center', gap: 4, width: 70,
              }}>
                <Text style={{ fontSize: 9, color: '#8B5CF6', fontWeight: '800' }}>CHAIN</Text>
                {[1,2,3,4,5,6].map(lvl => {
                  const d = getDragonDef(lvl);
                  return (
                    <View key={lvl} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <View style={{
                        width: 20, height: 20, borderRadius: 10,
                        backgroundColor: d.bgColor, borderWidth: 1.5, borderColor: d.borderColor,
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text style={{ fontSize: 10 }}>{d.emoji}</Text>
                      </View>
                      {lvl < 6 && <Text style={{ color: '#9CA3AF', fontSize: 8 }}>→</Text>}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Booster bar */}
          <View style={{ marginTop: 8 }}>
            <BoosterBar
              boosters={gameState.boosters}
              onUndo={handleUndo}
              onBomb={handleBomb}
              onMagnet={handleMagnet}
              onFreeze={handleFreeze}
              onRainbow={handleRainbow}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
