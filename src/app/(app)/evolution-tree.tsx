import React, { useState } from 'react';
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
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react-native';
import { DRAGON_LEVELS } from '@/lib/gameData';

const UNLOCKED_UP_TO = 7;

export default function EvolutionTreeScreen() {
  const { width } = useWindowDimensions();

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
            🐉 Evolution Tree
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Subtitle */}
        <Text style={{ color: '#9D7EC9', textAlign: 'center', fontSize: 12, marginBottom: 20, paddingHorizontal: 24 }}>
          Merge 2 identical dragons to evolve to the next stage
        </Text>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {/* Evolution chain */}
          {DRAGON_LEVELS.map((dragon, i) => {
            const unlocked = dragon.level <= UNLOCKED_UP_TO;
            const nextDragon = DRAGON_LEVELS[i + 1];
            const isLast = i === DRAGON_LEVELS.length - 1;

            return (
              <View key={dragon.level}>
                {/* Dragon row */}
                <View style={{
                  flexDirection: 'row', alignItems: 'center',
                  backgroundColor: unlocked ? '#1A0A3E' : '#0F0520',
                  borderRadius: 18, padding: 14,
                  borderWidth: 2,
                  borderColor: unlocked ? dragon.color : '#1A0A3E',
                  opacity: unlocked ? 1 : 0.5,
                }}>
                  {/* Level badge */}
                  <View style={{
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: unlocked ? dragon.color : '#2D1060',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Text style={{ color: '#1A0A2E', fontWeight: '900', fontSize: 11 }}>
                      {dragon.level}
                    </Text>
                  </View>

                  {/* Dragon circle */}
                  <View style={{
                    width: 56, height: 56, borderRadius: 28,
                    backgroundColor: unlocked ? dragon.bgColor : '#0F0520',
                    borderWidth: 2.5, borderColor: unlocked ? dragon.color : '#2D1060',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 16,
                    shadowColor: unlocked ? dragon.glowColor : 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8, shadowRadius: 8,
                  }}>
                    {unlocked ? (
                      <Text style={{ fontSize: 28 }}>{dragon.emoji}</Text>
                    ) : (
                      <Text style={{ fontSize: 22, opacity: 0.3 }}>?</Text>
                    )}
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <Text style={{
                        color: unlocked ? dragon.color : '#3B1A7A',
                        fontWeight: '800', fontSize: 15,
                      }}>
                        {unlocked ? dragon.name : '???'}
                      </Text>
                      <View style={{
                        backgroundColor: dragon.rarity === 'legendary' ? '#78350F' :
                          dragon.rarity === 'rare' ? '#3B0764' : '#1F2937',
                        borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
                      }}>
                        <Text style={{
                          fontSize: 8, fontWeight: '800',
                          color: dragon.rarity === 'legendary' ? '#FBBF24' :
                            dragon.rarity === 'rare' ? '#C084FC' : '#9CA3AF',
                        }}>
                          {dragon.rarity.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ color: '#9D7EC9', fontSize: 11 }}>
                      Score: {dragon.score.toLocaleString()} pts  ·  r={dragon.radius}
                    </Text>
                  </View>

                  {/* Preview button */}
                  {unlocked && (
                    <Pressable
                      onPress={() => router.push({
                        pathname: '/(app)/unlock-animation',
                        params: { level: dragon.level },
                      } as never)}
                      style={{
                        width: 32, height: 32, borderRadius: 16,
                        backgroundColor: '#2D1060', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <ChevronRight size={16} color="#C084FC" />
                    </Pressable>
                  )}
                </View>

                {/* Merge arrow connector */}
                {!isLast && (
                  <View style={{ alignItems: 'center', marginVertical: 4 }}>
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', gap: 8,
                      backgroundColor: '#0F0520',
                      borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
                    }}>
                      <View style={{
                        width: 28, height: 28, borderRadius: 14,
                        backgroundColor: dragon.bgColor,
                        borderWidth: 1.5, borderColor: dragon.color,
                        alignItems: 'center', justifyContent: 'center',
                        opacity: unlocked ? 1 : 0.3,
                      }}>
                        <Text style={{ fontSize: 12 }}>{dragon.emoji}</Text>
                      </View>
                      <Text style={{ color: '#6B4E9E', fontSize: 13, fontWeight: '700' }}>×2</Text>
                      <ArrowRight size={14} color="#6B4E9E" />
                      <View style={{
                        width: 28, height: 28, borderRadius: 14,
                        backgroundColor: nextDragon?.bgColor ?? dragon.bgColor,
                        borderWidth: 1.5, borderColor: nextDragon?.color ?? dragon.color,
                        alignItems: 'center', justifyContent: 'center',
                        opacity: nextDragon && nextDragon.level <= UNLOCKED_UP_TO ? 1 : 0.3,
                      }}>
                        <Text style={{ fontSize: 12 }}>{nextDragon?.emoji ?? '?'}</Text>
                      </View>
                      <Text style={{ color: '#6B4E9E', fontSize: 10 }}>
                        = Lv.{(nextDragon?.level ?? dragon.level + 1)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Final dragon banner */}
                {isLast && (
                  <View style={{
                    marginTop: 8,
                    backgroundColor: '#3B0764',
                    borderRadius: 14, padding: 12,
                    borderWidth: 2, borderColor: '#7C3AED',
                    alignItems: 'center',
                  }}>
                    <Text style={{ color: '#FBBF24', fontWeight: '800', fontSize: 12 }}>
                      👑 MAX EVOLUTION — THE ULTIMATE DRAGON!
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
