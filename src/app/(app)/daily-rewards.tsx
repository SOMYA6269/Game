// @ts-nocheck
/**
 * DAILY REWARDS SCREEN — Premium treasure-calendar redesign
 * - Each day = small treasure chest / gift box tile with 3D bevel depth
 * - Current day: animated glow pulse ring
 * - Completed days: satisfying checkmark stamp effect
 * - Day 7: visually oversized "jackpot" tile
 * - Achievements tab: rarity-styled cards
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { DAILY_REWARDS } from '../../lib/gameData';

const ACHIEVEMENTS = [
  { id:1, emoji:'🥚', name:'First Merge',   desc:'Merge 2 dragon eggs',        done:true,  rarity:'Common' },
  { id:2, emoji:'🐲', name:'Baby Dragon',   desc:'Reach level 3 fire dragon',  done:true,  rarity:'Uncommon' },
  { id:3, emoji:'💰', name:'Coin Hoarder',  desc:'Collect 1,000 coins',        done:false, rarity:'Rare' },
  { id:4, emoji:'⚡', name:'Combo Master',  desc:'Achieve ×5 combo',           done:false, rarity:'Rare' },
  { id:5, emoji:'🏆', name:'High Scorer',   desc:'Score 5,000 points',         done:false, rarity:'Epic' },
  { id:6, emoji:'🌈', name:'Rainbow Power', desc:'Unlock Rainbow Dragon',      done:false, rarity:'Legendary' },
];

const RARITY_COLORS: Record<string, string> = {
  Common:'#9CA3AF', Uncommon:'#10B981', Rare:'#3B82F6', Epic:'#8B5CF6', Legendary:'#F59E0B',
};

const CURRENT_DAY = 4;

// ── Glow pulse ring for current day ──────────────────────────────────────────
function GlowRing({ color }: { color: string }) {
  const sc = useRef(new Animated.Value(1)).current;
  const op = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(sc, { toValue: 1.18, duration: 800, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(sc, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.8, duration: 0, useNativeDriver: true }),
      ]),
    ]));
    loop.start();
    return () => loop.stop();
  }, [sc, op]);
  return (
    <Animated.View style={{
      position: 'absolute', inset: -6, borderRadius: 24,
      borderWidth: 3, borderColor: color, opacity: op, transform: [{ scale: sc }],
    }} />
  );
}

// ── Day reward tile ───────────────────────────────────────────────────────────
function DayTile({
  reward, isClaimed, isToday, isBig, onClaim,
}: {
  reward: typeof DAILY_REWARDS[0];
  isClaimed: boolean; isToday: boolean; isBig: boolean; onClaim: () => void;
}) {
  const sc = useRef(new Animated.Value(1)).current;
  const stampOp = useRef(new Animated.Value(isClaimed ? 1 : 0)).current;
  const stampSc = useRef(new Animated.Value(isClaimed ? 1 : 2)).current;

  const handlePress = () => {
    if (!isToday || isClaimed) return;
    // Stamp animation on claim
    Animated.parallel([
      Animated.spring(sc, { toValue: 0.88, tension: 200, friction: 4, useNativeDriver: true }),
      Animated.spring(stampOp, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      Animated.spring(stampSc, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
    ]).start(() => {
      Animated.spring(sc, { toValue: 1, tension: 200, friction: 4, useNativeDriver: true }).start();
      onClaim();
    });
  };

  const tileColor = isClaimed ? ['#064E3B','#065F46'] : isToday ? ['#78350F','#92400E'] : ['#1E1B4B','#2D2B62'];
  const borderColor = isClaimed ? '#10B981' : isToday ? '#F59E0B' : 'rgba(255,255,255,0.15)';
  const size = isBig ? 90 : 64;

  return (
    <Pressable onPress={handlePress} style={{ width: isBig ? '100%' : undefined }}>
      <Animated.View style={{ transform: [{ scale: sc }] }}>
        {/* 3D bevel layers */}
        <View style={[styles.tileBase, { width: size, height: size + (isBig ? 20 : 10), backgroundColor: isClaimed ? '#022c20' : '#0f0d30' }]} />
        <View style={[styles.tileMid, { width: size, height: size + (isBig ? 14 : 6), backgroundColor: isClaimed ? '#043a28' : '#16134a' }]} />
        <LinearGradient
          colors={tileColor}
          style={[styles.tileFace, {
            width: size, height: size,
            borderColor, borderWidth: isBig ? 3 : 2,
          }]}
        >
          {/* Top gloss */}
          <View style={styles.tileGloss} />
          {/* Glow ring for today */}
          {isToday && !isClaimed && <GlowRing color="#F59E0B" />}

          {/* Day label */}
          <Text style={[styles.tileDayTxt, isBig && { fontSize: 10 }]}>
            Day {reward.day}
          </Text>
          {/* Icon */}
          <Text style={[styles.tileIcon, isBig && { fontSize: 36 }]}>{reward.emoji}</Text>
          {/* Label */}
          {isBig && <Text style={styles.tileLabel}>{reward.label}</Text>}

          {/* Claimed stamp overlay */}
          {isClaimed && (
            <Animated.View style={[styles.stamp, { opacity: stampOp, transform: [{ scale: stampSc }, { rotate: '-12deg' }] }]}>
              <Text style={styles.stampTxt}>✓</Text>
            </Animated.View>
          )}
          {/* TODAY badge */}
          {isToday && !isClaimed && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayTxt}>TODAY</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

// ── SCREEN ────────────────────────────────────────────────────────────────────
export default function DailyRewardsScreen() {
  const [claimed, setClaimed] = useState<number[]>([1, 2, 3]);
  const [tab, setTab] = useState<'daily' | 'achieve'>('daily');

  const SPIN_PRIZES = ['🪙 200', '💎 5', '🪙 500', '❄️ Freeze', '💣 Bomb', '🌈 Rainbow', '🪙 100', '💎 10'];
  const spinAngle = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true); setSpinResult(null);
    Animated.timing(spinAngle, { toValue: 6, duration: 2000, useNativeDriver: true })
      .start(() => {
        spinAngle.setValue(0);
        setSpinning(false);
        setSpinResult(SPIN_PRIZES[Math.floor(Math.random() * SPIN_PRIZES.length)]);
      });
  };
  const spinRotate = spinAngle.interpolate({ inputRange: [0, 6], outputRange: ['0deg', '2160deg'] });

  // Separate day 7 (jackpot) from days 1–6
  const regularDays = DAILY_REWARDS.filter(r => r.day < 7);
  const jackpot = DAILY_REWARDS.find(r => r.day === 7);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient colors={['#050218','#0d0828','#060312']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>🎁  REWARDS</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          {(['daily', 'achieve'] as const).map(t => (
            <Pressable key={t} onPress={() => setTab(t)} style={{ flex: 1 }}>
              <LinearGradient
                colors={tab === t ? ['#7C3AED','#5B21B6'] : ['rgba(255,255,255,0.06)','rgba(255,255,255,0.02)']}
                style={[styles.tabBtn, tab === t && { borderColor: '#A78BFA' }]}
              >
                {tab === t && <View style={styles.tabGloss} />}
                <Text style={[styles.tabTxt, tab === t && { color: '#fff' }]}>
                  {t === 'daily' ? '📅  Daily' : '🏆  Achievements'}
                </Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 32 }}>
          {tab === 'daily' ? (
            <>
              {/* Streak card */}
              <LinearGradient colors={['#3730A3','#1E1B4B']} style={styles.streakCard}>
                <View style={styles.streakGloss} />
                <Text style={{ fontSize: 40 }}>🔥</Text>
                <View>
                  <Text style={styles.streakTitle}>Day {CURRENT_DAY} Streak!</Text>
                  <Text style={styles.streakSub}>Come back tomorrow for Day {CURRENT_DAY + 1} 🐉</Text>
                </View>
                <View style={styles.streakBadge}>
                  <Text style={styles.streakBadgeTxt}>+50{'\n'}coins</Text>
                </View>
              </LinearGradient>

              {/* 6 regular day tiles */}
              <View style={styles.tilesGrid}>
                {regularDays.map(reward => (
                  <DayTile
                    key={reward.day}
                    reward={reward}
                    isClaimed={claimed.includes(reward.day)}
                    isToday={reward.day === CURRENT_DAY}
                    isBig={false}
                    onClaim={() => setClaimed(p => [...p, reward.day])}
                  />
                ))}
              </View>

              {/* Day 7 jackpot — full-width oversized highlighted tile */}
              {jackpot && (
                <View style={styles.jackpotWrap}>
                  <LinearGradient colors={['rgba(255,215,0,0.18)','transparent']} style={styles.jackpotGlow} />
                  <Text style={styles.jackpotLabel}>⭐ JACKPOT DAY ⭐</Text>
                  <View style={{ alignItems: 'center' }}>
                    <DayTile
                      reward={jackpot}
                      isClaimed={claimed.includes(7)}
                      isToday={CURRENT_DAY === 7}
                      isBig
                      onClaim={() => setClaimed(p => [...p, 7])}
                    />
                  </View>
                  <Text style={styles.jackpotSub}>{jackpot.label}</Text>
                </View>
              )}

              {/* Lucky Spin */}
              <LinearGradient colors={['#78350F','#451A03']} style={styles.spinCard}>
                <View style={styles.spinGloss} />
                <Text style={styles.spinTitle}>🎡  Lucky Spin</Text>
                <Animated.Text style={[styles.spinWheel, { transform: [{ rotate: spinRotate }] }]}>🎡</Animated.Text>
                {spinResult && (
                  <LinearGradient colors={['#064E3B','#065F46']} style={styles.spinResult}>
                    <Text style={styles.spinResultTxt}>🎉 You won: {spinResult}!</Text>
                  </LinearGradient>
                )}
                <Pressable onPress={handleSpin} disabled={spinning}>
                  <LinearGradient
                    colors={spinning ? ['#4B5563','#374151'] : ['#F59E0B','#D97706']}
                    style={styles.spinBtn}
                  >
                    <View style={styles.spinBtnGloss} />
                    <Text style={styles.spinBtnTxt}>{spinning ? 'Spinning…' : '🎰  SPIN FREE'}</Text>
                  </LinearGradient>
                </Pressable>
              </LinearGradient>
            </>
          ) : (
            <View style={{ gap: 10, marginTop: 4 }}>
              {ACHIEVEMENTS.map(a => {
                const rc = RARITY_COLORS[a.rarity] ?? '#9CA3AF';
                return (
                  <View key={a.id} style={[styles.achieveCard, { borderColor: rc + (a.done ? 'CC' : '55') }]}>
                    <LinearGradient colors={[rc + '22', 'rgba(0,0,0,0)']} style={styles.achieveGradient} />
                    <View style={[styles.achieveIcon, { backgroundColor: rc + '33', borderColor: rc + '88' }]}>
                      <Text style={{ fontSize: 26 }}>{a.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.achieveName, !a.done && { opacity: 0.55 }]}>{a.name}</Text>
                      <Text style={styles.achieveDesc}>{a.desc}</Text>
                      <View style={[styles.achieveRarity, { backgroundColor: rc + '33' }]}>
                        <Text style={[styles.achieveRarityTxt, { color: rc }]}>{a.rarity}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 22 }}>{a.done ? '✅' : '🔒'}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:14, paddingVertical:10 },
  backBtn: { width:36, height:36, borderRadius:12, backgroundColor:'rgba(255,255,255,0.12)', alignItems:'center', justifyContent:'center' },
  headerTitle: { color:'#FFD700', fontWeight:'900', fontSize:17, letterSpacing:1 },
  tabRow: { flexDirection:'row', marginHorizontal:14, marginBottom:14, gap:8 },
  tabBtn: { borderRadius:16, paddingVertical:10, alignItems:'center', borderWidth:2, borderColor:'rgba(255,255,255,0.1)', overflow:'hidden' },
  tabGloss: { position:'absolute', top:3, left:'10%', right:'10%', height:10, borderRadius:6, backgroundColor:'rgba(255,255,255,0.2)' },
  tabTxt: { color:'rgba(255,255,255,0.55)', fontWeight:'900', fontSize:13 },
  // Streak
  streakCard: { borderRadius:24, padding:16, flexDirection:'row', alignItems:'center', gap:14, marginBottom:16, overflow:'hidden', borderWidth:2, borderColor:'rgba(255,255,255,0.15)' },
  streakGloss: { position:'absolute', top:4, left:'8%', right:'8%', height:12, borderRadius:7, backgroundColor:'rgba(255,255,255,0.18)' },
  streakTitle: { color:'#fff', fontWeight:'900', fontSize:18 },
  streakSub: { color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:2 },
  streakBadge: { backgroundColor:'rgba(255,215,0,0.2)', borderRadius:12, paddingHorizontal:10, paddingVertical:6, borderWidth:1.5, borderColor:'rgba(255,215,0,0.5)', alignItems:'center' },
  streakBadgeTxt: { color:'#FFD700', fontWeight:'900', fontSize:12, textAlign:'center' },
  // Day tiles grid (6 regular days)
  tilesGrid: { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:14, justifyContent:'center' },
  // Tile
  tileBase: { position:'absolute', borderRadius:18, bottom:0 },
  tileMid:  { position:'absolute', borderRadius:18, bottom:4 },
  tileFace: { borderRadius:18, alignItems:'center', justifyContent:'center', gap:2, overflow:'hidden', paddingBottom:4 },
  tileGloss: { position:'absolute', top:4, left:'12%', right:'12%', height:10, borderRadius:6, backgroundColor:'rgba(255,255,255,0.22)' },
  tileDayTxt: { color:'rgba(255,255,255,0.65)', fontSize:8, fontWeight:'900', letterSpacing:0.5, marginTop:6 },
  tileIcon: { fontSize:26 },
  tileLabel: { color:'#FFD700', fontWeight:'900', fontSize:11, textAlign:'center', paddingHorizontal:8 },
  stamp: { position:'absolute', inset:0, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(6,78,59,0.7)', borderRadius:18 },
  stampTxt: { color:'#10B981', fontSize:36, fontWeight:'900' },
  todayBadge: { position:'absolute', bottom:4, backgroundColor:'#F59E0B', borderRadius:8, paddingHorizontal:6, paddingVertical:2 },
  todayTxt: { color:'#fff', fontSize:8, fontWeight:'900' },
  // Jackpot
  jackpotWrap: { marginBottom:16, borderRadius:24, overflow:'hidden', borderWidth:2.5, borderColor:'rgba(255,215,0,0.6)', padding:14, alignItems:'center', gap:8, backgroundColor:'rgba(0,0,0,0.4)' },
  jackpotGlow: { position:'absolute', inset:0 },
  jackpotLabel: { color:'#FFD700', fontWeight:'900', fontSize:15, letterSpacing:2 },
  jackpotSub: { color:'rgba(255,255,255,0.7)', fontSize:12, textAlign:'center' },
  // Spin
  spinCard: { borderRadius:24, padding:20, alignItems:'center', gap:12, overflow:'hidden', borderWidth:2, borderColor:'rgba(255,140,0,0.5)', marginBottom:8 },
  spinGloss: { position:'absolute', top:4, left:'10%', right:'10%', height:12, borderRadius:7, backgroundColor:'rgba(255,255,255,0.2)' },
  spinTitle: { color:'#fff', fontWeight:'900', fontSize:18 },
  spinWheel: { fontSize:64 },
  spinResult: { borderRadius:14, paddingHorizontal:18, paddingVertical:10, borderWidth:2, borderColor:'#10B981' },
  spinResultTxt: { color:'#10B981', fontWeight:'900', fontSize:15 },
  spinBtn: { borderRadius:20, paddingVertical:14, paddingHorizontal:36, overflow:'hidden' },
  spinBtnGloss: { position:'absolute', top:4, left:'15%', right:'15%', height:10, borderRadius:6, backgroundColor:'rgba(255,255,255,0.3)' },
  spinBtnTxt: { color:'#fff', fontWeight:'900', fontSize:16 },
  // Achievements
  achieveCard: { borderRadius:20, padding:14, flexDirection:'row', alignItems:'center', gap:12, borderWidth:2, backgroundColor:'rgba(0,0,0,0.45)', overflow:'hidden' },
  achieveGradient: { position:'absolute', inset:0 },
  achieveIcon: { width:54, height:54, borderRadius:27, alignItems:'center', justifyContent:'center', borderWidth:2 },
  achieveName: { fontWeight:'900', color:'#fff', fontSize:14 },
  achieveDesc: { color:'rgba(255,255,255,0.55)', fontSize:12, marginTop:2 },
  achieveRarity: { marginTop:4, borderRadius:8, paddingHorizontal:8, paddingVertical:2, alignSelf:'flex-start' },
  achieveRarityTxt: { fontSize:9, fontWeight:'900', letterSpacing:0.5 },
});
