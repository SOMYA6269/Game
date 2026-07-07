import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

function Firework({ x, y, color, delay }: { x: string; y: number; color: string; delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.delay(1000 + Math.random() * 1000),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.8, 0.8] });
  return (
    <Animated.View style={{
      position: 'absolute', left: x as never, top: y,
      opacity: anim, transform: [{ scale }],
    }}>
      <Text style={{ fontSize: 28, color }}>{color === '#F59E0B' ? '🎆' : '🎇'}</Text>
    </Animated.View>
  );
}

export default function LevelCompleteScreen() {
  const mainScale = useRef(new Animated.Value(0.3)).current;
  const starAnims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    Animated.spring(mainScale, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }).start();
    starAnims.forEach((a, i) => {
      Animated.sequence([
        Animated.delay(400 + i * 200),
        Animated.spring(a, { toValue: 1, tension: 80, friction: 4, useNativeDriver: true }),
      ]).start();
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <StatusBar style="light" backgroundColor="transparent" />
      {/* Fireworks */}
      <Firework x="10%" y={80}  color="#F59E0B" delay={0} />
      <Firework x="80%" y={60}  color="#EC4899" delay={600} />
      <Firework x="50%" y={40}  color="#22C55E" delay={1200} />
      <Firework x="25%" y={150} color="#3B82F6" delay={400} />
      <Firework x="70%" y={120} color="#8B5CF6" delay={900} />

      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Animated.View style={{
          backgroundColor: '#fff', borderRadius: 32, padding: 28,
          alignItems: 'center', width: '100%', maxWidth: 340,
          transform: [{ scale: mainScale }],
          shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5, shadowRadius: 20,
        }}>
          <Text style={{ fontSize: 64, marginBottom: 8 }}>🎉</Text>
          <Text style={{ fontSize: 28, fontWeight: '900', color: '#22C55E', marginBottom: 4 }}>Level Complete!</Text>
          <Text style={{ fontSize: 15, color: '#6B7280', marginBottom: 20 }}>Amazing! You cleared the level!</Text>

          {/* Stars */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            {[0,1,2].map(i => (
              <Animated.View key={i} style={{ transform: [{ scale: starAnims[i] }] }}>
                <Text style={{ fontSize: 48 }}>⭐</Text>
              </Animated.View>
            ))}
          </View>

          {/* Stats */}
          <View style={{
            backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16,
            width: '100%', gap: 10, marginBottom: 20,
          }}>
            {[
              ['🎯 Final Score', '6,842'],
              ['🪙 Coins Earned', '+300'],
              ['💎 Gems Earned', '+5'],
              ['⚡ Best Combo', '×7'],
            ].map(([label, val]) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#6B7280', fontSize: 14 }}>{label}</Text>
                <Text style={{ color: '#1E1B4B', fontWeight: '900', fontSize: 15 }}>{val}</Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <Pressable onPress={() => router.replace('/(app)/game' as never)} style={{
            backgroundColor: '#8B5CF6', borderRadius: 18,
            paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 10,
          }}>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 17 }}>Next Level ➡️</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/(app)/home' as never)} style={{
            backgroundColor: '#F3F0FF', borderRadius: 16,
            paddingVertical: 12, width: '100%', alignItems: 'center',
            borderWidth: 2, borderColor: '#8B5CF6',
          }}>
            <Text style={{ color: '#8B5CF6', fontWeight: '800', fontSize: 15 }}>🏠 Home</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
