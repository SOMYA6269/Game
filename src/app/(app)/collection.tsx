import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { DRAGON_LEVELS } from '@/lib/gameData';
import type { DragonDef } from '@/lib/gameTypes';

type Tab = 'ALL' | 'COMMON' | 'RARE' | 'LEGENDARY';

const TABS: Tab[] = ['ALL', 'COMMON', 'RARE', 'LEGENDARY'];

function DragonCard({ dragon, unlocked }: { dragon: DragonDef; unlocked: boolean }) {
  return (
    <View style={{
      width: '31%', aspectRatio: 0.85,
      margin: '1%',
      borderRadius: 16, overflow: 'hidden',
      backgroundColor: unlocked ? dragon.bgColor : '#0F0520',
      borderWidth: 2,
      borderColor: unlocked ? dragon.color : '#2D1060',
      alignItems: 'center', justifyContent: 'center', paddingVertical: 10,
      shadowColor: unlocked ? dragon.glowColor : 'transparent',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5, shadowRadius: 6,
    }}>
      {/* Rarity badge */}
      <View style={{
        position: 'absolute', top: 6, right: 6,
        backgroundColor: dragon.rarity === 'legendary' ? '#FBBF24' :
          dragon.rarity === 'rare' ? '#C084FC' : '#6B7280',
        borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2,
      }}>
        <Text style={{ fontSize: 7, fontWeight: '800', color: '#1A0A2E' }}>
          {dragon.rarity.toUpperCase()}
        </Text>
      </View>

      {/* Dragon / locked */}
      <View style={{
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: unlocked ? `${dragon.color}22` : '#1A0A3E',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: unlocked ? dragon.color : '#3B1A7A',
      }}>
        {unlocked ? (
          <Text style={{ fontSize: 28 }}>{dragon.emoji}</Text>
        ) : (
          <Text style={{ fontSize: 22, opacity: 0.25 }}>?</Text>
        )}
      </View>

      <Text style={{
        marginTop: 6, fontSize: 10, fontWeight: '700',
        color: unlocked ? dragon.color : '#3B1A7A', textAlign: 'center',
        paddingHorizontal: 4,
      }} numberOfLines={1}>
        {unlocked ? dragon.name : '???'}
      </Text>

      {/* Level indicator */}
      <View style={{
        marginTop: 3,
        backgroundColor: unlocked ? `${dragon.color}30` : '#1A0A3E',
        borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
      }}>
        <Text style={{ fontSize: 9, color: unlocked ? dragon.color : '#3B1A7A', fontWeight: '600' }}>
          Lv.{dragon.level}
        </Text>
      </View>
    </View>
  );
}

export default function CollectionScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('ALL');
  // Simulate: first 7 dragons unlocked
  const UNLOCKED_UP_TO = 7;

  const filtered = DRAGON_LEVELS.filter(d =>
    activeTab === 'ALL' ? true : d.rarity === activeTab.toLowerCase()
  );

  // Merge guide: green egg + green egg = green dragon
  const mergeExample = DRAGON_LEVELS[0];
  const mergeResult = DRAGON_LEVELS[6];

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
            📚 Collection
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Filter tabs */}
        <View style={{
          flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12,
        }}>
          {TABS.map(tab => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1, paddingVertical: 8, borderRadius: 12, alignItems: 'center',
                backgroundColor: activeTab === tab ? '#7C3AED' : '#1A0A3E',
                borderWidth: 1.5,
                borderColor: activeTab === tab ? '#9D4EDD' : '#2D1060',
              }}
            >
              <Text style={{
                fontSize: 10, fontWeight: '700',
                color: activeTab === tab ? '#fff' : '#9D7EC9',
              }}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Dragon grid */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {filtered.map(dragon => (
              <DragonCard
                key={dragon.level}
                dragon={dragon}
                unlocked={dragon.level <= UNLOCKED_UP_TO}
              />
            ))}
          </View>

          {/* Merge guide */}
          <View style={{
            marginTop: 20,
            backgroundColor: '#78350F',
            borderRadius: 18, padding: 16,
            borderWidth: 2, borderColor: '#92400E',
          }}>
            <Text style={{
              color: '#FCD34D', fontWeight: '800', fontSize: 14,
              textAlign: 'center', marginBottom: 12,
            }}>
              MERGE GUIDE
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              {/* Source */}
              <View style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: mergeExample.bgColor,
                borderWidth: 2, borderColor: mergeExample.color,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 24 }}>{mergeExample.emoji}</Text>
              </View>
              <Text style={{ color: '#FCD34D', fontSize: 20, fontWeight: '900' }}>+</Text>
              <View style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: mergeExample.bgColor,
                borderWidth: 2, borderColor: mergeExample.color,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 24 }}>{mergeExample.emoji}</Text>
              </View>
              <Text style={{ color: '#FCD34D', fontSize: 20, fontWeight: '900' }}>=</Text>
              {/* Result */}
              <View style={{
                width: 60, height: 60, borderRadius: 30,
                backgroundColor: mergeResult.bgColor,
                borderWidth: 2.5, borderColor: mergeResult.color,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: mergeResult.glowColor,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.9, shadowRadius: 10,
              }}>
                <Text style={{ fontSize: 28 }}>{mergeResult.emoji}</Text>
              </View>
            </View>
            <Text style={{ color: '#FCD34D', textAlign: 'center', fontSize: 12, marginTop: 10, fontWeight: '600' }}>
              2× {mergeExample.name} → {mergeResult.name}
            </Text>
          </View>
        </ScrollView>

        {/* Bottom nav */}
        <View style={{
          flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1A0A3E',
          backgroundColor: '#0A0118',
        }}>
          {[
            { emoji: '🏪', label: 'SHOP', route: '/(app)/shop' },
            { emoji: '📚', label: 'COLLECTION', route: null, active: true },
            { emoji: '🏠', label: 'HOME', route: '/(app)/home' },
            { emoji: '🎁', label: 'EVENT', route: '/(app)/daily-rewards' },
            { emoji: '⚙️', label: 'SETTING', route: '/(app)/settings' },
          ].map(item => (
            <Pressable
              key={item.label}
              onPress={() => item.route ? router.push(item.route as never) : null}
              style={{
                flex: 1, alignItems: 'center', paddingVertical: 10,
                borderTopWidth: item.active ? 2 : 0,
                borderTopColor: '#7C3AED',
              }}
            >
              <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              <Text style={{
                fontSize: 8, fontWeight: '700', marginTop: 3,
                color: item.active ? '#C084FC' : '#6B4E9E',
              }}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}
