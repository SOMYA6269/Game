// @ts-nocheck
/**
 * COLLECTION SCREEN — Premium redesign
 * - Rarity-coloured glow borders (grey→green→blue→purple→gold→mythic)
 * - Dragon portrait on circular pedestal with radial light (museum display)
 * - Locked: silhouette through fog, NOT plain lock icon
 * - Progress bar: thick gradient fill matching rarity, shimmer sweep
 * - Top banner: trophy-case style with particle sparkles
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, FlatList,
  useWindowDimensions, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AnimalAvatar, ANIMAL_DEFS, RARITY_COLORS } from '../../components/game/AnimalAvatar';

const UNLOCKED = [true, true, true, true, true, false, false, false, false, false];

const RARITY_GLOW: Record<string, string[]> = {
  Common:    ['#374151','#4B5563'],
  Uncommon:  ['#065F46','#059669'],
  Rare:      ['#1E3A8A','#2563EB'],
  Epic:      ['#4C1D95','#7C3AED'],
  Legendary: ['#78350F','#D97706'],
  Mythic:    ['#7B1FA2','#E040FB'],
};

// ── Sparkle particle ──────────────────────────────────────────────────────────
function Particle({ delay }: { delay: number }) {
  const op = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const dx = (Math.random() - 0.5) * 60;
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(op, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(ty, { toValue: -20, duration: 1200, useNativeDriver: true }),
        Animated.timing(tx, { toValue: dx, duration: 1200, useNativeDriver: true }),
      ]),
      Animated.timing(op, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [op, tx, ty, delay]);
  return (
    <Animated.Text style={{
      position: 'absolute', opacity: op, transform: [{ translateX: tx }, { translateY: ty }],
      fontSize: 10 + Math.floor(Math.random() * 8),
    }}>✨</Animated.Text>
  );
}

// ── Shimmer sweep on progress bar ─────────────────────────────────────────────
function ShimmerBar({ pct, color }: { pct: number; color: string }) {
  const tx = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(tx, { toValue: 1, duration: 1200, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(tx, { toValue: -1, duration: 0, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [tx]);
  const shimmerX = tx.interpolate({ inputRange: [-1, 1], outputRange: ['-100%', '200%'] });
  return (
    <View style={[styles.barBg, { overflow: 'hidden' }]}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]}>
        <Animated.View style={[styles.barShimmer, { transform: [{ translateX: shimmerX }] }]} />
      </View>
    </View>
  );
}

// ── Collection card ───────────────────────────────────────────────────────────
function CollectionCard({ def, unlocked, width: w }: {
  def: typeof ANIMAL_DEFS[0]; unlocked: boolean; width: number;
}) {
  const [sel, setSel] = useState(false);
  const rarityColor = RARITY_COLORS[def.rarity] ?? '#9CA3AF';
  const glowColors = RARITY_GLOW[def.rarity] ?? ['#374151','#4B5563'];
  const glowSc = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!unlocked) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(glowSc, { toValue: 1.04, duration: 1600, useNativeDriver: true }),
      Animated.timing(glowSc, { toValue: 0.98, duration: 1600, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [unlocked, glowSc]);

  const pct = unlocked ? Math.round((def.level / 10) * 100) : 0;

  return (
    <Pressable onPress={() => setSel(s => !s)} style={{ width: w, padding: 5 }}>
      {/* Outer glow ring — rarity colored soft shadow */}
      <Animated.View style={[styles.glowRing, {
        borderColor: rarityColor,
        transform: [{ scale: glowSc }],
        shadowColor: rarityColor,
      }, sel && { borderWidth: 3 }]}>
        <LinearGradient
          colors={unlocked
            ? [glowColors[0] + 'EE', '#0d0828', glowColors[1] + '88']
            : ['#0a0a1a', '#0d0d1a']}
          style={styles.cardInner}
        >
          {/* Rarity label at top */}
          <View style={[styles.rarityTag, { backgroundColor: rarityColor + 'CC' }]}>
            <Text style={styles.rarityTagTxt}>{def.rarity.toUpperCase()}</Text>
          </View>

          {/* Portrait: pedestal + radial light OR fog silhouette */}
          <View style={styles.portraitArea}>
            {/* Radial glow behind creature */}
            {unlocked && (
              <View style={[styles.radialGlow, { backgroundColor: rarityColor + '33' }]} />
            )}
            {/* Pedestal base */}
            <View style={[styles.pedestal, { backgroundColor: rarityColor + '44', borderColor: rarityColor + '88' }]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)','transparent']}
                style={styles.pedestalSheen}
              />
            </View>

            {unlocked ? (
              <View style={styles.avatarWrap}>
                <AnimalAvatar level={def.level} size={62} />
              </View>
            ) : (
              /* Fog silhouette — shows shape, teases what's coming */
              <View style={styles.fogWrap}>
                {/* Blurred silhouette layer */}
                <View style={styles.fogOverlay} />
                <View style={{ opacity: 0.18 }}>
                  <AnimalAvatar level={def.level} size={62} animate={false} />
                </View>
                {/* Lock badge on top of silhouette */}
                <View style={styles.lockBadge}>
                  <Text style={{ fontSize: 14 }}>🔒</Text>
                </View>
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={[styles.cardName, !unlocked && { opacity: 0.35 }]} numberOfLines={1}>{def.name}</Text>
          {/* Level */}
          <Text style={[styles.cardLv, { color: rarityColor }]}>LV {def.level}</Text>
          {/* Progress bar with shimmer */}
          <ShimmerBar pct={pct} color={rarityColor} />
          {/* Score */}
          <Text style={styles.scoreTxt}>{unlocked ? `+${def.score} pts` : '???'}</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

// ── SCREEN ────────────────────────────────────────────────────────────────────
export default function CollectionScreen() {
  const { width } = useWindowDimensions();
  const CARD_W = (width - 16) / 3;
  const discovered = UNLOCKED.filter(Boolean).length;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient colors={['#050218','#0d0828','#060312']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>📚  COLLECTION</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Trophy-case discovery banner */}
        <View style={styles.trophyBanner}>
          <LinearGradient colors={['#7C3AED','#4A1D8C','#1a0840']} style={styles.trophyBg}>
            {/* Sparkle particles */}
            <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {[0,300,700,1100,1500,1800].map((d, i) => <Particle key={i} delay={d} />)}
            </View>
            <View style={{ position: 'absolute', top: 5, left: 6, right: 6, height: 10, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)' }} />
            <Text style={styles.trophyIcon}>🏆</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.trophyTitle}>Dragon Treasury</Text>
              <Text style={styles.trophySubtitle}>{discovered} / {ANIMAL_DEFS.length} Dragons Discovered</Text>
              {/* Overall progress bar */}
              <View style={[styles.barBg, { marginTop: 6, width: '100%' }]}>
                <View style={[styles.barFill, {
                  width: `${Math.round((discovered / ANIMAL_DEFS.length) * 100)}%`,
                  backgroundColor: '#FFD700',
                }]}>
                  <View style={[styles.barShimmer]} />
                </View>
              </View>
            </View>
            <Text style={styles.trophyPct}>{Math.round((discovered / ANIMAL_DEFS.length) * 100)}%</Text>
          </LinearGradient>
        </View>

        {/* Rarity legend */}
        <View style={styles.rarityLegend}>
          {Object.entries(RARITY_COLORS).map(([r, c]) => (
            <View key={r} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: c }]} />
              <Text style={styles.legendTxt}>{r}</Text>
            </View>
          ))}
        </View>

        {/* Grid */}
        <FlatList
          data={ANIMAL_DEFS}
          keyExtractor={d => String(d.level)}
          numColumns={3}
          contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 24 }}
          contentInsetAdjustmentBehavior="automatic"
          renderItem={({ item }) => (
            <CollectionCard def={item} unlocked={UNLOCKED[item.level - 1]} width={CARD_W} />
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#FFD700', fontWeight: '900', fontSize: 17, letterSpacing: 1.5 },
  // Trophy banner
  trophyBanner: { marginHorizontal: 12, marginBottom: 10, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,215,0,0.4)' },
  trophyBg: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, overflow: 'hidden' },
  trophyIcon: { fontSize: 38 },
  trophyTitle: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 0.5 },
  trophySubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 1 },
  trophyPct: { color: '#FFD700', fontWeight: '900', fontSize: 18 },
  // Rarity legend
  rarityLegend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 8, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '700' },
  // Card
  glowRing: {
    borderRadius: 20, borderWidth: 2,
    shadowOpacity: 0.9, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  cardInner: { borderRadius: 18, alignItems: 'center', paddingBottom: 9, overflow: 'hidden' },
  rarityTag: { width: '100%', paddingVertical: 3, alignItems: 'center' },
  rarityTagTxt: { color: '#fff', fontSize: 7, fontWeight: '900', letterSpacing: 1.2 },
  // Portrait area
  portraitArea: { width: 74, height: 74, alignItems: 'center', justifyContent: 'flex-end', marginTop: 6, position: 'relative' },
  radialGlow: { position: 'absolute', inset: 0, borderRadius: 37 },
  pedestal: {
    position: 'absolute', bottom: 0, width: 54, height: 12, borderRadius: 8,
    borderWidth: 1.5, overflow: 'hidden',
  },
  pedestalSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: 6, borderRadius: 6 },
  avatarWrap: { position: 'absolute', bottom: 10 },
  // Fog silhouette for locked
  fogWrap: { position: 'absolute', bottom: 10, alignItems: 'center' },
  fogOverlay: {
    position: 'absolute', inset: -4, borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  lockBadge: {
    position: 'absolute', top: -8, right: -10,
    backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 12, padding: 3,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  cardName: { color: '#fff', fontWeight: '900', fontSize: 9, marginTop: 4, textAlign: 'center', paddingHorizontal: 4 },
  cardLv: { fontSize: 8, fontWeight: '700', marginBottom: 4 },
  barBg: { width: '82%', height: 7, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, position: 'relative', overflow: 'hidden' },
  barShimmer: {
    position: 'absolute', top: 0, bottom: 0, width: 40,
    backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 4,
    transform: [{ skewX: '-20deg' }],
  },
  scoreTxt: { color: 'rgba(255,255,255,0.45)', fontSize: 8, marginTop: 3 },
});
