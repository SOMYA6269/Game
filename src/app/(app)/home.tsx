import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Floating cloud decoration
function Cloud({ style }: { style: object }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 8, duration: 3000 + Math.random()*2000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 3000 + Math.random()*2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return (
    <Animated.View style={[style, { transform: [{ translateY: anim }] }]}>
      <Text style={{ fontSize: 40, opacity: 0.55 }}>☁️</Text>
    </Animated.View>
  );
}

// Bouncing logo dragon
function LogoDragon() {
  const bounce = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const b = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -12, duration: 500, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    b.start();
    return () => b.stop();
  }, [bounce]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ transform: [{ translateY: bounce }] }}>
      <Text style={{ fontSize: 80 }}>🐲</Text>
    </Animated.View>
  );
}

interface NavCardProps {
  emoji: string; label: string; sub?: string; color: string;
  bgColor: string; borderColor: string; badge?: string;
  onPress: () => void;
}
function NavCard({ emoji, label, sub, color, bgColor, borderColor, badge, onPress }: NavCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Pressable onPress={press} style={{ flex: 1 }}>
      <Animated.View style={{
        flex: 1,
        backgroundColor: bgColor, borderRadius: 24, padding: 16,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 3, borderColor,
        shadowColor: color,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, shadowRadius: 12,
        transform: [{ scale }],
        minHeight: 100,
      }}>
        {badge ? (
          <View style={{
            position: 'absolute', top: -8, right: -8,
            backgroundColor: '#EF4444', borderRadius: 10,
            paddingHorizontal: 6, paddingVertical: 2,
            borderWidth: 2, borderColor: '#fff',
          }}>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{badge}</Text>
          </View>
        ) : null}
        <Text style={{ fontSize: 32, marginBottom: 6 }}>{emoji}</Text>
        <Text style={{ color, fontWeight: '900', fontSize: 14, textAlign: 'center', letterSpacing: 0.3 }}>{label}</Text>
        {sub ? <Text style={{ color, opacity: 0.7, fontSize: 11, marginTop: 3, fontWeight: '600' }}>{sub}</Text> : null}
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.spring(logoScale, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }).start();
  }, [logoScale]);

  return (
    <View style={{ flex: 1, backgroundColor: '#87CEEB' }}>
      <StatusBar style="dark" backgroundColor="#87CEEB" />
      {/* Sky gradient layers */}
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#ADE3F7' }} />
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#C5EDFC', top: '40%' }} />
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#E8F8FF', top: '70%' }} />

      {/* Floating clouds */}
      <Cloud style={{ position: 'absolute', top: 60, left: 20 }} />
      <Cloud style={{ position: 'absolute', top: 100, right: 30 }} />
      <Cloud style={{ position: 'absolute', top: 180, left: '40%' }} />

      {/* Mountains */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120 }}>
        <Text style={{ position: 'absolute', bottom: 0, left: -10, fontSize: 90, opacity: 0.25 }}>⛰️</Text>
        <Text style={{ position: 'absolute', bottom: 0, right: -10, fontSize: 100, opacity: 0.2 }}>🏔️</Text>
        <Text style={{ position: 'absolute', bottom: 0, left: '25%', fontSize: 70, opacity: 0.18 }}>🌲</Text>
        <Text style={{ position: 'absolute', bottom: 0, right: '30%', fontSize: 60, opacity: 0.18 }}>🌳</Text>
      </View>

      {/* Castle in background */}
      <Text style={{ position: 'absolute', top: 200, right: 20, fontSize: 50, opacity: 0.2 }}>🏰</Text>

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>

          {/* Logo section */}
          <Animated.View style={{
            alignItems: 'center', paddingTop: 20, paddingBottom: 16,
            transform: [{ scale: logoScale }],
          }}>
            <LogoDragon />
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.85)',
              borderRadius: 24, paddingHorizontal: 24, paddingVertical: 10,
              marginTop: 8, borderWidth: 2.5, borderColor: '#8B5CF6',
              shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35, shadowRadius: 12,
            }}>
              <Text style={{
                fontSize: 30, fontWeight: '900', color: '#5B21B6',
                letterSpacing: 1, textAlign: 'center',
              }}>Dragon Merge</Text>
              <Text style={{
                fontSize: 20, fontWeight: '900', color: '#F59E0B',
                textAlign: 'center', letterSpacing: 2, marginTop: -4,
              }}>✨ KINGDOM ✨</Text>
            </View>

            {/* Currency bar */}
            <View style={{
              flexDirection: 'row', gap: 10, marginTop: 12,
              backgroundColor: 'rgba(255,255,255,0.88)',
              borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8,
              borderWidth: 1.5, borderColor: '#E8D5FF',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 20 }}>🪙</Text>
                <Text style={{ fontWeight: '900', fontSize: 16, color: '#92400E' }}>1,000</Text>
                <Pressable
                  onPress={() => router.push('/(app)/shop' as never)}
                  style={{ backgroundColor: '#F59E0B', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>+</Text>
                </Pressable>
              </View>
              <View style={{ width: 1.5, backgroundColor: '#E8D5FF' }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 20 }}>💎</Text>
                <Text style={{ fontWeight: '900', fontSize: 16, color: '#5B21B6' }}>120</Text>
                <Pressable
                  onPress={() => router.push('/(app)/shop' as never)}
                  style={{ backgroundColor: '#8B5CF6', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 }}
                >
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>+</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* Big PLAY button */}
          <Pressable
            onPress={() => router.push('/(app)/game' as never)}
            style={{
              backgroundColor: '#10B981',
              borderRadius: 28, paddingVertical: 22,
              alignItems: 'center', justifyContent: 'center',
              flexDirection: 'row', gap: 14, marginBottom: 16,
              borderWidth: 3.5, borderColor: '#059669',
              shadowColor: '#059669',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.6, shadowRadius: 18,
            }}
          >
            <Text style={{ fontSize: 40 }}>▶️</Text>
            <View>
              <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 1.5 }}>PLAY</Text>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700', marginTop: -2 }}>Level 1 • Score: 0</Text>
            </View>
          </Pressable>

          {/* Nav grid */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <NavCard emoji="🗺️" label="World Map" sub="8 Kingdoms" color="#1D4ED8" bgColor="#EFF6FF" borderColor="#93C5FD"
              onPress={() => router.push('/(app)/world-map' as never)} />
            <NavCard emoji="📚" label="Collection" sub="Discover all" color="#6D28D9" bgColor="#F5F3FF" borderColor="#C4B5FD"
              onPress={() => router.push('/(app)/collection' as never)} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <NavCard emoji="🏪" label="Shop" sub="Boosters & more" color="#B45309" bgColor="#FFFBEB" borderColor="#FCD34D"
              onPress={() => router.push('/(app)/shop' as never)} />
            <NavCard emoji="📅" label="Daily Reward" sub="Day 1 — Claim!" color="#065F46" bgColor="#ECFDF5" borderColor="#6EE7B7"
              badge="NEW" onPress={() => router.push('/(app)/daily-rewards' as never)} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <NavCard emoji="🏆" label="Achievements" sub="Earn trophies" color="#B45309" bgColor="#FFFBEB" borderColor="#FDE68A"
              onPress={() => router.push('/(app)/daily-rewards' as never)} />
            <NavCard emoji="🐉" label="Dragon Book" sub="11 dragons" color="#9D174D" bgColor="#FFF1F2" borderColor="#FECDD3"
              onPress={() => router.push('/(app)/collection' as never)} />
          </View>

          {/* Best score card */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: 20, padding: 16, marginTop: 4,
            borderWidth: 2.5, borderColor: '#FCD34D',
            flexDirection: 'row', alignItems: 'center', gap: 16,
            shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3, shadowRadius: 8,
          }}>
            <Text style={{ fontSize: 48 }}>🏆</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#92400E', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>YOUR BEST SCORE</Text>
              <Text style={{ color: '#F59E0B', fontSize: 32, fontWeight: '900' }}>0</Text>
              <Text style={{ color: '#6B7280', fontSize: 11 }}>Merge dragons to set a record! 🐲</Text>
            </View>
          </View>

          {/* Dragon row */}
          <View style={{ marginTop: 18 }}>
            <Text style={{
              color: '#5B21B6', fontWeight: '800', fontSize: 13, letterSpacing: 0.5, marginBottom: 10,
            }}>Meet the Dragons 🐲</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
              {[
                ['🥚','#DCFCE7','#16A34A'],
                ['💙','#DBEAFE','#2563EB'],
                ['💜','#F3E8FF','#7C3AED'],
                ['🔥','#FEE2E2','#DC2626'],
                ['⭐','#FEF3C7','#D97706'],
                ['🐲','#D1FAE5','#059669'],
                ['🐉','#CFFAFE','#0891B2'],
                ['💎','#EDE9FE','#7C3AED'],
                ['👑','#FEF9C3','#CA8A04'],
                ['🌈','#FCE7F3','#DB2777'],
              ].map(([emoji, bg, border], i) => (
                <Pressable
                  key={i}
                  onPress={() => router.push('/(app)/collection' as never)}
                  style={{
                    width: 56, height: 56, borderRadius: 28,
                    backgroundColor: bg as string,
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 10, borderWidth: 2.5, borderColor: border as string,
                    shadowColor: border as string, shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3, shadowRadius: 4,
                  }}
                >
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Inline StyleSheet to avoid the import issue
const StyleSheet = { absoluteFillObject: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 } };
