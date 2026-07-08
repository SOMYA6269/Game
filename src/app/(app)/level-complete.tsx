// @ts-nocheck
/**
 * LEVEL COMPLETE — matches reference Image 1 panel 4
 * Big 3 stars, green dragon, LEVEL COMPLETE! banner, reward chips, NEXT + Replay buttons
 */
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { AnimalAvatar } from '../../components/game/AnimalAvatar';

function ConfettiPiece({ delay, x, color }: { delay: number; x: string; color: string }) {
  const y = useRef(new Animated.Value(-20)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(y, { toValue: 750, duration: 2400, useNativeDriver: true }),
        Animated.timing(rot, { toValue: 1080, duration: 2400, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(op, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0, duration: 2200, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, [y, rot, op, delay]);
  const sz = 6 + Math.random() * 8;
  return (
    <Animated.View style={{
      position: 'absolute', top: 0, left: x, width: sz, height: sz * 0.55,
      backgroundColor: color, borderRadius: 2,
      transform: [{ translateY: y }, { rotate: rot.interpolate({ inputRange: [0, 1080], outputRange: ['0deg', '1080deg'] }) }],
      opacity: op,
    }} />
  );
}

function AnimStar({ delay, filled }: { delay: number; filled: boolean }) {
  const sc = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(sc, { toValue: 1.2, tension: 80, friction: 3, useNativeDriver: true }),
      Animated.spring(sc, { toValue: 1, tension: 120, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [sc, delay]);
  return (
    <Animated.Text style={{ fontSize: 56, transform: [{ scale: sc }], opacity: filled ? 1 : 0.2 }}>
      ⭐
    </Animated.Text>
  );
}

export default function LevelCompleteScreen() {
  const params = useLocalSearchParams<{ score: string; level: string; coins: string; gems: string }>();
  const score = parseInt(params.score ?? '0', 10);
  const level = parseInt(params.level ?? '1', 10);
  const coins = parseInt(params.coins ?? '500', 10);
  const gems  = parseInt(params.gems  ?? '10', 10);
  const stars = score >= 3000 ? 3 : score >= 800 ? 2 : 1;

  const cardSc = useRef(new Animated.Value(0.3)).current;
  const dragonY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(cardSc, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }).start();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(dragonY, { toValue: -12, duration: 700, useNativeDriver: true }),
      Animated.timing(dragonY, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]));
    const t = setTimeout(() => loop.start(), 600);
    return () => { clearTimeout(t); loop.stop(); };
  }, [cardSc, dragonY]);

  const CONFETTI_COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6FC8', '#FFB347', '#A78BFA'];

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0d004a', '#1a0070', '#0a0030']} style={StyleSheet.absoluteFill} />
      {Array.from({ length: 32 }, (_, i) => (
        <ConfettiPiece key={i} delay={i * 70} x={`${(i * 3.2) % 98}%`} color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]} />
      ))}

      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[styles.card, { transform: [{ scale: cardSc }] }]}>

          {/* Stars */}
          <View style={{ flexDirection: 'row', gap: 2, marginTop: -28, zIndex: 5 }}>
            {[0, 1, 2].map(i => <AnimStar key={i} delay={200 + i * 250} filled={i < stars} />)}
          </View>

          {/* LEVEL COMPLETE banner */}
          <LinearGradient colors={['#CC0000', '#880000']} style={styles.banner}>
            <View style={styles.bannerGloss} />
            <Text style={styles.bannerTxt}>LEVEL COMPLETE!</Text>
          </LinearGradient>

          {/* Dragon */}
          <Animated.View style={{ transform: [{ translateY: dragonY }], marginVertical: 10 }}>
            <AnimalAvatar level={10} size={130} />
          </Animated.View>

          {/* Reward panel */}
          <LinearGradient colors={['#2a1500', '#1a0d00']} style={styles.rewardPanel}>
            <Text style={styles.rewardTitle}>REWARD</Text>
            <View style={{ flexDirection: 'row', gap: 20, marginTop: 6 }}>
              <View style={styles.rewardItem}>
                <Text style={{ fontSize: 26 }}>🪙</Text>
                <Text style={styles.rewardVal}>{coins.toLocaleString()}</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={{ fontSize: 26 }}>💎</Text>
                <Text style={[styles.rewardVal, { color: '#C4B5FD' }]}>{gems}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 10, width: '100%', marginTop: 12 }}>
            <Pressable
              style={{ flex: 3 }}
              onPress={() => router.replace({ pathname: '/(app)/game', params: { startLevel: String(level + 1) } } as never)}
            >
              <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.nextBtn}>
                <View style={styles.btnGloss} />
                <Text style={styles.nextBtnTxt}>NEXT</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              style={{ flex: 1 }}
              onPress={() => router.replace({ pathname: '/(app)/game', params: { startLevel: String(level) } } as never)}
            >
              <LinearGradient colors={['#374151', '#1F2937']} style={[styles.nextBtn, { borderColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={{ fontSize: 22 }}>🔄</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '86%', backgroundColor: '#1a0850', borderRadius: 28, padding: 20,
    alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,215,0,0.5)',
    shadowColor: '#FFD700', shadowRadius: 24, shadowOpacity: 0.4,
    paddingTop: 12,
  },
  banner: {
    width: '100%', borderRadius: 18, paddingVertical: 12,
    alignItems: 'center', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.45)',
    overflow: 'hidden',
  },
  bannerGloss: {
    position: 'absolute', top: 4, left: '10%', right: '10%', height: 14,
    borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.25)',
  },
  bannerTxt: {
    color: '#FFD700', fontWeight: '900', fontSize: 26, letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  rewardPanel: {
    borderRadius: 20, padding: 14, width: '100%', alignItems: 'center',
    borderWidth: 2, borderColor: '#8B5A2B',
  },
  rewardTitle: { color: '#FFD700', fontWeight: '900', fontSize: 14, letterSpacing: 2 },
  rewardItem: { alignItems: 'center', gap: 3 },
  rewardVal: { color: '#FFD700', fontWeight: '900', fontSize: 22 },
  nextBtn: {
    borderRadius: 20, paddingVertical: 14, alignItems: 'center',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.45)', overflow: 'hidden',
  },
  btnGloss: {
    position: 'absolute', top: 4, left: '12%', right: '12%', height: 12,
    borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.3)',
  },
  nextBtnTxt: { color: '#fff', fontWeight: '900', fontSize: 22, letterSpacing: 3 },
});
