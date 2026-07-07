import React, { useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { SHOP_ITEMS } from '../../lib/gameData';

const TABS = ['Boosters', 'Coins', 'Gems'] as const;
type Tab = typeof TABS[number];

function ShopCard({ item }: { item: typeof SHOP_ITEMS[0] }) {
  const [bought, setBought] = useState(false);
  return (
    <View style={{
      backgroundColor: '#fff', borderRadius: 20, padding: 16,
      marginHorizontal: 16, marginBottom: 12,
      flexDirection: 'row', alignItems: 'center', gap: 14,
      shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1, shadowRadius: 8,
      borderWidth: 2, borderColor: '#EDE9FE',
    }}>
      {item.badge ? (
        <View style={{
          position: 'absolute', top: -8, right: 12,
          backgroundColor: '#EF4444', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2,
          borderWidth: 2, borderColor: '#fff',
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{item.badge}</Text>
        </View>
      ) : null}
      {/* Icon */}
      <View style={{
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#EDE9FE',
      }}>
        <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
      </View>
      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '900', color: '#1E1B4B' }}>{item.name}</Text>
        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{item.description}</Text>
      </View>
      {/* Buy button */}
      <Pressable
        onPress={() => setBought(true)}
        style={{
          backgroundColor: bought ? '#22C55E' : '#8B5CF6',
          borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8,
          alignItems: 'center', minWidth: 70,
        }}
      >
        {bought ? (
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '900' }}>✓ Got it</Text>
        ) : (
          <>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>
              {item.price === 0 ? 'FREE' : item.price.toLocaleString()}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10 }}>
              {item.price === 0 ? '📺 Ad' : item.currency === 'gems' ? '💎 gems' : '🪙 coins'}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

export default function ShopScreen() {
  const [tab, setTab] = useState<Tab>('Boosters');
  const filtered = SHOP_ITEMS.filter(i =>
    tab === 'Boosters' ? i.type === 'booster'
    : tab === 'Coins' ? i.type === 'coins'
    : i.type === 'gems'
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFBEB' }}>
      <StatusBar style="dark" backgroundColor="#FFFBEB" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 16, paddingVertical: 12, gap: 10,
        }}>
          <Pressable onPress={() => router.back()} style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center',
            borderWidth: 1.5, borderColor: '#FCD34D',
          }}>
            <Text style={{ fontSize: 16 }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#1E1B4B', flex: 1 }}>🏪 Shop</Text>
          <View style={{
            flexDirection: 'row', gap: 8, backgroundColor: '#fff',
            borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6,
            borderWidth: 1.5, borderColor: '#FCD34D',
          }}>
            <Text style={{ fontSize: 14 }}>🪙</Text>
            <Text style={{ fontWeight: '800', color: '#B45309', fontSize: 14 }}>1,000</Text>
            <Text style={{ fontSize: 14 }}>💎</Text>
            <Text style={{ fontWeight: '800', color: '#5B21B6', fontSize: 14 }}>120</Text>
          </View>
        </View>

        {/* Featured banner */}
        <View style={{
          marginHorizontal: 16, marginBottom: 14,
          backgroundColor: '#8B5CF6', borderRadius: 20, padding: 16,
          flexDirection: 'row', alignItems: 'center', gap: 12,
        }}>
          <Text style={{ fontSize: 40 }}>🎁</Text>
          <View>
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>Welcome Bundle!</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>3× Bombs + 500 Coins</Text>
          </View>
          <Pressable onPress={() => {}} style={{
            marginLeft: 'auto',
            backgroundColor: '#FCD34D', borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 8,
          }}>
            <Text style={{ color: '#78350F', fontWeight: '900', fontSize: 13 }}>Free!</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={{
          flexDirection: 'row', marginHorizontal: 16, marginBottom: 14,
          backgroundColor: '#FEF3C7', borderRadius: 16, padding: 4,
        }}>
          {TABS.map(t => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center',
                backgroundColor: tab === t ? '#F59E0B' : 'transparent',
              }}
            >
              <Text style={{
                fontWeight: '800', fontSize: 13,
                color: tab === t ? '#fff' : '#B45309',
              }}>{t}</Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => <ShopCard item={item} />}
        />
      </SafeAreaView>
    </View>
  );
}
