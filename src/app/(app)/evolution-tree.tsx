import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DRAGON_LEVELS, RARITY_CONFIG } from '../../lib/gameData';

export default function EvolutionTreeScreen() {
  const chainAnims = DRAGON_LEVELS.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    chainAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1, duration: 400, delay: i * 120, useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F3FF' }}>
      <StatusBar style="dark" backgroundColor="#F5F3FF" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 16, paddingVertical: 12, gap: 10,
        }}>
          <Pressable onPress={() => router.back()} style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
            borderWidth: 1.5, borderColor: '#C4B5FD',
          }}>
            <Text style={{ fontSize: 16 }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#1E1B4B', flex: 1 }}>🐉 Evolution Tree</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          <Text style={{ color: '#6B7280', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>
            Merge identical dragons to evolve into higher tiers!
          </Text>

          {DRAGON_LEVELS.map((d, i) => {
            const rarityConf = RARITY_CONFIG[d.rarity];
            const isLast = i === DRAGON_LEVELS.length - 1;
            return (
              <Animated.View key={d.level} style={{
                opacity: chainAnims[i],
                transform: [{
                  translateX: chainAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }),
                }],
              }}>
                <View style={{
                  backgroundColor: '#fff', borderRadius: 20, padding: 14,
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  borderWidth: 2.5, borderColor: d.borderColor,
                  marginBottom: 2,
                  shadowColor: d.color, shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15, shadowRadius: 6,
                }}>
                  {/* Dragon circle */}
                  <View style={{
                    width: 56, height: 56, borderRadius: 28,
                    backgroundColor: d.bgColor,
                    borderWidth: 2.5, borderColor: d.borderColor,
                    alignItems: 'center', justifyContent: 'center',
                    shadowColor: d.glowColor,
                    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8,
                  }}>
                    <Text style={{ fontSize: 26 }}>{d.emoji}</Text>
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <Text style={{ fontWeight: '900', color: '#1E1B4B', fontSize: 15 }}>{d.name}</Text>
                      <View style={{
                        backgroundColor: rarityConf.bg, borderRadius: 8,
                        paddingHorizontal: 6, paddingVertical: 1,
                      }}>
                        <Text style={{ fontSize: 9, color: rarityConf.color, fontWeight: '800' }}>
                          {rarityConf.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 4 }}>{d.description}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{
                        backgroundColor: '#F3F4F6', borderRadius: 8,
                        paddingHorizontal: 8, paddingVertical: 2,
                      }}>
                        <Text style={{ fontSize: 11, color: '#374151', fontWeight: '700' }}>⭐ +{d.score} pts</Text>
                      </View>
                      <View style={{
                        backgroundColor: '#FEF3C7', borderRadius: 8,
                        paddingHorizontal: 8, paddingVertical: 2,
                      }}>
                        <Text style={{ fontSize: 11, color: '#92400E', fontWeight: '700' }}>Lv.{d.level}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Arrow connector */}
                {!isLast && (
                  <View style={{ alignItems: 'center', marginVertical: 2 }}>
                    <View style={{
                      width: 2, height: 14, backgroundColor: d.borderColor, opacity: 0.4,
                    }} />
                    <Text style={{ fontSize: 14, color: d.color, marginTop: -2 }}>▼</Text>
                  </View>
                )}
              </Animated.View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
