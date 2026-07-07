import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Star, Map, Play } from 'lucide-react-native';
import { WORLD_LEVELS } from '@/lib/gameData';

const ISLAND_COLORS: Record<string, { bg: string; border: string; emoji: string }> = {
  forest:  { bg: '#14532D', border: '#4ADE80', emoji: '🌲' },
  volcano: { bg: '#7F1D1D', border: '#F87171', emoji: '🌋' },
  castle:  { bg: '#1E3A8A', border: '#60A5FA', emoji: '🏰' },
  ocean:   { bg: '#0C4A6E', border: '#38BDF8', emoji: '🌊' },
  sky:     { bg: '#3B0764', border: '#C084FC', emoji: '☁️' },
};

export default function WorldMapScreen() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0118' }}>
      <StatusBar style="light" backgroundColor="#0A0118" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 16, paddingVertical: 12, gap: 12,
        }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: '#1A0A3E', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} color="#C084FC" />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>🗺️ World Map</Text>
          </View>
          {/* Coins / Gems */}
          <View style={{
            flexDirection: 'row', gap: 8, backgroundColor: '#1A0A3E',
            borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6,
          }}>
            <Text style={{ color: '#FBBF24', fontWeight: '700', fontSize: 13 }}>🪙 1000</Text>
            <Text style={{ color: '#60A5FA', fontWeight: '700', fontSize: 13 }}>💎 120</Text>
          </View>
        </View>

        {/* Right sidebar icons */}
        <View style={{ position: 'absolute', right: 12, top: 110, gap: 10, zIndex: 10 }}>
          {[
            { emoji: '📅', label: 'Daily\nReward', route: '/(app)/daily-rewards', badge: true },
            { emoji: '📋', label: 'Mission', route: null, badge: false },
            { emoji: '🎰', label: 'Spin', route: null, badge: false },
            { emoji: '🏆', label: 'Rank', route: null, badge: false },
          ].map(item => (
            <Pressable
              key={item.label}
              onPress={() => item.route && router.push(item.route as never)}
              style={{
                width: 56, backgroundColor: '#6D28D9',
                borderRadius: 14, alignItems: 'center', justifyContent: 'center',
                paddingVertical: 6, borderWidth: 2, borderColor: '#7C3AED',
              }}
            >
              {item.badge && (
                <View style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 14, height: 14, borderRadius: 7,
                  backgroundColor: '#EF4444',
                }} />
              )}
              <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              <Text style={{ color: '#E9D5FF', fontSize: 8, fontWeight: '600', textAlign: 'center', marginTop: 2 }}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Map scroll area */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ minHeight: height * 1.0, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Sky background gradient layers */}
          <View style={{ position: 'absolute', inset: 0 }}>
            <View style={{ height: '40%', backgroundColor: '#1A0A3E' }} />
            <View style={{ height: '30%', backgroundColor: '#0F172A' }} />
            <View style={{ height: '30%', backgroundColor: '#0A0118' }} />
          </View>

          {/* Cloud decorations */}
          {[
            { top: '8%', left: '5%', size: 50 },
            { top: '15%', left: '55%', size: 70 },
            { top: '28%', left: '10%', size: 45 },
            { top: '42%', left: '60%', size: 55 },
          ].map((c, i) => (
            <Text key={i} style={{
              position: 'absolute',
              top: c.top as never, left: c.left as never,
              fontSize: c.size * 0.4, opacity: 0.3,
            }}>☁️</Text>
          ))}

          {/* Dotted path connecting levels */}
          {WORLD_LEVELS.slice(0, -1).map((lvl, i) => {
            const next = WORLD_LEVELS[i + 1];
            return (
              <View key={`path-${i}`} style={{
                position: 'absolute',
                left: `${Math.min(lvl.x, next.x) + 4}%` as never,
                top: `${Math.min(lvl.y, next.y) + 4}%` as never,
                width: 2,
                height: `${Math.abs(lvl.y - next.y)}%` as never,
                backgroundColor: 'transparent',
                borderLeftWidth: 2,
                borderLeftColor: '#4C1D95',
                borderStyle: 'dashed',
              }} />
            );
          })}

          {/* Level nodes */}
          {WORLD_LEVELS.map(lvl => {
            const style = ISLAND_COLORS[lvl.islandType];
            const isPlayable = !lvl.locked;

            return (
              <Pressable
                key={lvl.id}
                onPress={() => isPlayable && router.push('/(app)/game' as never)}
                style={{
                  position: 'absolute',
                  left: `${lvl.x}%` as never,
                  top: `${lvl.y}%` as never,
                  alignItems: 'center',
                  opacity: lvl.locked ? 0.45 : 1,
                }}
              >
                {/* Level badge */}
                <View style={{
                  backgroundColor: '#FBBF24',
                  borderRadius: 10,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginBottom: 4,
                  borderWidth: 1.5,
                  borderColor: '#F59E0B',
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#1A0A2E' }}>
                    {lvl.locked ? '🔒' : `Lv.${lvl.id}`}
                  </Text>
                </View>

                {/* Island */}
                <View style={{
                  width: 72, height: 72, borderRadius: 36,
                  backgroundColor: style.bg,
                  borderWidth: 3, borderColor: style.border,
                  alignItems: 'center', justifyContent: 'center',
                  shadowColor: style.border,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6, shadowRadius: 10,
                }}>
                  <Text style={{ fontSize: 30 }}>{style.emoji}</Text>
                </View>

                {/* Stars */}
                <View style={{ flexDirection: 'row', marginTop: 4, gap: 2 }}>
                  {[1, 2, 3].map(s => (
                    <Star
                      key={s}
                      size={12}
                      color={s <= lvl.stars ? '#FBBF24' : '#3B1A7A'}
                      fill={s <= lvl.stars ? '#FBBF24' : 'none'}
                    />
                  ))}
                </View>

                <Text style={{ color: '#C4B5FD', fontSize: 9, fontWeight: '600', marginTop: 2, maxWidth: 70, textAlign: 'center' }}>
                  {lvl.name}
                </Text>
              </Pressable>
            );
          })}

          {/* Shop icon bottom-left */}
          <Pressable
            onPress={() => router.push('/(app)/shop' as never)}
            style={{
              position: 'absolute', bottom: 20, left: 16,
              backgroundColor: '#0F172A', borderRadius: 16,
              padding: 10, borderWidth: 2, borderColor: '#1E3A8A',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 24 }}>🏪</Text>
            <Text style={{ color: '#60A5FA', fontSize: 9, fontWeight: '700', marginTop: 2 }}>SHOP</Text>
          </Pressable>
        </ScrollView>

        {/* Play button bottom center */}
        <View style={{
          paddingHorizontal: 24, paddingBottom: 12, paddingTop: 8,
          backgroundColor: '#0A0118',
          borderTopWidth: 1, borderTopColor: '#1A0A3E',
        }}>
          <Pressable
            onPress={() => router.push('/(app)/game' as never)}
            style={{
              backgroundColor: '#F59E0B',
              borderRadius: 20, paddingVertical: 16,
              alignItems: 'center', justifyContent: 'center',
              flexDirection: 'row', gap: 8,
              shadowColor: '#F59E0B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5, shadowRadius: 12,
            }}
          >
            <Play size={20} color="#1A0A2E" fill="#1A0A2E" />
            <Text style={{ color: '#1A0A2E', fontSize: 18, fontWeight: '900', letterSpacing: 1 }}>
              PLAY  LEVEL 5
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
