import React, { useRef, useEffect, memo } from 'react';
import { View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DRAGON_LEVELS, RARITY_CONFIG } from '../../lib/gameData';
import type { DragonDef } from '../../lib/gameTypes';

// Extracted to a proper component so hooks are called at top-level, not inside map()
const DragonChainCard = memo(function DragonChainCard({
  dragon, index, isLast,
}: { dragon: DragonDef; index: number; isLast: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;
  const rarityConf = RARITY_CONFIG[dragon.rarity];

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: index * 120,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{
        translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }),
      }],
    }}>
      <View style={{
        backgroundColor: '#fff', borderRadius: 20, padding: 14,
        flexDirection: 'row', alignItems: 'center', gap: 14,
        borderWidth: 2.5, borderColor: dragon.borderColor,
        marginBottom: 2,
      }}>
        {/* Dragon circle */}
        <View style={{
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: dragon.bgColor,
          borderWidth: 2.5, borderColor: dragon.borderColor,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 26 }}>{dragon.emoji}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <Text style={{ fontWeight: '900', color: '#1E1B4B', fontSize: 15 }}>{dragon.name}</Text>
            <View style={{
              backgroundColor: rarityConf.bg, borderRadius: 8,
              paddingHorizontal: 6, paddingVertical: 1,
            }}>
              <Text style={{ fontSize: 9, color: rarityConf.color, fontWeight: '800' }}>
                {rarityConf.label}
              </Text>
            </View>
          </View>
          <Text style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 4 }}>{dragon.description}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{
              backgroundColor: '#F3F4F6', borderRadius: 8,
              paddingHorizontal: 8, paddingVertical: 2,
            }}>
              <Text style={{ fontSize: 11, color: '#374151', fontWeight: '700' }}>⭐ +{dragon.score} pts</Text>
            </View>
            <View style={{
              backgroundColor: '#FEF3C7', borderRadius: 8,
              paddingHorizontal: 8, paddingVertical: 2,
            }}>
              <Text style={{ fontSize: 11, color: '#92400E', fontWeight: '700' }}>Lv.{dragon.level}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Arrow connector */}
      {!isLast && (
        <View style={{ alignItems: 'center', marginVertical: 2 }}>
          <View style={{ width: 2, height: 14, backgroundColor: dragon.borderColor, opacity: 0.4 }} />
          <Text style={{ fontSize: 14, color: dragon.color, marginTop: -2 }}>▼</Text>
        </View>
      )}
    </Animated.View>
  );
});

export default function EvolutionTreeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F3FF' }}>
      <StatusBar style="dark" backgroundColor="#F5F3FF" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
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

        <Text style={{ color: '#6B7280', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
          Merge identical dragons to evolve into higher tiers!
        </Text>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          {DRAGON_LEVELS.map((d, i) => (
            <DragonChainCard
              key={d.level}
              dragon={d}
              index={i}
              isLast={i === DRAGON_LEVELS.length - 1}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
