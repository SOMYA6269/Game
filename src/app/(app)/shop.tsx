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
import { ArrowLeft } from 'lucide-react-native';
import { SHOP_ITEMS } from '@/lib/gameData';
import type { ShopItem } from '@/lib/gameTypes';

function ShopCard({ item, onBuy }: { item: ShopItem; onBuy: () => void }) {
  return (
    <Pressable
      onPress={onBuy}
      style={{
        backgroundColor: '#1A0A3E',
        borderRadius: 18, padding: 16,
        borderWidth: 2, borderColor: '#2D1060',
        alignItems: 'center',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3, shadowRadius: 6,
        marginBottom: 2,
      }}
    >
      <View style={{
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: '#0F0520',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#3B1A7A',
        marginBottom: 10,
      }}>
        <Text style={{ fontSize: 32 }}>{item.emoji}</Text>
      </View>
      <Text style={{ color: '#E9D5FF', fontWeight: '800', fontSize: 14, marginBottom: 4 }}>
        {item.name}
      </Text>
      <Text style={{ color: '#9D7EC9', fontSize: 11, marginBottom: 12, textAlign: 'center' }}>
        {item.description}
      </Text>
      <View style={{
        backgroundColor: item.currency === 'gems' ? '#1E3A8A' : '#78350F',
        borderRadius: 12, paddingHorizontal: 20, paddingVertical: 8,
        flexDirection: 'row', gap: 5, alignItems: 'center',
      }}>
        <Text style={{ fontSize: 14 }}>{item.currency === 'gems' ? '💎' : '🪙'}</Text>
        <Text style={{
          color: item.currency === 'gems' ? '#60A5FA' : '#FBBF24',
          fontWeight: '900', fontSize: 16,
        }}>
          {item.price === 0 ? 'FREE' : item.price}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ShopScreen() {
  const [coins, setCoins] = useState(1000);
  const [gems, setGems] = useState(120);
  const [purchased, setPurchased] = useState<string | null>(null);

  const handleBuy = (item: ShopItem) => {
    if (item.currency === 'coins' && coins >= item.price) {
      setCoins(c => c - item.price);
      setPurchased(item.id);
      setTimeout(() => setPurchased(null), 2000);
    } else if (item.currency === 'gems' && item.price === 0) {
      setGems(g => g + 50);
      setPurchased(item.id);
      setTimeout(() => setPurchased(null), 2000);
    }
  };

  const boosters = SHOP_ITEMS.filter(i => i.type === 'booster');
  const packs = SHOP_ITEMS.filter(i => i.type === 'pack');

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
            🏪 Shop
          </Text>
          {/* Currency bar */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{
              backgroundColor: '#78350F', borderRadius: 10,
              paddingHorizontal: 8, paddingVertical: 4,
              flexDirection: 'row', gap: 3, alignItems: 'center',
            }}>
              <Text style={{ fontSize: 12 }}>🪙</Text>
              <Text style={{ color: '#FBBF24', fontWeight: '700', fontSize: 12 }}>{coins}</Text>
            </View>
            <View style={{
              backgroundColor: '#1E3A8A', borderRadius: 10,
              paddingHorizontal: 8, paddingVertical: 4,
              flexDirection: 'row', gap: 3, alignItems: 'center',
            }}>
              <Text style={{ fontSize: 12 }}>💎</Text>
              <Text style={{ color: '#60A5FA', fontWeight: '700', fontSize: 12 }}>{gems}</Text>
            </View>
          </View>
        </View>

        {/* Success toast */}
        {purchased && (
          <View style={{
            marginHorizontal: 16, marginBottom: 8,
            backgroundColor: '#14532D', borderRadius: 12,
            padding: 10, borderWidth: 1, borderColor: '#4ADE80',
          }}>
            <Text style={{ color: '#4ADE80', textAlign: 'center', fontWeight: '700', fontSize: 13 }}>
              ✅ Purchase successful!
            </Text>
          </View>
        )}

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {/* Boosters section */}
          <Text style={{ color: '#FBBF24', fontWeight: '800', fontSize: 13, marginBottom: 12, letterSpacing: 1 }}>
            ⚡ BOOSTERS
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
            {boosters.map(item => (
              <View key={item.id} style={{ width: '47%' }}>
                <ShopCard item={item} onBuy={() => handleBuy(item)} />
              </View>
            ))}
          </View>

          {/* Currency packs */}
          <Text style={{ color: '#60A5FA', fontWeight: '800', fontSize: 13, marginBottom: 12, letterSpacing: 1 }}>
            💰 CURRENCY PACKS
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
            {packs.map(item => (
              <View key={item.id} style={{ width: '47%' }}>
                <ShopCard item={item} onBuy={() => handleBuy(item)} />
              </View>
            ))}
          </View>

          {/* Featured offer */}
          <View style={{
            backgroundColor: '#3B0764',
            borderRadius: 20, padding: 20,
            borderWidth: 2, borderColor: '#7C3AED',
            alignItems: 'center',
          }}>
            <View style={{
              position: 'absolute', top: -10, right: 16,
              backgroundColor: '#EF4444', borderRadius: 8,
              paddingHorizontal: 10, paddingVertical: 3,
            }}>
              <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>🔥 LIMITED</Text>
            </View>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>👑</Text>
            <Text style={{ color: '#FBBF24', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>
              Starter Pack
            </Text>
            <Text style={{ color: '#C4B5FD', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
              1000 Coins + 50 Gems + 5× of each Booster
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 14, textDecorationLine: 'line-through' }}>💎 100</Text>
              <View style={{
                backgroundColor: '#7C3AED', borderRadius: 12,
                paddingHorizontal: 20, paddingVertical: 8,
              }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>💎 50</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
