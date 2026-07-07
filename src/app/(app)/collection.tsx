import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, FlatList, Animated, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DRAGON_LEVELS, RARITY_CONFIG } from '../../lib/gameData';
import type { Rarity } from '../../lib/gameTypes';

const PANEL_BG = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d19d64f2-e9c2-42e8-a7a9-20af2ac39db5.jpg';

const UNLOCKED_LEVELS = [1, 2, 3, 4, 5, 6, 7];
type FilterTab = Rarity | 'all' | 'legendary';
const FILTER_TABS: { key: FilterTab; label: string; color: string; bg: string }[] = [
  { key: 'all',       label: 'ALL',       color: '#fff',    bg: '#7c5cfc' },
  { key: 'common',    label: 'COMMON',    color: '#fff',    bg: '#6b7280' },
  { key: 'rare',      label: 'RARE',      color: '#fff',    bg: '#3b82f6' },
  { key: 'legendary', label: 'LEGENDARY', color: '#fff',    bg: '#f59e0b' },
];

// ── Cartoon character card ────────────────────────────────────────────────────
function CharCard({ dragon, unlocked }: { dragon: typeof DRAGON_LEVELS[0]; unlocked: boolean }) {
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!unlocked) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -5, duration: 1000, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0,  duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [unlocked, bounce]);

  return (
    <View style={styles.cardWrap}>
      <Animated.View style={[
        styles.card,
        { borderColor: unlocked ? dragon.borderColor : '#d1d5db',
          backgroundColor: unlocked ? dragon.bgColor : '#f3f4f6' },
        { transform: [{ translateY: bounce }] },
      ]}>
        {/* Glow */}
        {unlocked && (
          <View style={[styles.cardGlow, { backgroundColor: dragon.glowColor }]} />
        )}
        {/* Character circle */}
        <View style={[styles.charCircle, {
          backgroundColor: unlocked ? dragon.bgColor : '#e5e7eb',
          borderColor: unlocked ? dragon.borderColor : '#d1d5db',
        }]}>
          {unlocked
            ? <Text style={{ fontSize: 28 }}>{dragon.emoji}</Text>
            : <Text style={{ fontSize: 22, opacity: 0.35 }}>❓</Text>
          }
        </View>
        {/* Name */}
        <Text style={[styles.cardName, { color: unlocked ? '#1e1b4b' : '#9ca3af' }]} numberOfLines={1}>
          {unlocked ? dragon.name : '???'}
        </Text>
        {/* Lock badge */}
        {!unlocked && (
          <View style={styles.lockBadge}><Text style={{ fontSize: 12 }}>🔒</Text></View>
        )}
        {/* Level badge */}
        <View style={[styles.lvBadge, { backgroundColor: unlocked ? dragon.color : '#9ca3af' }]}>
          <Text style={styles.lvText}>Lv{dragon.level}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ── Merge guide row ───────────────────────────────────────────────────────────
function MergeGuide() {
  const pairs = [
    [DRAGON_LEVELS[0], DRAGON_LEVELS[1]],
    [DRAGON_LEVELS[2], DRAGON_LEVELS[3]],
    [DRAGON_LEVELS[4], DRAGON_LEVELS[5]],
  ];
  return (
    <View style={styles.mergeGuide}>
      <Text style={styles.mergeTitle}>MERGE GUIDE</Text>
      {pairs.map(([a, b], i) => (
        <View key={i} style={styles.mergeRow}>
          <View style={[styles.mergeCircle, { backgroundColor: a.bgColor, borderColor: a.borderColor }]}>
            <Text style={{ fontSize: 18 }}>{a.emoji}</Text>
          </View>
          <Text style={styles.mergePlus}>+</Text>
          <View style={[styles.mergeCircle, { backgroundColor: a.bgColor, borderColor: a.borderColor }]}>
            <Text style={{ fontSize: 18 }}>{a.emoji}</Text>
          </View>
          <Text style={styles.mergePlus}>=</Text>
          <View style={[styles.mergeCircle, { backgroundColor: b.bgColor, borderColor: b.borderColor }]}>
            <Text style={{ fontSize: 22 }}>{b.emoji}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export default function CollectionScreen() {
  const [filter, setFilter] = useState<FilterTab>('all');
  const filtered = DRAGON_LEVELS.filter(d =>
    filter === 'all'       ? true :
    filter === 'legendary' ? (d.rarity === 'legendary' || d.rarity === 'mythic') :
    d.rarity === filter
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      {/* BG */}
      <Image source={{ uri: PANEL_BG }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(15,8,40,0.6)' }]} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>📦 COLLECTION</Text>
          <View style={styles.countBadge}>
            <Text style={{ color: '#f59e0b', fontWeight: '900', fontSize: 13 }}>
              {UNLOCKED_LEVELS.length}/{DRAGON_LEVELS.length}
            </Text>
          </View>
        </View>

        {/* ── Filter tabs ── */}
        <View style={styles.tabRow}>
          {FILTER_TABS.map(tab => {
            const active = filter === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setFilter(tab.key)}
                style={[styles.tab, { backgroundColor: active ? tab.bg : 'rgba(255,255,255,0.12)', borderColor: active ? tab.bg : 'rgba(255,255,255,0.2)' }]}
              >
                <Text style={[styles.tabText, { color: active ? '#fff' : 'rgba(255,255,255,0.7)' }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Grid ── */}
        <FlatList
          data={filtered}
          numColumns={3}
          keyExtractor={d => `${d.level}`}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 16 }}
          ListFooterComponent={<MergeGuide />}
          renderItem={({ item }) => (
            <CharCard dragon={item} unlocked={UNLOCKED_LEVELS.includes(item.level)} />
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1a0a3b' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },
  closeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: { flex: 1, color: '#fff', fontWeight: '900', fontSize: 20, letterSpacing: 1 },
  countBadge: {
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1.5, borderColor: '#f59e0b',
  },
  tabRow: {
    flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 10, gap: 8,
  },
  tab: {
    flex: 1, borderRadius: 20, paddingVertical: 7,
    alignItems: 'center', borderWidth: 1.5,
  },
  tabText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  cardWrap: { flex: 1, margin: 5, maxWidth: '33.33%' },
  card: {
    borderRadius: 18, paddingTop: 12, paddingBottom: 8, paddingHorizontal: 6,
    alignItems: 'center', borderWidth: 2.5, overflow: 'hidden', minHeight: 110,
  },
  cardGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    opacity: 0.18,
  },
  charCircle: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, marginBottom: 6,
  },
  cardName: { fontSize: 10, fontWeight: '800', textAlign: 'center' },
  lockBadge: {
    position: 'absolute', bottom: 6, right: 6,
  },
  lvBadge: {
    position: 'absolute', top: -2, right: -2,
    borderRadius: 9, paddingHorizontal: 5, paddingVertical: 1,
    borderWidth: 1.5, borderColor: '#fff',
  },
  lvText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  mergeGuide: {
    margin: 10, borderRadius: 20,
    backgroundColor: 'rgba(255,220,100,0.12)',
    borderWidth: 2, borderColor: '#f59e0b',
    padding: 14,
  },
  mergeTitle: {
    color: '#f59e0b', fontWeight: '900', fontSize: 13,
    letterSpacing: 1, textAlign: 'center', marginBottom: 10,
  },
  mergeRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, marginBottom: 8,
  },
  mergeCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  mergePlus: { color: '#fff', fontWeight: '900', fontSize: 18 },
});
