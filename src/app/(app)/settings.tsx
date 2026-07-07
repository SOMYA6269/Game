import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface ToggleRowProps {
  emoji: string; label: string; sub?: string;
  value: boolean; onToggle: (v: boolean) => void;
  color?: string;
}
function ToggleRow({ emoji, label, sub, value, onToggle, color = '#8B5CF6' }: ToggleRowProps) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: '#fff', borderRadius: 16, padding: 14,
      marginBottom: 8, gap: 12,
      borderWidth: 1.5, borderColor: '#EDE9FE',
    }}>
      <View style={{
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '800', color: '#1E1B4B', fontSize: 14 }}>{label}</Text>
        {sub ? <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 1 }}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E5E7EB', true: color }}
        thumbColor="#fff"
      />
    </View>
  );
}

interface NavRowProps { emoji: string; label: string; sub?: string; onPress: () => void; color?: string; }
function NavRow({ emoji, label, sub, onPress, color = '#8B5CF6' }: NavRowProps) {
  return (
    <Pressable onPress={onPress} style={{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: '#fff', borderRadius: 16, padding: 14,
      marginBottom: 8, gap: 12,
      borderWidth: 1.5, borderColor: '#EDE9FE',
    }}>
      <View style={{
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '800', color: '#1E1B4B', fontSize: 14 }}>{label}</Text>
        {sub ? <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 1 }}>{sub}</Text> : null}
      </View>
      <Text style={{ fontSize: 18, color: '#9CA3AF' }}>›</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [music, setMusic] = useState(true);
  const [sfx, setSfx] = useState(true);
  const [haptic, setHaptic] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [particles, setParticles] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F3FF' }}>
      <StatusBar style="dark" backgroundColor="#F5F3FF" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 16, paddingVertical: 12, gap: 10,
        }}>
          <Pressable onPress={() => router.back()} style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center',
            borderWidth: 1.5, borderColor: '#C4B5FD',
          }}>
            <Text style={{ fontSize: 16 }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#1E1B4B', flex: 1 }}>⚙️ Settings</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>

          {/* Profile card */}
          <View style={{
            backgroundColor: '#8B5CF6', borderRadius: 22, padding: 20,
            flexDirection: 'row', alignItems: 'center', gap: 14,
            marginBottom: 20,
          }}>
            <View style={{
              width: 64, height: 64, borderRadius: 32,
              backgroundColor: 'rgba(255,255,255,0.25)',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 3, borderColor: '#fff',
            }}>
              <Text style={{ fontSize: 32 }}>🐲</Text>
            </View>
            <View>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>Dragon Master</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>🏆 Best: 2,458 pts</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>🔥 Streak: 4 days</Text>
            </View>
          </View>

          {/* Audio section */}
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#5B21B6', marginBottom: 8, letterSpacing: 0.5 }}>
            🔊 AUDIO
          </Text>
          <ToggleRow emoji="🎵" label="Background Music" sub="Relaxing fantasy theme" value={music} onToggle={setMusic} color="#8B5CF6" />
          <ToggleRow emoji="🔔" label="Sound Effects" sub="Merge, coin, explosion sounds" value={sfx} onToggle={setSfx} color="#3B82F6" />
          <ToggleRow emoji="📳" label="Haptic Feedback" sub="Vibration on merge and drop" value={haptic} onToggle={setHaptic} color="#10B981" />

          {/* Gameplay section */}
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#5B21B6', marginTop: 12, marginBottom: 8, letterSpacing: 0.5 }}>
            🎮 GAMEPLAY
          </Text>
          <ToggleRow emoji="✨" label="Particle Effects" sub="Disable for better performance" value={particles} onToggle={setParticles} color="#F59E0B" />
          <ToggleRow emoji="🔔" label="Daily Reminder" sub="Notify me for daily rewards" value={notifications} onToggle={setNotifications} color="#EF4444" />

          {/* Navigation section */}
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#5B21B6', marginTop: 12, marginBottom: 8, letterSpacing: 0.5 }}>
            🗺️ NAVIGATE
          </Text>
          <NavRow emoji="🗺️" label="World Map" sub="8 themed kingdoms" onPress={() => router.push('/(app)/world-map' as never)} color="#3B82F6" />
          <NavRow emoji="📚" label="Dragon Collection" sub="Collect all 11 dragons" onPress={() => router.push('/(app)/collection' as never)} color="#8B5CF6" />
          <NavRow emoji="🏪" label="Shop" sub="Boosters and currency" onPress={() => router.push('/(app)/shop' as never)} color="#F59E0B" />
          <NavRow emoji="📅" label="Daily Rewards" sub="Claim your daily gift" onPress={() => router.push('/(app)/daily-rewards' as never)} color="#10B981" />

          {/* About section */}
          <Text style={{ fontSize: 13, fontWeight: '800', color: '#5B21B6', marginTop: 12, marginBottom: 8, letterSpacing: 0.5 }}>
            ℹ️ ABOUT
          </Text>
          <NavRow emoji="⭐" label="Rate Us" sub="Enjoying the game? Leave a review!" onPress={() => {}} color="#F59E0B" />
          <NavRow emoji="🔒" label="Privacy Policy" onPress={() => {}} color="#6B7280" />
          <NavRow emoji="📄" label="Terms of Service" onPress={() => {}} color="#6B7280" />

          {/* Version */}
          <View style={{ alignItems: 'center', marginTop: 16 }}>
            <Text style={{ fontSize: 42 }}>🐲</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12, fontWeight: '700' }}>Dragon Merge Kingdom v1.0.0</Text>
            <Text style={{ color: '#C4B5FD', fontSize: 11, marginTop: 2 }}>Made with ❤️</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
