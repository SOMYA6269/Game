import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Volume2, Music, Bell, HelpCircle, Info, ChevronRight } from 'lucide-react-native';

function SettingsRow({
  icon,
  label,
  right,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1A0A3E', borderRadius: 14,
        padding: 16, marginBottom: 8, gap: 14,
      }}
    >
      <View style={{
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#2D1060',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </View>
      <Text style={{ flex: 1, color: '#E9D5FF', fontWeight: '600', fontSize: 15 }}>{label}</Text>
      {right ?? <ChevronRight size={18} color="#6B4E9E" />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [notifsOn, setNotifsOn] = useState(true);

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
            ⚙️ Settings
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {/* App icon + name */}
          <View style={{ alignItems: 'center', marginVertical: 24 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 24,
              backgroundColor: '#3B0764', borderWidth: 3, borderColor: '#7C3AED',
              alignItems: 'center', justifyContent: 'center', marginBottom: 8,
            }}>
              <Text style={{ fontSize: 40 }}>🐲</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Dragon Merge Kingdom</Text>
            <Text style={{ color: '#6B4E9E', fontSize: 12, marginTop: 2 }}>Version 1.0.0</Text>
          </View>

          {/* Audio section */}
          <Text style={{ color: '#9D7EC9', fontWeight: '700', fontSize: 11, marginBottom: 10, letterSpacing: 1 }}>
            AUDIO
          </Text>
          <SettingsRow
            icon={<Volume2 size={18} color="#C084FC" />}
            label="Sound Effects"
            right={
              <Switch
                value={soundOn}
                onValueChange={setSoundOn}
                trackColor={{ false: '#2D1060', true: '#7C3AED' }}
                thumbColor={soundOn ? '#E879F9' : '#6B4E9E'}
              />
            }
          />
          <SettingsRow
            icon={<Music size={18} color="#C084FC" />}
            label="Background Music"
            right={
              <Switch
                value={musicOn}
                onValueChange={setMusicOn}
                trackColor={{ false: '#2D1060', true: '#7C3AED' }}
                thumbColor={musicOn ? '#E879F9' : '#6B4E9E'}
              />
            }
          />

          {/* Notifications */}
          <Text style={{ color: '#9D7EC9', fontWeight: '700', fontSize: 11, marginTop: 16, marginBottom: 10, letterSpacing: 1 }}>
            NOTIFICATIONS
          </Text>
          <SettingsRow
            icon={<Bell size={18} color="#FBBF24" />}
            label="Push Notifications"
            right={
              <Switch
                value={notifsOn}
                onValueChange={setNotifsOn}
                trackColor={{ false: '#2D1060', true: '#7C3AED' }}
                thumbColor={notifsOn ? '#E879F9' : '#6B4E9E'}
              />
            }
          />

          {/* Support */}
          <Text style={{ color: '#9D7EC9', fontWeight: '700', fontSize: 11, marginTop: 16, marginBottom: 10, letterSpacing: 1 }}>
            SUPPORT
          </Text>
          <SettingsRow
            icon={<HelpCircle size={18} color="#38BDF8" />}
            label="How to Play"
            onPress={() => {}}
          />
          <SettingsRow
            icon={<Info size={18} color="#38BDF8" />}
            label="About"
            onPress={() => {}}
          />

          {/* Dragon Evolution Tree */}
          <Text style={{ color: '#9D7EC9', fontWeight: '700', fontSize: 11, marginTop: 16, marginBottom: 10, letterSpacing: 1 }}>
            GAME
          </Text>
          <SettingsRow
            icon={<Text style={{ fontSize: 18 }}>🐉</Text>}
            label="Dragon Evolution Tree"
            onPress={() => router.push('/(app)/evolution-tree' as never)}
          />
          <SettingsRow
            icon={<Text style={{ fontSize: 18 }}>🗺️</Text>}
            label="World Map"
            onPress={() => router.push('/(app)/world-map' as never)}
          />
          <SettingsRow
            icon={<Text style={{ fontSize: 18 }}>📚</Text>}
            label="Collection Book"
            onPress={() => router.push('/(app)/collection' as never)}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
