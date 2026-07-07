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
      flex: 1, margin: 6,
      backgroundColor: unlocked ? '#fff' : 'rgba(255,255,255,0.5)',
      borderRadius: 20, padding: 14, alignItems: 'center',
      borderWidth: 2.5,
      borderColor: unlocked ? dragon.borderColor : '#E5E7EB',
      shadowColor: unlocked ? dragon.color : '#000',
      shadowOffset: { width: 0, height: 3 }, shadowOpacity: unlocked ? 0.2 : 0.05, shadowRadius: 6,
      transform: [{ translateY: bounce }],
    }}>
      {/* Dragon circle */}
      <View style={{
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: unlocked ? dragon.bgColor : '#F3F4F6',
        borderWidth: 2.5, borderColor: unlocked ? dragon.borderColor : '#E5E7EB',
        alignItems: 'center', justifyContent: 'center', marginBottom: 8,
        shadowColor: dragon.glowColor, shadowOffset: { width: 0, height: 0 },
        shadowOpacity: unlocked ? 0.8 : 0, shadowRadius: 10,
      }}>
        {unlocked
          ? <Text style={{ fontSize: 30 }}>{dragon.emoji}</Text>
          : <Text style={{ fontSize: 28, opacity: 0.4 }}>❓</Text>
        }
      </View>

      {/* Name */}
      <Text style={{
        fontWeight: '900', fontSize: 13, color: unlocked ? '#1E1B4B' : '#9CA3AF',
        textAlign: 'center', marginBottom: 4,
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
    <View style={{ flex: 1, backgroundColor: '#F5F3FF' }}>
      <StatusBar style="dark" backgroundColor="#F5F3FF" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
          paddingVertical: 12, gap: 10,
        }}>
          <Pressable onPress={() => router.back()} style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
            borderWidth: 1.5, borderColor: '#C4B5FD',
          }}>
            <Text style={{ fontSize: 16 }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#1E1B4B', flex: 1 }}>📚 Dragon Book</Text>
          <View style={{
            backgroundColor: '#EDE9FE', borderRadius: 12,
            paddingHorizontal: 10, paddingVertical: 4,
          }}>
            <Text style={{ color: '#5B21B6', fontWeight: '800', fontSize: 13 }}>
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
                  borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6,
                  borderWidth: 2, borderColor: conf.color,
                }}
              >
                <Text style={{ color: active ? '#fff' : conf.color, fontWeight: '800', fontSize: 12 }}>
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
