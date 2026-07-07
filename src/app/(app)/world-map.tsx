import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Animated, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { WORLD_LEVELS } from '../../lib/gameData';

const MAP_BG  = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_f0c78cb0-9229-4431-8b69-91ee55362b01.jpg';
const ISLE_BG = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c4970965-c4c8-4e42-ab6b-aef8f88a9a93.jpg';

const CURRENT_LEVEL = 18;

const MISSIONS = [
  { id: 1, text: 'Merge 5 Penguins',  done: true  },
  { id: 2, text: 'Score 1200 pts',    done: true  },
  { id: 3, text: 'Use a Bomb booster',done: false },
  { id: 4, text: 'Reach level 19',    done: false },
];

function StarRow({ stars }: { stars: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3].map(i => (
        <Text key={i} style={{ fontSize: 13, opacity: i <= stars ? 1 : 0.3 }}>⭐</Text>
      ))}
    </View>
  );
}

// Floating island card
function IslandCard({ level, idx }: { level: typeof WORLD_LEVELS[0]; idx: number }) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -8, duration: 1800 + idx * 250, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0,  duration: 1800 + idx * 250, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [y, idx]);

  const isCurrent = level.id === CURRENT_LEVEL % WORLD_LEVELS.length + 1 || level.id === 3;
  const isLocked  = level.locked;

  return (
    <Animated.View style={{ transform: [{ translateY: y }], marginBottom: 14 }}>
      {/* Connector dot path */}
      {idx > 0 && (
        <View style={styles.dotPath}>
          {[0,1,2].map(d => (
            <View key={d} style={[styles.dot, { backgroundColor: isLocked ? '#6b7280' : '#f59e0b' }]} />
          ))}
        </View>
      )}
      <Pressable
        onPress={() => !isLocked && router.push('/(app)/game' as never)}
        style={[styles.islandCard, {
          borderColor: isCurrent ? '#f59e0b' : isLocked ? '#4b5563' : level.bgFrom,
          opacity: isLocked ? 0.6 : 1,
        }]}
      >
        {/* Island image thumbnail */}
        <View style={styles.islandThumb}>
          <Image source={{ uri: ISLE_BG }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 16 }]} />
          <Text style={{ fontSize: 32 }}>{level.emoji}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1, paddingLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Text style={[styles.islandName, { color: isLocked ? '#9ca3af' : '#fff' }]}>{level.name}</Text>
            {isLocked && <Text style={{ fontSize: 14 }}>🔒</Text>}
            {isCurrent && <View style={styles.nowBadge}><Text style={styles.nowText}>NOW</Text></View>}
          </View>
          <StarRow stars={level.stars} />
          <Text style={styles.targetText}>🎯 {level.targetScore.toLocaleString()} pts</Text>
        </View>

        {/* Play arrow */}
        {!isLocked && (
          <View style={[styles.playCircle, { backgroundColor: level.bgFrom }]}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>▶</Text>
          </View>
        )}

        {/* Level badge */}
        <View style={[styles.lvBadge, { backgroundColor: isLocked ? '#4b5563' : level.bgFrom }]}>
          <Text style={styles.lvText}>Lv.{level.id}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function WorldMapScreen() {
  const [showMissions, setShowMissions] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <Image source={{ uri: MAP_BG }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(10,5,30,0.55)' }]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>←</Text>
          </Pressable>
          <Text style={styles.title}>🗺️ WORLD MAP</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={styles.sideBtn} onPress={() => setShowMissions(v => !v)}>
              <Text style={{ fontSize: 18 }}>🎯</Text>
              <Text style={styles.sideBtnText}>MISSION</Text>
            </Pressable>
            <Pressable style={styles.sideBtn} onPress={() => {}}>
              <Text style={{ fontSize: 18 }}>🏆</Text>
              <Text style={styles.sideBtnText}>RANK</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* ── Island list ── */}
          <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          >
            {WORLD_LEVELS.map((level, i) => (
              <IslandCard key={level.id} level={level} idx={i} />
            ))}
            {/* More worlds teaser */}
            <View style={styles.teaserCard}>
              <Text style={{ fontSize: 32 }}>🌟</Text>
              <Text style={styles.teaserText}>More worlds coming soon!</Text>
            </View>
          </ScrollView>

          {/* ── Mission sidebar ── */}
          {showMissions && (
            <View style={styles.missionPanel}>
              <Text style={styles.missionTitle}>📋 MISSIONS</Text>
              {MISSIONS.map(m => (
                <View key={m.id} style={styles.missionRow}>
                  <Text style={{ fontSize: 14 }}>{m.done ? '✅' : '⬜'}</Text>
                  <Text style={[styles.missionText, m.done && { textDecorationLine: 'line-through', opacity: 0.5 }]}>
                    {m.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* ── Bottom PLAY button ── */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.playBtn} onPress={() => router.push('/(app)/game' as never)}>
          <Text style={styles.playText}>▶ PLAY LEVEL {CURRENT_LEVEL}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a1e' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  title: { flex: 1, color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  sideBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  sideBtnText: { color: '#fff', fontSize: 8, fontWeight: '800', marginTop: 1 },
  islandCard: {
    backgroundColor: 'rgba(20,10,50,0.82)',
    borderRadius: 20, padding: 12,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, overflow: 'hidden',
  },
  islandThumb: {
    width: 72, height: 72, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  islandName: { fontWeight: '900', fontSize: 15 },
  nowBadge: {
    backgroundColor: '#f59e0b', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  nowText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  targetText: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 4 },
  playCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  lvBadge: {
    position: 'absolute', top: -2, left: 8,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 1.5, borderColor: '#fff',
  },
  lvText: { color: '#fff', fontWeight: '900', fontSize: 10 },
  dotPath: {
    alignItems: 'center', gap: 4, paddingVertical: 2, marginBottom: 2,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  teaserCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18, padding: 20, alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
  },
  teaserText: { color: 'rgba(255,255,255,0.6)', fontWeight: '700', fontSize: 13 },
  missionPanel: {
    width: 140,
    backgroundColor: 'rgba(15,8,40,0.92)',
    borderLeftWidth: 2, borderLeftColor: '#f59e0b',
    paddingTop: 16, paddingHorizontal: 10,
  },
  missionTitle: {
    color: '#f59e0b', fontWeight: '900', fontSize: 11,
    letterSpacing: 0.5, marginBottom: 10,
  },
  missionRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: 6, marginBottom: 10,
  },
  missionText: { color: '#fff', fontSize: 10, flex: 1 },
  bottomBar: {
    backgroundColor: 'rgba(15,8,40,0.95)',
    borderTopWidth: 2, borderTopColor: '#f59e0b',
    padding: 14, paddingBottom: 28,
  },
  playBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 24, paddingVertical: 16,
    alignItems: 'center', borderWidth: 3, borderColor: '#15803d',
  },
  playText: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
});
