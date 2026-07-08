// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

function SettingRow({ icon, label, value, onToggle, type = 'toggle', sublabel }: {
  icon:string; label:string; value?:boolean; onToggle?:(v:boolean)=>void; type?:'toggle'|'arrow'|'lang'; sublabel?:string;
}) {
  return (
    <Pressable onPress={type==='arrow'||type==='lang' ? ()=>{} : undefined}>
      <LinearGradient colors={['rgba(255,255,255,0.07)','rgba(255,255,255,0.03)']} style={styles.row}>
        <View style={styles.rowIcon}>
          <Text style={{ fontSize: 22 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.rowLabel}>{label}</Text>
          {sublabel && <Text style={styles.rowSub}>{sublabel}</Text>}
        </View>
        {type === 'toggle' && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false:'rgba(255,255,255,0.15)', true:'#7C3AED' }}
            thumbColor={value ? '#A78BFA' : '#6B7280'}
            style={{ transform:[{scaleX:1.1},{scaleY:1.1}] }}
          />
        )}
        {(type === 'arrow' || type === 'lang') && (
          <Text style={{ color:'rgba(255,255,255,0.4)', fontSize:18 }}>›</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHead}>{title}</Text>;
}

export default function SettingsScreen() {
  const [music,   setMusic]   = useState(true);
  const [sfx,     setSfx]     = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [notifs,  setNotifs]  = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0520','#1a0a45','#0d0830']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top','bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ color:'#fff', fontSize:18, fontWeight:'900' }}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>⚙️ SETTINGS</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={{ padding:14, paddingBottom:40, gap:4 }} contentInsetAdjustmentBehavior="automatic">
          {/* Player card */}
          <LinearGradient colors={['rgba(124,58,237,0.3)','rgba(124,58,237,0.1)']} style={styles.playerCard}>
            <View style={styles.playerAvatar}>
              <Text style={{ fontSize: 32 }}>🐉</Text>
            </View>
            <View style={{ flex:1, marginLeft:14 }}>
              <Text style={{ color:'#fff', fontWeight:'900', fontSize:16 }}>Dragon Master</Text>
              <Text style={{ color:'rgba(255,255,255,0.55)', fontSize:12 }}>Level 18 · 12,450 pts</Text>
              <View style={{ flexDirection:'row', gap:8, marginTop:6 }}>
                <View style={styles.statBadge}><Text style={styles.statBadgeTxt}>🪙 1,560</Text></View>
                <View style={styles.statBadge}><Text style={styles.statBadgeTxt}>💎 260</Text></View>
              </View>
            </View>
          </LinearGradient>

          <SectionHeader title="🎵 AUDIO" />
          <SettingRow icon="🎵" label="Music"   value={music}   onToggle={setMusic}   sublabel="Background music" />
          <SettingRow icon="🔊" label="Sound FX" value={sfx}    onToggle={setSfx}     sublabel="Merge & game sounds" />

          <SectionHeader title="📳 FEEDBACK" />
          <SettingRow icon="📳" label="Vibration"      value={vibrate} onToggle={setVibrate} sublabel="Haptic feedback" />
          <SettingRow icon="🔔" label="Notifications"  value={notifs}  onToggle={setNotifs}  sublabel="Daily rewards & events" />

          <SectionHeader title="🌍 GENERAL" />
          <SettingRow icon="🌍" label="Language"      type="lang" sublabel="English" />
          <SettingRow icon="🔒" label="Privacy Policy" type="arrow" />
          <SettingRow icon="📄" label="Terms of Service" type="arrow" />
          <SettingRow icon="💬" label="Support"        type="arrow" sublabel="Get help" />
          <SettingRow icon="🔄" label="Restore Purchase" type="arrow" />

          <SectionHeader title="ℹ️ INFO" />
          <LinearGradient colors={['rgba(255,255,255,0.07)','rgba(255,255,255,0.03)']} style={[styles.row, { justifyContent:'center' }]}>
            <Text style={{ color:'rgba(255,255,255,0.4)', fontSize:12, textAlign:'center' }}>
              Dragon Merge Kingdom v1.0.0{'\n'}Made with ❤️
            </Text>
          </LinearGradient>

          {/* Danger zone */}
          <Pressable style={{ marginTop:16 }} onPress={() => {}}>
            <LinearGradient colors={['rgba(239,68,68,0.15)','rgba(239,68,68,0.05)']} style={[styles.row, { borderColor:'rgba(239,68,68,0.4)' }]}>
              <Text style={{ fontSize:20 }}>🗑️</Text>
              <Text style={{ color:'#EF4444', fontWeight:'700', fontSize:14, marginLeft:12 }}>Reset All Data</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:14, paddingVertical:10 },
  backBtn: { width:36,height:36,borderRadius:12,backgroundColor:'rgba(255,255,255,0.12)',alignItems:'center',justifyContent:'center' },
  headerTitle: { color:'#FFD700', fontWeight:'900', fontSize:18, letterSpacing:2 },
  playerCard: { borderRadius:20, padding:16, flexDirection:'row', alignItems:'center', borderWidth:1.5, borderColor:'rgba(167,139,250,0.3)', marginBottom:8 },
  playerAvatar: { width:64, height:64, borderRadius:32, backgroundColor:'rgba(124,58,237,0.3)', alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:'rgba(167,139,250,0.5)' },
  statBadge: { backgroundColor:'rgba(255,255,255,0.12)', borderRadius:12, paddingHorizontal:10, paddingVertical:4 },
  statBadgeTxt: { color:'#fff', fontSize:11, fontWeight:'700' },
  sectionHead: { color:'rgba(255,255,255,0.45)', fontSize:10, fontWeight:'900', letterSpacing:1.5, marginTop:14, marginBottom:6, paddingLeft:4 },
  row: { borderRadius:16, padding:14, flexDirection:'row', alignItems:'center', marginBottom:6, borderWidth:1.5, borderColor:'rgba(255,255,255,0.1)' },
  rowIcon: { width:40, height:40, borderRadius:12, backgroundColor:'rgba(255,255,255,0.1)', alignItems:'center', justifyContent:'center' },
  rowLabel: { color:'#fff', fontWeight:'700', fontSize:14 },
  rowSub: { color:'rgba(255,255,255,0.45)', fontSize:11, marginTop:2 },
});
