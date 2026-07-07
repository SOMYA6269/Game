import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const BG_URL     = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_c4970965-c4c8-4e42-ab6b-aef8f88a9a93.jpg';
const DRAGON_URL = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_1b02b9ed-f34f-4c43-8a3e-e5d5a290bafd.jpg';

// ── Floating cloud ───────────────────────────────────────────────────────────
function FloatCloud({ style, delay = 0 }: { style: object; delay?: number }) {
  const y = useRef(new Animated.Value(0)).current;
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const lY = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -10, duration: 2400 + delay, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0,   duration: 2400 + delay, useNativeDriver: true }),
      ])
    );
    const lX = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: 6,  duration: 4000 + delay * 0.5, useNativeDriver: true }),
        Animated.timing(x, { toValue: 0,  duration: 4000 + delay * 0.5, useNativeDriver: true }),
      ])
    );
    lY.start(); lX.start();
    return () => { lY.stop(); lX.stop(); };
  }, [y, x, delay]);
  return (
    <Animated.View style={[style, { transform: [{ translateY: y }, { translateX: x }] }]}>
      <Text style={{ fontSize: 44, opacity: 0.7 }}>☁️</Text>
    </Animated.View>
  );
}

// ── Bouncing dragon mascot ───────────────────────────────────────────────────
function Mascot() {
  const y = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, tension: 40, friction: 5, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -14, duration: 700, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0,   duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [y, scale]);
  return (
    <Animated.View style={{ transform: [{ translateY: y }, { scale }] }}>
      <Image source={{ uri: DRAGON_URL }} style={{ width: 100, height: 100, borderRadius: 50 }} contentFit="cover" />
    </Animated.View>
  );
}

// ── Currency chip ────────────────────────────────────────────────────────────
function CurrencyChip({ icon, amount, onAdd }: { icon: string; amount: string; onAdd: () => void }) {
  return (
    <View style={styles.chip}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={styles.chipText}>{amount}</Text>
      <Pressable onPress={onAdd} style={styles.chipAdd}>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14, lineHeight: 18 }}>+</Text>
      </Pressable>
    </View>
  );
}

// ── Bottom nav item ──────────────────────────────────────────────────────────
function NavItem({ emoji, label, onPress, badge }: { emoji: string; label: string; onPress: () => void; badge?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const tap = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 4, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Pressable onPress={tap} style={styles.navItem}>
      <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
        <View style={styles.navIconBox}>
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
          {badge ? (
            <View style={styles.navBadge}><Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{badge}</Text></View>
          ) : null}
        </View>
        <Text style={styles.navLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const playScale = useRef(new Animated.Value(1)).current;

  const pulsePlay = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(playScale, { toValue: 1.05, duration: 800, useNativeDriver: true }),
        Animated.timing(playScale, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };
  useEffect(() => { pulsePlay(); }, [playScale]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="transparent" translucent />

      {/* Full-screen fantasy background */}
      <Image source={{ uri: BG_URL }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      {/* Overlay gradient for readability */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(20,10,50,0.28)' }]} />

      {/* Floating clouds */}
      <FloatCloud style={{ position: 'absolute', top: 60,  left: 12  }} delay={0} />
      <FloatCloud style={{ position: 'absolute', top: 90,  right: 20 }} delay={600} />
      <FloatCloud style={{ position: 'absolute', top: 160, left: 90  }} delay={1200} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          {/* Logo */}
          <View style={styles.logo}>
            <Text style={styles.logoLine1}>🐲 DRAGON MERGE</Text>
            <Text style={styles.logoLine2}>✨ KINGDOM ✨</Text>
          </View>
          {/* Currency */}
          <View style={{ gap: 6 }}>
            <CurrencyChip icon="🪙" amount="1,560" onAdd={() => router.push('/(app)/shop' as never)} />
            <CurrencyChip icon="💎" amount="260"   onAdd={() => router.push('/(app)/shop' as never)} />
          </View>
        </View>

        {/* ── Center area: mascot + PLAY ── */}
        <View style={styles.center}>
          <Mascot />
          <Animated.View style={{ transform: [{ scale: playScale }], marginTop: 20 }}>
            <Pressable
              onPress={() => router.push('/(app)/game' as never)}
              style={styles.playBtn}
            >
              <Text style={styles.playText}>▶ PLAY</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>

      {/* ── Bottom nav bar ── */}
      <View style={styles.bottomNav}>
        <NavItem emoji="🗺️" label="WORLD MAP"   onPress={() => router.push('/(app)/world-map'  as never)} />
        <NavItem emoji="📦" label="COLLECTION"  onPress={() => router.push('/(app)/collection' as never)} />
        <NavItem emoji="📅" label="DAILY"       onPress={() => router.push('/(app)/daily-rewards' as never)} badge="!" />
        <NavItem emoji="🏪" label="SHOP"        onPress={() => router.push('/(app)/shop'       as never)} />
        <NavItem emoji="⚙️" label="SETTINGS"    onPress={() => router.push('/(app)/settings'   as never)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1a3a6b' },
  topBar: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 14, paddingTop: 6, paddingBottom: 8,
    justifyContent: 'space-between',
  },
  logo: {
    backgroundColor: 'rgba(20,10,50,0.72)',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 2, borderColor: '#f59e0b',
  },
  logoLine1: { color: '#fff',    fontWeight: '900', fontSize: 18, letterSpacing: 0.5 },
  logoLine2: { color: '#f59e0b', fontWeight: '900', fontSize: 14, textAlign: 'center', marginTop: -2 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(20,10,50,0.75)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1.5, borderColor: 'rgba(255,220,100,0.45)',
    minWidth: 110,
  },
  chipText: { color: '#fff', fontWeight: '900', fontSize: 14, flex: 1 },
  chipAdd: {
    backgroundColor: '#f59e0b', borderRadius: 10,
    width: 22, height: 22, alignItems: 'center', justifyContent: 'center',
  },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingBottom: 20,
  },
  playBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 28, paddingVertical: 18, paddingHorizontal: 60,
    borderWidth: 3.5, borderColor: '#15803d',
    shadowColor: '#00ff44', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 18,
  },
  playText: { color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: 3 },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20,10,50,0.93)',
    borderTopWidth: 2, borderTopColor: '#f59e0b',
    paddingBottom: 20, paddingTop: 8,
  },
  navItem: { flex: 1, alignItems: 'center' },
  navIconBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,200,60,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,200,60,0.3)',
    marginBottom: 3,
  },
  navBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#ef4444', borderRadius: 8,
    paddingHorizontal: 4, paddingVertical: 1,
    borderWidth: 1.5, borderColor: '#fff',
  },
  navLabel: { color: 'rgba(255,220,120,0.9)', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
});
