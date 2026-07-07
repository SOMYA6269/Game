import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, FlatList, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DRAGON_LEVELS, RARITY_CONFIG } from '../../lib/gameData';
import type { Rarity } from '../../lib/gameTypes';

const UNLOCKED_LEVELS = [1, 2, 3, 4, 5, 6, 7];
const RARITY_FILTERS: Array<Rarity | 'all'> = ['all', 'common', 'rare', 'epic', 'legendary', 'mythic'];

function DragonCard({ dragon, unlocked }: { dragon: typeof DRAGON_LEVELS[0]; unlocked: boolean }) {
  const rarityConf = RARITY_CONFIG[dragon.rarity];
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!unlocked) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -6, duration: 900, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [unlocked, bounce]);

  return (
    <Animated.View style={{
      flex: 1, margin: 8,
      backgroundColor: unlocked ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
      borderRadius: 24, padding: 16, alignItems: 'center',
      borderWidth: 2.5,
      borderColor: unlocked ? dragon.borderColor : '#E5E7EB',
      shadowColor: unlocked ? dragon.color : '#000',
      shadowOffset: { width: 0, height: 4 }, shadowOpacity: unlocked ? 0.25 : 0.08, shadowRadius: 8,
      transform: [{ translateY: bounce }],
    }}>
      {/* Dragon circle */}
      <View style={{
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: unlocked ? dragon.bgColor : '#F3F4F6',
        borderWidth: 3, borderColor: unlocked ? dragon.borderColor : '#E5E7EB',
        alignItems: 'center', justifyContent: 'center', marginBottom: 10,
        shadowColor: dragon.glowColor, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: unlocked ? 0.9 : 0, shadowRadius: 12,
      }}>
        {unlocked
          ? <Text style={{ fontSize: 34 }}>{dragon.emoji}</Text>
          : <Text style={{ fontSize: 30, opacity: 0.35 }}>❓</Text>
        }
      </View>

      {/* Name */}
      <Text style={{
        fontWeight: '900', fontSize: 14, color: unlocked ? '#1E1B4B' : '#9CA3AF',
        textAlign: 'center', marginBottom: 6, letterSpacing: 0.2,
      }}>
        {unlocked ? dragon.name : '???'}
      </Text>

      {/* Rarity badge */}
      <View style={{
        backgroundColor: rarityConf.bg, borderRadius: 10,
        paddingHorizontal: 8, paddingVertical: 2, marginBottom: 4,
      }}>
        <Text style={{ fontSize: 10, color: rarityConf.color, fontWeight: '800' }}>
          {rarityConf.label}
        </Text>
      </View>

      {/* Description */}
      {unlocked && (
        <Text style={{ fontSize: 10, color: '#6B7280', textAlign: 'center', lineHeight: 14 }}>
          {dragon.description}
        </Text>
      )}

      {/* Level badge */}
      <View style={{
        position: 'absolute', top: -8, right: -8,
        backgroundColor: unlocked ? dragon.color : '#9CA3AF',
        borderRadius: 10, width: 22, height: 22,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#fff',
      }}>
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>Lv{dragon.level}</Text>
      </View>
    </Animated.View>
  );
}

export default function CollectionScreen() {
  const [filter, setFilter] = useState<Rarity | 'all'>('all');
  const filtered = DRAGON_LEVELS.filter(d => filter === 'all' || d.rarity === filter);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F7FF' }}>
      <StatusBar style="dark" backgroundColor="#F9F7FF" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
          paddingVertical: 12, gap: 10,
        }}>
          <Pressable onPress={() => router.back()} style={{
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
            borderWidth: 2, borderColor: '#A78BFA',
            shadowColor: '#9333EA', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15, shadowRadius: 4,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '800' }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 24, fontWeight: '900', color: '#1E1B4B', flex: 1, letterSpacing: 0.3 }}>📚 Dragon Book</Text>
          <View style={{
            backgroundColor: '#9333EA', borderRadius: 14,
            paddingHorizontal: 12, paddingVertical: 6,
            borderWidth: 2, borderColor: '#D084FF',
            shadowColor: '#9333EA', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3, shadowRadius: 6,
          }}>
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 }}>
              {UNLOCKED_LEVELS.length}/{DRAGON_LEVELS.length}
            </Text>
          </View>
        </View>

        {/* Filters */}
        <FlatList
          horizontal
          data={RARITY_FILTERS}
          keyExtractor={r => r}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10, gap: 8 }}
          renderItem={({ item: r }) => {
            const conf = r === 'all' ? { color: '#5B21B6', bg: '#EDE9FE' } : RARITY_CONFIG[r];
            const active = filter === r;
            return (
              <Pressable
                onPress={() => setFilter(r)}
                style={{
                  backgroundColor: active ? conf.color : conf.bg,
                  borderRadius: 18, paddingHorizontal: 16, paddingVertical: 8,
                  borderWidth: 2.5, borderColor: conf.color,
                  shadowColor: active ? conf.color : '#000',
                  shadowOffset: { width: 0, height: active ? 3 : 1 },
                  shadowOpacity: active ? 0.3 : 0.08,
                  shadowRadius: active ? 8 : 2,
                }}
              >
                <Text style={{ color: active ? '#fff' : conf.color, fontWeight: '900', fontSize: 13, letterSpacing: 0.3 }}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </Pressable>
            );
          }}
        />

        {/* Grid */}
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={d => `${d.level}`}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <DragonCard dragon={item} unlocked={UNLOCKED_LEVELS.includes(item.level)} />
          )}
        />
      </SafeAreaView>
    </View>
  );
}
