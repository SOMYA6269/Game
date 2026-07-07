import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Crown, Pause, Settings, Coins } from 'lucide-react-native';
import { router } from 'expo-router';

interface ScorePanelProps {
  score: number;
  bestScore: number;
  coins: number;
  gems: number;
  onPause: () => void;
}

export default function ScorePanel({ score, bestScore, coins, gems, onPause }: ScorePanelProps) {
  return (
    <View className="w-full px-3 pt-2 pb-1">
      {/* Top row: pause | score | settings */}
      <View className="flex-row items-center justify-between mb-1">
        {/* Pause */}
        <Pressable
          className="w-10 h-10 rounded-xl bg-secondary items-center justify-center active:opacity-70"
          onPress={onPause}
          style={{ borderCurve: 'continuous' }}
        >
          <Pause size={18} color="#E879F9" />
        </Pressable>

        {/* Score panel */}
        <View
          className="flex-1 mx-2 bg-secondary rounded-2xl px-4 py-1 items-center"
          style={{ borderCurve: 'continuous' }}
        >
          <View className="flex-row items-center gap-1 mb-0.5">
            <Crown size={12} color="#FBBF24" />
            <Text className="text-[10px] font-semibold text-accent uppercase tracking-wider">
              Best {bestScore}
            </Text>
          </View>
          <Text className="text-3xl font-bold text-foreground" style={{ lineHeight: 32 }}>
            {score.toLocaleString()}
          </Text>
        </View>

        {/* Settings */}
        <Pressable
          className="w-10 h-10 rounded-xl bg-secondary items-center justify-center active:opacity-70"
          onPress={() => router.push('/(app)/settings' as never)}
          style={{ borderCurve: 'continuous' }}
        >
          <Settings size={18} color="#E879F9" />
        </Pressable>
      </View>

      {/* Currency row */}
      <View className="flex-row justify-end gap-2">
        <View
          className="flex-row items-center gap-1 bg-secondary rounded-xl px-3 py-1"
          style={{ borderCurve: 'continuous' }}
        >
          <Text className="text-sm">🪙</Text>
          <Text className="text-sm font-bold text-accent">{coins.toLocaleString()}</Text>
          <Pressable className="w-5 h-5 rounded-full bg-primary items-center justify-center active:opacity-70" onPress={() => {}}>
            <Text className="text-[10px] font-bold text-primary-foreground">+</Text>
          </Pressable>
        </View>
        <View
          className="flex-row items-center gap-1 bg-secondary rounded-xl px-3 py-1"
          style={{ borderCurve: 'continuous' }}
        >
          <Text className="text-sm">💎</Text>
          <Text className="text-sm font-bold text-foreground">{gems}</Text>
          <Pressable className="w-5 h-5 rounded-full bg-primary items-center justify-center active:opacity-70" onPress={() => {}}>
            <Text className="text-[10px] font-bold text-primary-foreground">+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
