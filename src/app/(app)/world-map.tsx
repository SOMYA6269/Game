import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { WORLD_LEVELS } from '../../lib/gameData';

function StarRow({ stars }: { stars: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1,2,3].map(i => (
        <Text key={i} style={{ fontSize: 12, opacity: i <= stars ? 1 : 0.25 }}>⭐</Text>
      ))}
    </View>
  );
}

export default function WorldMapScreen() {
  const floatAnims = WORLD_LEVELS.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    floatAnims.forEach((anim, i) => {
      const delay = i * 200;
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -6, duration: 1800 + i * 300, useNativeDriver: true, delay }),
          Animated.timing(anim, { toValue: 0, duration: 1800 + i * 300, useNativeDriver: true }),
        ])
      );
      loop.start();
    });
    return () => floatAnims.forEach(a => a.stopAnimation());
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#87CEEB' }}>
      <StatusBar style="dark" backgroundColor="#ADE3F7" />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ADE3F7' }} />
      <View style={{ position: 'absolute', top: '40%', left: 0, right: 0, bottom: 0, backgroundColor: '#C5EDFC' }} />
      <View style={{ position: 'absolute', top: '70%', left: 0, right: 0, bottom: 0, backgroundColor: '#E8F8FF' }} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
          paddingVertical: 12, gap: 10,
        }}>
          <Pressable onPress={() => router.back()} style={{
            width: 40, height: 40, borderRadius: 20, backgroundColor: '#EDE9FE',
            alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#A78BFA',
            shadowColor: '#9333EA', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15, shadowRadius: 4,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '800' }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#1E1B4B', flex: 1, letterSpacing: 0.3 }}>🗺️ World Map</Text>
          <Text style={{ fontSize: 22 }}>🏆</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {WORLD_LEVELS.map((level, i) => (
            <Animated.View key={level.id} style={{ transform: [{ translateY: floatAnims[i] }] }}>
              <Pressable
                onPress={() => !level.locked && router.push('/(app)/game' as never)}
                style={{
                  backgroundColor: level.locked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.95)',
                  borderRadius: 24, padding: 18,
                  flexDirection: 'row', alignItems: 'center', gap: 16,
                  borderWidth: 3,
                  borderColor: level.locked ? '#D1D5DB' : level.bgFrom,
                  shadowColor: level.locked ? '#000' : level.bgFrom,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: level.locked ? 0.08 : 0.3,
                  shadowRadius: 12,
                  opacity: level.locked ? 0.6 : 1,
                }}
              >
                {/* Kingdom icon */}
                <View style={{
                  width: 68, height: 68, borderRadius: 34,
                  backgroundColor: level.bgFrom + '22',
                  borderWidth: 3, borderColor: level.bgFrom,
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: level.bgFrom, shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5, shadowRadius: 8,
                }}>
                  <Text style={{ fontSize: 34 }}>{level.emoji}</Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <Text style={{
                    fontSize: 17, fontWeight: '900',
                    color: level.locked ? '#9CA3AF' : '#1E1B4B',
                    letterSpacing: 0.3,
                  }}>{level.name}</Text>
                    {level.locked && <Text style={{ fontSize: 14 }}>🔒</Text>}
                  </View>
                  <StarRow stars={level.stars} />
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <View style={{
                      backgroundColor: level.locked ? '#F3F4F6' : level.bgFrom + '22',
                      borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
                    }}>
                      <Text style={{ fontSize: 11, color: level.locked ? '#9CA3AF' : level.bgFrom, fontWeight: '700' }}>
                        🎯 Target: {level.targetScore.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action */}
                <View style={{
                  width: 52, height: 52, borderRadius: 26,
                  backgroundColor: level.locked ? '#F3F4F6' : level.bgFrom,
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: level.locked ? '#E5E7EB' : level.bgFrom,
                  shadowColor: level.bgFrom,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: level.locked ? 0 : 0.4,
                  shadowRadius: 8,
                }}>
                  <Text style={{ fontSize: 20 }}>{level.locked ? '🔒' : '▶️'}</Text>
                </View>

                {/* Level number badge */}
                <View style={{
                  position: 'absolute', top: -8, left: 12,
                  backgroundColor: level.locked ? '#9CA3AF' : level.bgFrom,
                  borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
                  borderWidth: 2, borderColor: '#fff',
                }}>
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 11 }}>Lv.{level.id}</Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}

          {/* Teaser */}
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 18,
            padding: 20, alignItems: 'center', gap: 6,
            borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed',
          }}>
            <Text style={{ fontSize: 36 }}>🌟</Text>
            <Text style={{ fontWeight: '800', color: '#6B7280', fontSize: 14 }}>More worlds coming soon!</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Keep merging to unlock them</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
