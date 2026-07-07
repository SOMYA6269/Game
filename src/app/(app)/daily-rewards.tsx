import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DAILY_REWARDS } from '../../lib/gameData';

const ACHIEVEMENTS = [
  { id: 1, emoji: '🥚', name: 'First Merge',   desc: 'Merge 2 eggs',          done: true },
  { id: 2, emoji: '🐲', name: 'Baby Dragon',   desc: 'Reach level 6 dragon',  done: true },
  { id: 3, emoji: '💰', name: 'Coin Hoarder',  desc: 'Collect 1,000 coins',   done: false },
  { id: 4, emoji: '⚡', name: 'Combo Master',  desc: 'Achieve ×5 combo',      done: false },
  { id: 5, emoji: '🏆', name: 'High Scorer',   desc: 'Score 5,000 points',    done: false },
  { id: 6, emoji: '🌈', name: 'Rainbow Power', desc: 'Unlock Rainbow Dragon', done: false },
];

const CURRENT_DAY = 4;

export default function DailyRewardsScreen() {
  const [claimed, setClaimed] = useState<number[]>([1, 2, 3]);
  const [tab, setTab] = useState<'daily' | 'achieve'>('daily');
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  const SPIN_PRIZES = ['🪙 200', '💎 5', '🪙 500', '❄️ Freeze', '💣 Bomb', '🌈 Rainbow', '🪙 100', '💎 10'];

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setSpinResult(null);
    Animated.timing(spinAnim, { toValue: 3, duration: 1800, useNativeDriver: true }).start(() => {
      spinAnim.setValue(0);
      setSpinning(false);
      setSpinResult(SPIN_PRIZES[Math.floor(Math.random() * SPIN_PRIZES.length)]);
    });
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 3], outputRange: ['0deg', '1080deg'] });

  return (
    <View style={{ flex: 1, backgroundColor: '#ECFDF5' }}>
      <StatusBar style="dark" backgroundColor="#ECFDF5" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 16, paddingVertical: 12, gap: 10,
        }}>
          <Pressable onPress={() => router.back()} style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center',
            borderWidth: 1.5, borderColor: '#6EE7B7',
          }}>
            <Text style={{ fontSize: 16 }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#065F46', flex: 1 }}>🎁 Rewards</Text>
        </View>

        {/* Tab switcher */}
        <View style={{
          flexDirection: 'row', marginHorizontal: 16, marginBottom: 16,
          backgroundColor: '#D1FAE5', borderRadius: 16, padding: 4,
        }}>
          {(['daily', 'achieve'] as const).map(t => (
            <Pressable key={t} onPress={() => setTab(t)} style={{
              flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center',
              backgroundColor: tab === t ? '#10B981' : 'transparent',
            }}>
              <Text style={{ fontWeight: '800', fontSize: 13, color: tab === t ? '#fff' : '#065F46' }}>
                {t === 'daily' ? '📅 Daily' : '🏆 Achievements'}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          {tab === 'daily' ? (
            <>
              {/* Streak */}
              <View style={{
                backgroundColor: '#fff', borderRadius: 20, padding: 16,
                alignItems: 'center', marginBottom: 16, gap: 8,
                borderWidth: 2.5, borderColor: '#6EE7B7',
              }}>
                <Text style={{ fontSize: 36 }}>🔥</Text>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#065F46' }}>Day {CURRENT_DAY} Streak!</Text>
                <Text style={{ color: '#6B7280', fontSize: 13 }}>Come back tomorrow for Day {CURRENT_DAY + 1}</Text>
              </View>

              {/* 7-day grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {DAILY_REWARDS.map(reward => {
                  const isClaimed = claimed.includes(reward.day);
                  const isToday = reward.day === CURRENT_DAY;
                  return (
                    <Pressable
                      key={reward.day}
                      onPress={() => {
                        if (isToday && !isClaimed) setClaimed(prev => [...prev, reward.day]);
                      }}
                      style={{
                        width: '13%', minWidth: 44,
                        flex: 1,
                        backgroundColor: isClaimed ? '#D1FAE5' : isToday ? '#fff' : '#F9FAFB',
                        borderRadius: 16, padding: 8, alignItems: 'center', gap: 4,
                        borderWidth: 2.5,
                        borderColor: isClaimed ? '#10B981' : isToday ? '#F59E0B' : '#E5E7EB',
                      }}
                    >
                      <Text style={{ fontSize: 11, color: isToday ? '#F59E0B' : '#9CA3AF', fontWeight: '700' }}>
                        Day {reward.day}
                      </Text>
                      <Text style={{ fontSize: 24 }}>{isClaimed ? '✅' : reward.emoji}</Text>
                      <Text style={{ fontSize: 9, color: '#6B7280', textAlign: 'center', fontWeight: '600' }}>
                        {reward.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Lucky spin */}
              <View style={{
                backgroundColor: '#fff', borderRadius: 24, padding: 20,
                alignItems: 'center', gap: 12,
                borderWidth: 2.5, borderColor: '#FCD34D',
              }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#92400E' }}>🎡 Lucky Spin</Text>
                <View style={{
                  width: 110, height: 110, borderRadius: 55,
                  backgroundColor: '#FEF3C7',
                  borderWidth: 4, borderColor: '#F59E0B',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Animated.Text style={{ fontSize: 52, transform: [{ rotate: spin }] }}>🎡</Animated.Text>
                </View>
                {spinResult && (
                  <View style={{
                    backgroundColor: '#F0FDF4', borderRadius: 14,
                    paddingHorizontal: 16, paddingVertical: 8,
                  }}>
                    <Text style={{ fontWeight: '900', color: '#065F46', fontSize: 16 }}>
                      🎉 You won: {spinResult}!
                    </Text>
                  </View>
                )}
                <Pressable onPress={handleSpin} style={{
                  backgroundColor: spinning ? '#9CA3AF' : '#F59E0B',
                  borderRadius: 16, paddingVertical: 12, paddingHorizontal: 32,
                }}>
                  <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>
                    {spinning ? 'Spinning...' : '🎰 SPIN (Free)'}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={{ gap: 10 }}>
              {ACHIEVEMENTS.map(a => (
                <View key={a.id} style={{
                  backgroundColor: '#fff', borderRadius: 18, padding: 14,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  borderWidth: 2, borderColor: a.done ? '#6EE7B7' : '#E5E7EB',
                  opacity: a.done ? 1 : 0.7,
                }}>
                  <View style={{
                    width: 52, height: 52, borderRadius: 26,
                    backgroundColor: a.done ? '#D1FAE5' : '#F3F4F6',
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 2, borderColor: a.done ? '#10B981' : '#E5E7EB',
                  }}>
                    <Text style={{ fontSize: 24 }}>{a.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '900', color: '#1E1B4B', fontSize: 14 }}>{a.name}</Text>
                    <Text style={{ color: '#6B7280', fontSize: 12 }}>{a.desc}</Text>
                  </View>
                  <Text style={{ fontSize: 22 }}>{a.done ? '✅' : '🔒'}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
