import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  PanResponder,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import {
  createInitialState,
  createObject,
  tickPhysics,
  applyMerges,
  tickParticles,
  shakeBoard,
  applyMagnet,
  checkGameOver,
} from '@/lib/gameEngine';
import { getDragonDef, getRandomDropLevel } from '@/lib/gameData';
import type { GameState } from '@/lib/gameTypes';

import ScorePanel from '@/components/game/ScorePanel';
import NextPreview from '@/components/game/NextPreview';
import DragonSprite from '@/components/game/DragonSprite';
import MergeEffectsLayer from '@/components/game/MergeEffectsLayer';
import BoosterBar from '@/components/game/BoosterBar';

const BOARD_PADDING = 12;
const DROP_ZONE_Y = 70;

export default function GameScreen() {
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
  const BOARD_W = SCREEN_W - BOARD_PADDING * 2 - 68 - 8; // minus nextPreview + gap
  const BOARD_H = SCREEN_H * 0.57;

  const stateRef = useRef<GameState>(createInitialState());
  const [renderState, setRenderState] = useState<GameState>(stateRef.current);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const gameOverHandledRef = useRef(false);

  const [dropX, setDropX] = useState(BOARD_W / 2);
  const [bombMode, setBombMode] = useState(false);
  const [showCombo, setShowCombo] = useState(false);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tick = useCallback((timestamp: number) => {
    const state = stateRef.current;
    if (state.isPaused || state.isGameOver) {
      animFrameRef.current = requestAnimationFrame(tick);
      return;
    }

    const dt = lastTimeRef.current !== null
      ? Math.min((timestamp - lastTimeRef.current) / 1000, 0.05)
      : 0.016;
    lastTimeRef.current = timestamp;

    const { newObjects, merges } = tickPhysics(state, dt, BOARD_W, BOARD_H);

    let updated = newObjects;
    let newEffects = [...state.mergeEffects];
    let newParticles = [...state.particles];
    let scoreGain = 0;

    if (merges.length > 0) {
      const mergeResult = applyMerges(newObjects, merges, BOARD_W, BOARD_H);
      updated = mergeResult.updatedObjects;
      newEffects = [...newEffects, ...mergeResult.effects];
      newParticles = [...newParticles, ...mergeResult.newParticles];
      scoreGain = mergeResult.scoreGained;

      const newCombo = state.combo + merges.length;
      stateRef.current.combo = newCombo;
      stateRef.current.comboTimer = 2;
      setShowCombo(newCombo > 1);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => {
        stateRef.current.combo = 0;
        setShowCombo(false);
      }, 2000);
    }

    const updatedParticles = tickParticles(newParticles, dt);
    const now = Date.now();
    const freshEffects = newEffects.filter(e => now - e.createdAt < 1000);
    const totalScore = state.score + scoreGain;

    if (!gameOverHandledRef.current && checkGameOver(updated, BOARD_H, DROP_ZONE_Y)) {
      gameOverHandledRef.current = true;
      const finalState: GameState = {
        ...state,
        objects: updated,
        score: totalScore,
        isGameOver: true,
        mergeEffects: freshEffects,
        particles: updatedParticles,
      };
      stateRef.current = finalState;
      setRenderState({ ...finalState });
      router.push({
        pathname: '/(app)/level-complete',
        params: { score: Math.floor(totalScore), bestScore: Math.max(totalScore, state.bestScore) },
      } as never);
      return;
    }

    const nextState: GameState = {
      ...state,
      objects: updated,
      score: totalScore,
      bestScore: Math.max(totalScore, state.bestScore),
      mergeEffects: freshEffects,
      particles: updatedParticles,
    };
    stateRef.current = nextState;
    setRenderState({ ...nextState });

    animFrameRef.current = requestAnimationFrame(tick);
  }, [BOARD_W, BOARD_H]);

  useEffect(() => {
    stateRef.current.dropX = BOARD_W / 2;
    stateRef.current.nextLevel = getRandomDropLevel();
    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [tick]);

  const handleDrop = useCallback((x: number) => {
    const state = stateRef.current;
    if (!state.canDrop || state.isGameOver || state.isPaused) return;

    const def = getDragonDef(state.nextLevel);
    const clampedX = Math.max(def.radius + 2, Math.min(BOARD_W - def.radius - 2, x));
    const newObj = createObject(clampedX, def.radius + 5, state.nextLevel);
    newObj.vy = 50;

    stateRef.current = {
      ...state,
      objects: [...state.objects, newObj],
      nextLevel: getRandomDropLevel(),
      lastDroppedId: newObj.id,
      canDrop: false,
    };

    setTimeout(() => {
      stateRef.current.canDrop = true;
    }, 500);
  }, [BOARD_W]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        setDropX(Math.max(20, Math.min(BOARD_W - 20, gs.moveX - BOARD_PADDING - 68 - 8)));
      },
      onPanResponderRelease: (_, gs) => {
        handleDrop(Math.max(20, Math.min(BOARD_W - 20, gs.moveX - BOARD_PADDING - 68 - 8)));
      },
      onPanResponderTerminate: (_, gs) => {
        handleDrop(Math.max(20, Math.min(BOARD_W - 20, gs.moveX - BOARD_PADDING - 68 - 8)));
      },
    })
  ).current;

  const handleUndo = useCallback(() => {
    const s = stateRef.current;
    if (s.boosters.undo <= 0 || !s.lastDroppedId) return;
    stateRef.current = {
      ...s,
      objects: s.objects.filter(o => o.id !== s.lastDroppedId),
      boosters: { ...s.boosters, undo: s.boosters.undo - 1 },
      lastDroppedId: null,
    };
  }, []);

  const handleShake = useCallback(() => {
    const s = stateRef.current;
    if (s.boosters.shake <= 0) return;
    stateRef.current = {
      ...s,
      objects: shakeBoard(s.objects),
      boosters: { ...s.boosters, shake: s.boosters.shake - 1 },
    };
  }, []);

  const handleBomb = useCallback(() => {
    const s = stateRef.current;
    if (s.boosters.bomb <= 0) return;
    setBombMode(true);
  }, []);

  const handleBombSelect = useCallback((id: string) => {
    const s = stateRef.current;
    stateRef.current = {
      ...s,
      objects: s.objects.filter(o => o.id !== id),
      boosters: { ...s.boosters, bomb: s.boosters.bomb - 1 },
    };
    setBombMode(false);
  }, []);

  const handleMagnet = useCallback(() => {
    const s = stateRef.current;
    if (s.boosters.magnet <= 0) return;
    stateRef.current = {
      ...s,
      objects: applyMagnet(s.objects),
      boosters: { ...s.boosters, magnet: s.boosters.magnet - 1 },
    };
  }, []);

  const handlePause = useCallback(() => {
    stateRef.current.isPaused = !stateRef.current.isPaused;
    setRenderState(s => ({ ...s, isPaused: !s.isPaused }));
  }, []);

  const rs = renderState;

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0118' }}>
      <StatusBar style="light" backgroundColor="#0A0118" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScorePanel
          score={rs.score}
          bestScore={rs.bestScore}
          coins={rs.coins}
          gems={rs.gems}
          onPause={handlePause}
        />

        <View style={{
          flex: 1,
          flexDirection: 'row',
          paddingHorizontal: BOARD_PADDING,
          paddingTop: 4,
          gap: 8,
        }}>
          {/* Left panel: next preview + combo */}
          <View style={{ width: 68, alignItems: 'center', paddingTop: 8 }}>
            <NextPreview level={rs.nextLevel} />
            {showCombo && rs.combo > 1 && (
              <View style={{
                marginTop: 10,
                backgroundColor: '#F59E0B',
                borderRadius: 10,
                paddingHorizontal: 6,
                paddingVertical: 3,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#1A0A2E' }}>x{rs.combo}</Text>
                <Text style={{ fontSize: 8, color: '#1A0A2E', fontWeight: '700' }}>COMBO!</Text>
              </View>
            )}
          </View>

          {/* Game board */}
          <View style={{ flex: 1 }} {...panResponder.panHandlers}>
            {/* Wooden frame */}
            <View style={{
              flex: 1,
              borderRadius: 20,
              borderWidth: 6,
              borderColor: '#92400E',
              backgroundColor: '#78350F',
              padding: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.6,
              shadowRadius: 16,
              overflow: 'hidden',
            }}>
              {/* Play area */}
              <View style={{
                flex: 1,
                borderRadius: 15,
                backgroundColor: '#1E0B4E',
                borderWidth: 2,
                borderColor: '#3B1A7A',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {/* Background decor */}
                <View style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
                  {['✦', '✧', '⋆', '✦', '✧', '⋆', '✦', '✧', '⋆', '✦'].map((s, i) => (
                    <Text key={i} style={{
                      position: 'absolute',
                      left: `${8 + i * 9}%` as never,
                      top: `${4 + (i % 5) * 18}%` as never,
                      fontSize: 8 + (i % 3) * 4,
                      color: '#9D7EC9',
                    }}>{s}</Text>
                  ))}
                </View>

                {/* Aiming dotted line */}
                {rs.canDrop && !rs.isGameOver && (
                  <View pointerEvents="none" style={{
                    position: 'absolute',
                    left: dropX - 1,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    alignItems: 'center',
                  }}>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <View key={i} style={{
                        width: 2,
                        height: 7,
                        marginBottom: 5,
                        borderRadius: 1,
                        backgroundColor: `rgba(255,255,255,${0.55 - i * 0.02})`,
                      }} />
                    ))}
                  </View>
                )}

                {/* Drop ghost */}
                {rs.canDrop && !rs.isGameOver && (() => {
                  const def = getDragonDef(rs.nextLevel);
                  return (
                    <View pointerEvents="none" style={{
                      position: 'absolute',
                      left: dropX - def.radius,
                      top: 4,
                      width: def.radius * 2,
                      height: def.radius * 2,
                      borderRadius: def.radius,
                      backgroundColor: `${def.bgColor}CC`,
                      borderWidth: 2.5,
                      borderColor: def.color,
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.75,
                    }}>
                      <Text style={{ fontSize: def.radius * 0.72 }}>{def.emoji}</Text>
                    </View>
                  );
                })()}

                {/* Dragon objects */}
                {rs.objects.map(obj => (
                  <DragonSprite
                    key={obj.id}
                    object={obj}
                    onPress={bombMode ? handleBombSelect : undefined}
                    bombMode={bombMode}
                  />
                ))}

                <MergeEffectsLayer effects={rs.mergeEffects} particles={rs.particles} />

                {/* Bomb mode overlay */}
                {bombMode && (
                  <Pressable
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(239,68,68,0.12)',
                      borderRadius: 15,
                      alignItems: 'center',
                      paddingTop: 14,
                    }}
                    onPress={() => setBombMode(false)}
                  >
                    <View style={{
                      backgroundColor: '#EF4444',
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                    }}>
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
                        💣 Tap dragon to destroy · Tap here to cancel
                      </Text>
                    </View>
                  </Pressable>
                )}

                {/* Pause overlay */}
                {rs.isPaused && (
                  <Pressable
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(10,1,24,0.88)',
                      borderRadius: 15,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={handlePause}
                  >
                    <Text style={{ fontSize: 52 }}>⏸</Text>
                    <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 8 }}>PAUSED</Text>
                    <Text style={{ color: '#9D7EC9', fontSize: 13, marginTop: 6 }}>Tap to resume</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>

        <BoosterBar
          boosters={rs.boosters}
          onUndo={handleUndo}
          onShake={handleShake}
          onBomb={handleBomb}
          onMagnet={handleMagnet}
          bombMode={bombMode}
        />
      </SafeAreaView>
    </View>
  );
}
