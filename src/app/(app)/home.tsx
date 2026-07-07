import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

function NavCard({
  emoji, label, sub, color, bgColor, onPress,
}: {
  emoji: string; label: string; sub?: string; color: string;
  bgColor: string; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: bgColor,
        borderRadius: 20, padding: 16,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4, shadowRadius: 8,
        flex: 1,
      }}
    >
      <Text style={{ fontSize: 28, marginBottom: 6 }}>{emoji}</Text>
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{label}</Text>
      {sub ? <Text style={{ color: `${color}BB`, fontSize: 10, marginTop: 2 }}>{sub}</Text> : null}
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0118' }}>
      <StatusBar style="light" backgroundColor="#0A0118" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          {/* Header */}
          <View style={{ alignItems: 'center', paddingTop: 28, paddingBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Text style={{ fontSize: 36 }}>🐲</Text>
              <Text style={{ fontSize: 36 }}>👑</Text>
              <Text style={{ fontSize: 36 }}>🐉</Text>
            </View>
            <Text style={{
              color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 0.5,
            }}>
              Dragon Merge
            </Text>
            <Text style={{ color: '#FBBF24', fontSize: 22, fontWeight: '900', letterSpacing: 1 }}>
              Kingdom
            </Text>
            {/* Currency bar */}
            <View style={{
              flexDirection: 'row', gap: 12, marginTop: 16,
              backgroundColor: '#1A0A3E', borderRadius: 16,
              paddingHorizontal: 20, paddingVertical: 10,
              borderWidth: 1, borderColor: '#2D1060',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Text style={{ fontSize: 18 }}>🪙</Text>
                <Text style={{ color: '#FBBF24', fontWeight: '800', fontSize: 16 }}>1,000</Text>
                <Pressable
                  onPress={() => router.push('/(app)/shop' as never)}
                  style={{
                    width: 20, height: 20, borderRadius: 10,
                    backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>+</Text>
                </Pressable>
              </View>
              <View style={{ width: 1, backgroundColor: '#2D1060' }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Text style={{ fontSize: 18 }}>💎</Text>
                <Text style={{ color: '#60A5FA', fontWeight: '800', fontSize: 16 }}>120</Text>
                <Pressable
                  onPress={() => router.push('/(app)/shop' as never)}
                  style={{
                    width: 20, height: 20, borderRadius: 10,
                    backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* PLAY button */}
          <Pressable
            onPress={() => router.push('/(app)/game' as never)}
            style={{
              backgroundColor: '#F59E0B',
              borderRadius: 22, paddingVertical: 22,
              alignItems: 'center', justifyContent: 'center',
              flexDirection: 'row', gap: 10,
              marginBottom: 16,
              shadowColor: '#F59E0B',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.6, shadowRadius: 16,
            }}
          >
            <Text style={{ fontSize: 28 }}>▶️</Text>
            <View>
              <Text style={{ color: '#1A0A2E', fontSize: 22, fontWeight: '900', letterSpacing: 1 }}>
                PLAY NOW
              </Text>
              <Text style={{ color: '#78350F', fontSize: 11, fontWeight: '700' }}>
                Level 5 · High Score: 2,458
              </Text>
            </View>
          </Pressable>

          {/* Navigation grid */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <NavCard
              emoji="🗺️" label="World Map" sub="Level 5"
              color="#60A5FA" bgColor="#1E3A8A"
              onPress={() => router.push('/(app)/world-map' as never)}
            />
            <NavCard
              emoji="📚" label="Collection" sub="7/11 dragons"
              color="#C084FC" bgColor="#3B0764"
              onPress={() => router.push('/(app)/collection' as never)}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <NavCard
              emoji="🏪" label="Shop" sub="Get boosters"
              color="#FBBF24" bgColor="#78350F"
              onPress={() => router.push('/(app)/shop' as never)}
            />
            <NavCard
              emoji="📅" label="Daily Reward" sub="Day 4 ready!"
              color="#4ADE80" bgColor="#14532D"
              onPress={() => router.push('/(app)/daily-rewards' as never)}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <NavCard
              emoji="🐉" label="Evolution" sub="Dragon tree"
              color="#F87171" bgColor="#7F1D1D"
              onPress={() => router.push('/(app)/evolution-tree' as never)}
            />
            <NavCard
              emoji="⚙️" label="Settings"
              color="#9D7EC9" bgColor="#1A0A3E"
              onPress={() => router.push('/(app)/settings' as never)}
            />
          </View>

          {/* Best score card */}
          <View style={{
            backgroundColor: '#1A0A3E',
            borderRadius: 18, padding: 16, marginTop: 8,
            borderWidth: 2, borderColor: '#FBBF24',
            flexDirection: 'row', alignItems: 'center', gap: 16,
          }}>
            <Text style={{ fontSize: 40 }}>🏆</Text>
            <View>
              <Text style={{ color: '#9D7EC9', fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>
                BEST SCORE
              </Text>
              <Text style={{ color: '#FBBF24', fontSize: 28, fontWeight: '900' }}>2,458</Text>
              <Text style={{ color: '#6B4E9E', fontSize: 11 }}>Keep merging to beat it!</Text>
            </View>
          </View>

          {/* Dragon showcase row */}
          <View style={{ marginTop: 20 }}>
            <Text style={{
              color: '#9D7EC9', fontWeight: '700', fontSize: 11,
              letterSpacing: 1, marginBottom: 12,
            }}>
              YOUR DRAGONS
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -16, paddingHorizontal: 16 }}
            >
              {([
                ['🥚','#14532D','#4ADE80'],
                ['💎','#1E3A8A','#60A5FA'],
                ['✨','#581C87','#C084FC'],
                ['🌟','#7F1D1D','#F87171'],
                ['⭐','#78350F','#FCD34D'],
                ['💗','#831843','#F9A8D4'],
                ['🐲','#064E3B','#34D399'],
              ] as [string,string,string][]).map(([e, bg, border], i) => (
                <View key={i} style={{
                  width: 52, height: 52, borderRadius: 26,
                  backgroundColor: bg,
                  alignItems: 'center', justifyContent: 'center',
                  marginRight: 10,
                  borderWidth: 2, borderColor: border,
                }}>
                  <Text style={{ fontSize: 24 }}>{e}</Text>
                </View>
              ))}
              <Pressable
                onPress={() => router.push('/(app)/collection' as never)}
                style={{
                  width: 52, height: 52, borderRadius: 26,
                  backgroundColor: '#1A0A3E',
                  alignItems: 'center', justifyContent: 'center',
                  borderWidth: 2, borderColor: '#2D1060',
                }}
              >
                <Text style={{ color: '#9D7EC9', fontSize: 16, fontWeight: '700' }}>+4</Text>
              </Pressable>
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
