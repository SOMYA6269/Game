import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Pause } from 'lucide-react-native';

interface Props {
  score: number;
  bestScore: number;
  coins: number;
  gems: number;
  levelTarget: number;
  currentLevel: number;
  onPause: () => void;
  onShop?: () => void;
}

export default function ScorePanel({
  score, bestScore, coins, gems, levelTarget, currentLevel, onPause, onShop,
}: Props) {
  const progress = Math.min(score / levelTarget, 1);

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 12,
      marginHorizontal: 8,
      marginBottom: 8,
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      borderWidth: 1.5,
      borderColor: '#E8D5FF',
    }}>
      {/* Top row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        {/* Score */}
        <View style={{ alignItems: 'center', minWidth: 90 }}>
          <Text style={{ fontSize: 10, color: '#8B5CF6', fontWeight: '800', letterSpacing: 1 }}>SCORE</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#1E1B4B' }}>{score.toLocaleString()}</Text>
        </View>

        {/* Level badge */}
        <View style={{
          backgroundColor: '#8B5CF6', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 4,
          alignItems: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>LEVEL</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{currentLevel}</Text>
        </View>

        {/* Best + pause */}
        <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 8 }}>
          <View style={{ alignItems: 'center', minWidth: 72 }}>
            <Text style={{ fontSize: 10, color: '#F59E0B', fontWeight: '800', letterSpacing: 1 }}>BEST</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1E1B4B' }}>{Math.max(score, bestScore).toLocaleString()}</Text>
          </View>
          <Pressable
            onPress={onPause}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: '#F3F0FF', alignItems: 'center', justifyContent: 'center',
              borderWidth: 1.5, borderColor: '#8B5CF6',
            }}
          >
            <Pause size={16} color="#8B5CF6" />
          </Pressable>
        </View>
      </View>

      {/* Progress bar */}
      <View style={{ marginBottom: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
          <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '600' }}>Level Progress</Text>
          <Text style={{ fontSize: 10, color: '#8B5CF6', fontWeight: '700' }}>{score.toLocaleString()} / {levelTarget.toLocaleString()}</Text>
        </View>
        <View style={{ height: 8, backgroundColor: '#F3F0FF', borderRadius: 4, overflow: 'hidden' }}>
          <View style={{
            height: 8, width: `${progress * 100}%`, borderRadius: 4,
            backgroundColor: progress >= 1 ? '#22C55E' : '#8B5CF6',
          }} />
        </View>
      </View>

      {/* Currency row */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={onShop}
          style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#FEF3C7', borderRadius: 10, paddingVertical: 4, gap: 4,
            borderWidth: 1.5, borderColor: '#FCD34D',
          }}
        >
          <Text style={{ fontSize: 14 }}>🪙</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#92400E' }}>{coins.toLocaleString()}</Text>
          <Text style={{ fontSize: 12, color: '#D97706', fontWeight: '800' }}>+</Text>
        </Pressable>
        <Pressable
          onPress={onShop}
          style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#EDE9FE', borderRadius: 10, paddingVertical: 4, gap: 4,
            borderWidth: 1.5, borderColor: '#C4B5FD',
          }}
        >
          <Text style={{ fontSize: 14 }}>💎</Text>
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#5B21B6' }}>{gems}</Text>
          <Text style={{ fontSize: 12, color: '#7C3AED', fontWeight: '800' }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
