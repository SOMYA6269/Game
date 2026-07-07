import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { getDragonDef } from '@/lib/gameData';

export default function UnlockAnimationScreen() {
  const params = useLocalSearchParams<{ level: string }>();
  const level = Number(params.level ?? 7);
  const def = getDragonDef(level);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1, tension: 60, friction: 7, useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();

    // Glow pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['-20deg', '0deg'] });

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(10,1,24,0.95)' }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {/* Sparkles background */}
        {['✨', '⭐', '💫', '✦', '✧'].map((s, i) => (
          <Text key={i} style={{
            position: 'absolute',
            left: `${10 + i * 18}%` as never,
            top: `${15 + (i % 3) * 20}%` as never,
            fontSize: 20 + i * 4,
            opacity: 0.5,
          }}>
            {s}
          </Text>
        ))}

        {/* New unlock card */}
        <Animated.View style={{
          width: '90%',
          backgroundColor: def.bgColor,
          borderRadius: 32, padding: 40,
          alignItems: 'center',
          borderWidth: 3, borderColor: def.color,
          shadowColor: def.glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9, shadowRadius: 30,
          opacity: bgOpacity,
        }}>
          {/* "NEW!" badge */}
          <View style={{
            backgroundColor: '#EF4444',
            borderRadius: 12, paddingHorizontal: 16, paddingVertical: 5,
            marginBottom: 20,
          }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16, letterSpacing: 2 }}>
              🎉 NEW DRAGON UNLOCKED!
            </Text>
          </View>

          {/* Dragon */}
          <Animated.View style={{
            transform: [{ scale: scaleAnim }, { rotate: spin }],
            width: 120, height: 120, borderRadius: 60,
            backgroundColor: `${def.color}20`,
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 4, borderColor: def.color,
            marginBottom: 20,
          }}>
            {/* Inner glow */}
            <Animated.View style={{
              position: 'absolute', inset: -8, borderRadius: 70,
              borderWidth: 3, borderColor: def.glowColor,
              opacity: glowAnim,
            }} />
            <Text style={{ fontSize: 60 }}>{def.emoji}</Text>
          </Animated.View>

          <Text style={{ color: def.color, fontSize: 28, fontWeight: '900', marginBottom: 6 }}>
            {def.name}
          </Text>
          <View style={{
            backgroundColor: `${def.color}22`,
            borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12,
          }}>
            <Text style={{ color: def.color, fontWeight: '700', fontSize: 12 }}>
              {def.rarity.toUpperCase()} · LEVEL {def.level}
            </Text>
          </View>

          <Text style={{ color: '#C4B5FD', fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 20 }}>
            A magnificent {def.name} has joined your kingdom! Merge two more to unlock an even more powerful dragon.
          </Text>

          {/* Points */}
          <View style={{
            flexDirection: 'row', gap: 20, marginBottom: 28,
            backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: 14,
            width: '100%', justifyContent: 'center',
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>⭐</Text>
              <Text style={{ color: '#FBBF24', fontWeight: '800', fontSize: 14 }}>{def.score.toLocaleString()}</Text>
              <Text style={{ color: '#9D7EC9', fontSize: 10 }}>Score Value</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>🏅</Text>
              <Text style={{ color: '#60A5FA', fontWeight: '800', fontSize: 14 }}>+25</Text>
              <Text style={{ color: '#9D7EC9', fontSize: 10 }}>Gems Bonus</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: def.color,
              borderRadius: 18, paddingVertical: 16,
              width: '100%', alignItems: 'center',
              shadowColor: def.glowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.7, shadowRadius: 12,
            }}
          >
            <Text style={{ color: '#1A0A2E', fontWeight: '900', fontSize: 18 }}>
              Awesome! 🐉
            </Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
