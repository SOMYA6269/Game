import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { RARITY_CONFIG } from '../../lib/gameData';

function SparkleRing({ size, color, delay }: { size: number; color: string; delay: number }) {
  const anim = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1.2, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.6, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);
  return (
    <Animated.View style={{
      position: 'absolute',
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 2, borderColor: color,
      opacity: 0.4,
      transform: [{ scale: anim }],
    }} />
  );
}

// Unlocked dragon = level 7 Sprout Dragon as demo
const DEMO = {
  level: 7, name: 'Sprout Dragon', emoji: '🐲', face: '😁',
  color: '#10B981', bgColor: '#D1FAE5', borderColor: '#059669',
  glowColor: 'rgba(16,185,129,0.7)', rarity: 'epic',
  description: 'Tiny but mighty! Loves playing in flower fields.',
};

export default function UnlockAnimationScreen() {
  const mainScale = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(40)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(mainScale, { toValue: 1, tension: 40, friction: 4, useNativeDriver: true }),
      Animated.parallel([
        Animated.loop(Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(glow, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        ])),
        Animated.parallel([
          Animated.timing(textSlide, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const rarityConf = RARITY_CONFIG[DEMO.rarity];

  return (
    <View style={{ flex: 1, backgroundColor: '#1E1B4B' }}>
      <StatusBar style="light" backgroundColor="#1E1B4B" />
      {/* Starburst background */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        {[...Array(12)].map((_, i) => (
          <View key={i} style={{
            position: 'absolute',
            width: 2, height: '50%',
            backgroundColor: '#8B5CF6',
            opacity: 0.08,
            transform: [{ rotate: `${i * 30}deg` }, { translateY: -100 }],
            top: '50%',
          }} />
        ))}
      </View>

      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#FCD34D', fontSize: 16, fontWeight: '800', letterSpacing: 2, marginBottom: 24 }}>
          🎊 NEW DRAGON UNLOCKED! 🎊
        </Text>

        {/* Dragon display */}
        <Animated.View style={{
          transform: [{ scale: mainScale }],
          alignItems: 'center', marginBottom: 32,
        }}>
          {/* Sparkle rings */}
          <SparkleRing size={140} color={DEMO.color} delay={0} />
          <SparkleRing size={180} color="#FCD34D" delay={300} />
          <SparkleRing size={220} color={DEMO.color} delay={600} />

          {/* Main circle */}
          <Animated.View style={{
            width: 120, height: 120, borderRadius: 60,
            backgroundColor: DEMO.bgColor,
            borderWidth: 4, borderColor: DEMO.borderColor,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: DEMO.glowColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: glow as never,
            shadowRadius: 30,
          }}>
            <Text style={{ fontSize: 56 }}>{DEMO.emoji}</Text>
          </Animated.View>
        </Animated.View>

        {/* Name & rarity */}
        <Animated.View style={{
          alignItems: 'center',
          opacity: textOpacity,
          transform: [{ translateY: textSlide }],
        }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 8 }}>{DEMO.name}</Text>
          <View style={{
            backgroundColor: rarityConf.bg, borderRadius: 16,
            paddingHorizontal: 16, paddingVertical: 6, marginBottom: 12,
          }}>
            <Text style={{ color: rarityConf.color, fontWeight: '900', fontSize: 14 }}>
              ✨ {rarityConf.label.toUpperCase()}
            </Text>
          </View>
          <Text style={{
            color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center',
            maxWidth: 280, lineHeight: 20, marginBottom: 32,
          }}>{DEMO.description}</Text>
        </Animated.View>

        {/* CTA */}
        <Pressable onPress={() => router.replace('/(app)/game' as never)} style={{
          backgroundColor: DEMO.color, borderRadius: 20,
          paddingVertical: 14, paddingHorizontal: 40, marginBottom: 12,
        }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 17 }}>🎮 Keep Playing!</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(app)/collection' as never)}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '700' }}>View Dragon Book →</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
