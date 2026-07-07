import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { DAILY_REWARDS } from '@/lib/gameData';

export default function DailyRewardsScreen() {
  const [claimedDay, setClaimedDay] = useState(3); // days 1-3 already claimed
  const currentDay = 4; // today

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
          <Text style={{ flex: 1, color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center' }}>
            📅 Daily Rewards
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {/* Banner */}
          <View style={{
            backgroundColor: '#3B0764',
            borderRadius: 20, padding: 20,
            alignItems: 'center', marginBottom: 24,
            borderWidth: 2, borderColor: '#7C3AED',
          }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🎁</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>
              Day {currentDay} Reward Ready!
            </Text>
            <Text style={{ color: '#C4B5FD', fontSize: 13, marginTop: 4 }}>
              Come back every day for bigger rewards
            </Text>
          </View>

          {/* Reward grid */}
          <Text style={{ color: '#9D7EC9', fontWeight: '700', fontSize: 12, marginBottom: 12, letterSpacing: 1 }}>
            7-DAY REWARD CYCLE
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {DAILY_REWARDS.map(reward => {
              const isClaimed = reward.day <= claimedDay;
              const isCurrent = reward.day === currentDay;
              const isLocked = reward.day > currentDay;

              return (
                <View
                  key={reward.day}
                  style={{
                    width: '30%',
                    backgroundColor: isClaimed ? '#14532D' : isCurrent ? '#4C1D95' : '#0F0520',
                    borderRadius: 16,
                    padding: 12,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: isClaimed ? '#4ADE80' : isCurrent ? '#C084FC' : '#2D1060',
                    opacity: isLocked ? 0.5 : 1,
                  }}
                >
                  <Text style={{ color: '#9D7EC9', fontSize: 9, fontWeight: '700', marginBottom: 4 }}>
                    DAY {reward.day}
                  </Text>
                  <Text style={{ fontSize: 28 }}>
                    {isClaimed ? '✅' : reward.emoji}
                  </Text>
                  <Text style={{
                    color: isClaimed ? '#4ADE80' : '#E9D5FF',
                    fontSize: 10, fontWeight: '700', marginTop: 4, textAlign: 'center',
                  }}>
                    {isClaimed ? 'Claimed!' : reward.label}
                  </Text>
                  {isCurrent && !isClaimed && (
                    <View style={{
                      position: 'absolute', top: -6, right: -6,
                      backgroundColor: '#EF4444',
                      borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2,
                    }}>
                      <Text style={{ fontSize: 7, fontWeight: '800', color: '#fff' }}>TODAY</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Claim button */}
          <Pressable
            onPress={() => {
              if (currentDay > claimedDay) setClaimedDay(currentDay);
            }}
            style={{
              backgroundColor: claimedDay >= currentDay ? '#374151' : '#7C3AED',
              borderRadius: 18, paddingVertical: 18,
              alignItems: 'center', justifyContent: 'center',
              opacity: claimedDay >= currentDay ? 0.6 : 1,
              shadowColor: '#7C3AED',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: claimedDay >= currentDay ? 0 : 0.5,
              shadowRadius: 12,
            }}
            disabled={claimedDay >= currentDay}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>
              {claimedDay >= currentDay ? '✅ Already Claimed Today' : '🎁 Claim Day ' + currentDay + ' Reward!'}
            </Text>
          </Pressable>

          {claimedDay >= currentDay && (
            <Text style={{ color: '#6B7280', textAlign: 'center', fontSize: 12, marginTop: 12 }}>
              Next reward in: 18h 24m 35s
            </Text>
          )}

          {/* Streak bonus */}
          <View style={{
            marginTop: 28, backgroundColor: '#1A0A3E',
            borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#2D1060',
          }}>
            <Text style={{ color: '#FBBF24', fontWeight: '800', fontSize: 14, marginBottom: 8 }}>
              🔥 Login Streak: {currentDay} Days
            </Text>
            <View style={{ backgroundColor: '#0F0520', borderRadius: 8, height: 8, overflow: 'hidden' }}>
              <View style={{
                height: 8, borderRadius: 8,
                width: `${(currentDay / 7) * 100}%`,
                backgroundColor: '#FBBF24',
              }} />
            </View>
            <Text style={{ color: '#9D7EC9', fontSize: 12, marginTop: 8 }}>
              {7 - currentDay} more days for 7-day bonus: 💎 20 Gems!
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
