// @ts-nocheck
/**
 * HOME SCREEN v3 — web-safe rebuild.
 * - No transformOrigin (crashes web)
 * - Castle background image (local asset)
 * - SVG baby dragon mascot (no invalid style props)
 * - Glossy PLAY button
 * - Circular sidebar buttons
 * - Bottom nav
 */
import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, Pressable, Animated, StyleSheet,
  useWindowDimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, {
  Circle, Ellipse, Path, G, Defs, Polygon,
  RadialGradient as SvgRadialGradient, Stop,
} from 'react-native-svg';

// ─── FLOATING MAGIC SPARK ────────────────────────────────────────────────────
function Spark({ x, y, delay, color }: { x: number; y: number; delay: number; color: string }) {
  const op  = useRef(new Animated.Value(0)).current;
  const ty  = useRef(new Animated.Value(0)).current;
  const sc  = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(op, { toValue: 0.9, duration: 700,  useNativeDriver: true }),
        Animated.timing(ty, { toValue: -28, duration: 2200, useNativeDriver: true }),
        Animated.timing(sc, { toValue: 1.1, duration: 2200, useNativeDriver: true }),
      ]),
      Animated.timing(op, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(ty, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(sc, { toValue: 0.3, duration: 0,   useNativeDriver: true }),
      ]),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: y,
      width: 7, height: 7, borderRadius: 4,
      backgroundColor: color, opacity: op,
      transform: [{ translateY: ty }, { scale: sc }],
    }} />
  );
}

const SPARKS = [
  { x: 0.12, y: 0.30, delay: 0,    color: '#FFD700' },
  { x: 0.80, y: 0.40, delay: 500,  color: '#7B1FA2' },
  { x: 0.88, y: 0.65, delay: 900,  color: '#FFCC02' },
  { x: 0.45, y: 0.15, delay: 1400, color: '#FF8FAB' },
  { x: 0.60, y: 0.75, delay: 600,  color: '#A5D6A7' },
];

// ─── DRAGON MASCOT (pure SVG, NO transformOrigin) ────────────────────────────
function DragonMascot({ size }: { size: number }) {
  const s   = size;
  const cx  = s / 2;
  const cy  = s * 0.56;
  const br  = s * 0.26;
  const hr  = s * 0.22;

  const sc      = useRef(new Animated.Value(1)).current;
  const ty      = useRef(new Animated.Value(0)).current;
  const blink   = useRef(new Animated.Value(1)).current;
  // tail: rotate the WHOLE dragon view slightly instead of using transformOrigin
  const tailRot = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(sc, { toValue: 1.04, duration: 1100, useNativeDriver: true }),
      Animated.timing(sc, { toValue: 0.97, duration: 1100, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(ty, { toValue: -8, duration: 1200, useNativeDriver: true }),
      Animated.timing(ty, { toValue: 4,  duration: 1200, useNativeDriver: true }),
    ])).start();
    const doBlink = () => {
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.08, duration: 80, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1,    duration: 80, useNativeDriver: true }),
      ]).start(() => setTimeout(doBlink, 3500 + Math.random() * 1500));
    };
    const t = setTimeout(doBlink, 1200);
    Animated.loop(Animated.sequence([
      Animated.timing(tailRot, { toValue: 12, duration: 900, useNativeDriver: true }),
      Animated.timing(tailRot, { toValue: -8, duration: 900, useNativeDriver: true }),
    ])).start();
    return () => clearTimeout(t);
  }, []);

  // tail rotation expressed as small whole-body tilt — safe on web
  const rotate = tailRot.interpolate({ inputRange: [-12, 12], outputRange: ['-4deg', '4deg'] });

  return (
    <Animated.View style={{
      width: s, height: s,
      transform: [{ scale: sc }, { translateY: ty }, { rotate }],
    }}>
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <Defs>
          <SvgRadialGradient id="body_g" cx="38%" cy="32%" r="65%">
            <Stop offset="0%" stopColor="#A5D6A7" />
            <Stop offset="100%" stopColor="#2E7D32" />
          </SvgRadialGradient>
          <SvgRadialGradient id="belly_g" cx="50%" cy="50%" r="60%">
            <Stop offset="0%" stopColor="#E8F5E9" />
            <Stop offset="100%" stopColor="#C8E6C9" />
          </SvgRadialGradient>
          <SvgRadialGradient id="wing_g" cx="70%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#81C784" />
            <Stop offset="100%" stopColor="#388E3C" />
          </SvgRadialGradient>
        </Defs>

        {/* Ground shadow */}
        <Ellipse cx={cx} cy={s * 0.95} rx={br * 0.8} ry={s * 0.03} fill="#000" opacity={0.15} />

        {/* Tail */}
        <Path
          d={`M${cx + br * 0.72} ${cy + s * 0.1} Q${cx + s * 0.42} ${cy + s * 0.38} ${cx + s * 0.32} ${cy + s * 0.24}`}
          stroke="#2E7D32" strokeWidth={s * 0.075} fill="none" strokeLinecap="round"
        />
        <Polygon
          points={`${cx + s * 0.3},${cy + s * 0.22} ${cx + s * 0.36},${cy + s * 0.14} ${cx + s * 0.38},${cy + s * 0.28}`}
          fill="#FF8F00"
        />

        {/* Wings */}
        <Path d={`M${cx - s * 0.08} ${cy - s * 0.18} Q${cx - s * 0.44} ${cy - s * 0.5} ${cx - s * 0.38} ${cy - s * 0.06}`} fill="url(#wing_g)" opacity={0.88} />
        <Path d={`M${cx + s * 0.08} ${cy - s * 0.18} Q${cx + s * 0.44} ${cy - s * 0.5} ${cx + s * 0.38} ${cy - s * 0.06}`} fill="url(#wing_g)" opacity={0.88} />

        {/* Body */}
        <Circle cx={cx} cy={cy} r={br} fill="url(#body_g)" />
        <Ellipse cx={cx} cy={cy + s * 0.06} rx={br * 0.58} ry={br * 0.52} fill="url(#belly_g)" />

        {/* Spine bumps */}
        {([-0.1, 0, 0.1] as number[]).map((off, i) => (
          <Polygon key={i}
            points={`${cx + off * s},${cy - br * 0.82} ${cx + (off - 0.04) * s},${cy - br * 1.1} ${cx + (off + 0.04) * s},${cy - br * 0.82}`}
            fill="#1B5E20"
          />
        ))}

        {/* Head */}
        <Circle cx={cx} cy={cy - s * 0.28} r={hr} fill="url(#body_g)" />

        {/* Horns */}
        <Polygon points={`${cx - s * 0.1},${cy - s * 0.46} ${cx - s * 0.16},${cy - s * 0.58} ${cx - s * 0.05},${cy - s * 0.47}`} fill="#1B5E20" />
        <Polygon points={`${cx + s * 0.1},${cy - s * 0.46} ${cx + s * 0.16},${cy - s * 0.58} ${cx + s * 0.05},${cy - s * 0.47}`} fill="#1B5E20" />

        {/* Eyes */}
        <Circle cx={cx - s * 0.09} cy={cy - s * 0.29} r={s * 0.055} fill="#1a1a2e" />
        <Circle cx={cx - s * 0.085} cy={cy - s * 0.31} r={s * 0.02}  fill="white" opacity={0.9} />
        <Circle cx={cx + s * 0.09} cy={cy - s * 0.29} r={s * 0.055} fill="#1a1a2e" />
        <Circle cx={cx + s * 0.085} cy={cy - s * 0.31} r={s * 0.02}  fill="white" opacity={0.9} />

        {/* Cheeks */}
        <Ellipse cx={cx - s * 0.16} cy={cy - s * 0.22} rx={s * 0.065} ry={s * 0.044} fill="#FF8FAB" opacity={0.5} />
        <Ellipse cx={cx + s * 0.16} cy={cy - s * 0.22} rx={s * 0.065} ry={s * 0.044} fill="#FF8FAB" opacity={0.5} />

        {/* Smile */}
        <Path d={`M${cx - s * 0.07} ${cy - s * 0.16} Q${cx} ${cy - s * 0.1} ${cx + s * 0.07} ${cy - s * 0.16}`}
          stroke="#1B5E20" strokeWidth={s * 0.022} fill="none" strokeLinecap="round" />

        {/* Sparkle */}
        <Circle cx={cx + s * 0.38} cy={cy - s * 0.36} r={s * 0.026} fill="#FFD700" opacity={0.95} />
        <Path d={`M${cx + s * 0.38} ${cy - s * 0.4} L${cx + s * 0.38} ${cy - s * 0.32} M${cx + s * 0.34} ${cy - s * 0.36} L${cx + s * 0.42} ${cy - s * 0.36}`}
          stroke="#FFD700" strokeWidth={s * 0.015} />
      </Svg>

      {/* Blink overlay */}
      <Animated.View style={{
        position: 'absolute',
        left: s * 0.32, top: s * 0.265,
        width: s * 0.36, height: s * 0.055,
        backgroundColor: '#81C784', borderRadius: 4,
        opacity: blink.interpolate({ inputRange: [0.08, 1], outputRange: [1, 0] }),
      }} />
    </Animated.View>
  );
}

// ─── PLAY BUTTON ─────────────────────────────────────────────────────────────
function PlayButton({ onPress }: { onPress: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.06, duration: 800, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1.0,  duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Pressable onPress={onPress} style={styles.playBtn}>
        <LinearGradient colors={['#69F0AE', '#00C853', '#1B5E20']} style={StyleSheet.absoluteFillObject} />
        {/* gloss */}
        <View style={styles.playBtnGloss} />
        <View style={styles.playBtnContent}>
          <Svg width={28} height={28} viewBox="0 0 40 40">
            <Polygon points="10,6 34,20 10,34" fill="white" opacity={0.95} />
          </Svg>
          <Text style={styles.playBtnText}>PLAY</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── SIDEBAR BUTTON ───────────────────────────────────────────────────────────
const SIDEBAR_ITEMS = [
  { label: 'Shop',  emoji: '🏪', color1: '#FF6F00', color2: '#E65100', badge: null },
  { label: 'Map',   emoji: '🗺️',  color1: '#0288D1', color2: '#01579B', badge: null },
  { label: 'Daily', emoji: '🎁',  color1: '#7B1FA2', color2: '#4A148C', badge: '!' },
  { label: 'Album', emoji: '📖',  color1: '#2E7D32', color2: '#1B5E20', badge: null },
];

function SideBtn({ item }: { item: typeof SIDEBAR_ITEMS[0] }) {
  return (
    <View style={styles.sideBtnWrap}>
      <View style={styles.sideBtnRing} />
      <Pressable
        onPress={() => {}}
        style={styles.sideBtnInner}
      >
        <LinearGradient colors={[item.color1, item.color2]} style={StyleSheet.absoluteFillObject} />
        <Text style={styles.sideBtnIcon}>{item.emoji}</Text>
        {item.badge && (
          <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>
        )}
      </Pressable>
      <Text style={styles.sideBtnLabel}>{item.label}</Text>
    </View>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Home',   active: true  },
  { label: 'Merge',  active: false },
  { label: 'World',  active: false },
  { label: 'Profile',active: false },
];

function BottomNav() {
  const [activeIdx, setActiveIdx] = useState(0);
  const navIcons = ['🏠', '🔀', '🌍', '👤'];
  return (
    <View style={styles.bottomNav}>
      <LinearGradient
        colors={['rgba(20,8,0,0)', 'rgba(20,8,0,0.92)', '#100500']}
        style={styles.bottomNavGrad}
      >
        <View style={styles.bottomNavRow}>
          {NAV_ITEMS.map((n, i) => (
            <Pressable key={n.label} onPress={() => setActiveIdx(i)} style={styles.navItem}>
              <View style={[styles.navIconWrap, i === activeIdx && styles.navIconWrapActive]}>
                <Text style={styles.navEmoji}>{navIcons[i]}</Text>
                {i === activeIdx && <View style={styles.navGlow} />}
              </View>
              <Text style={[styles.navLabel, i === activeIdx && styles.navLabelActive]}>{n.label}</Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}

// ─── COIN ICON (SVG) ─────────────────────────────────────────────────────────
function CoinSvg() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={10} fill="#FFC107" />
      <Circle cx={12} cy={12} r={8}  fill="#FFD740" />
      <Circle cx={9}  cy={9}  r={2}  fill="rgba(255,255,255,0.4)" />
    </Svg>
  );
}

function GemSvg() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Polygon points="12,2 22,9 18,22 6,22 2,9" fill="#7C4DFF" />
      <Polygon points="12,2 22,9 12,8 2,9" fill="rgba(255,255,255,0.35)" />
    </Svg>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { width: W, height: H } = useWindowDimensions();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Castle background */}
      <Image
        source={require('../../../assets/castle_bg.png')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Vignette overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.18)', 'transparent', 'rgba(0,0,0,0.55)']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Floating sparks */}
      {SPARKS.map((s, i) => (
        <Spark key={i} x={W * s.x} y={H * s.y} delay={s.delay} color={s.color} />
      ))}

      <SafeAreaView style={styles.safeArea}>
        {/* TOP HUD */}
        <View style={styles.topHud}>
          <View style={styles.currencyRow}>
            <View style={styles.pill}>
              <CoinSvg />
              <Text style={styles.pillText}>1,250</Text>
            </View>
            <View style={styles.pill}>
              <GemSvg />
              <Text style={styles.pillText}>89</Text>
            </View>
          </View>
          <Pressable onPress={() => {}} style={styles.settingsBtn}>
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </Pressable>
        </View>

        {/* LOGO */}
        <View style={styles.logoWrap}>
          <LinearGradient
            colors={['#B8860B', '#FFD700', '#B8860B']}
            style={styles.logoFrame}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          >
            <View style={styles.logoInner}>
              <Text style={styles.logoText}>DRAGON{'\n'}MERGE KINGDOM</Text>
            </View>
          </LinearGradient>
        </View>

        {/* MAIN AREA: sidebar + center */}
        <View style={styles.playArea}>
          {/* Left sidebar */}
          <View style={styles.sidebar}>
            {SIDEBAR_ITEMS.map((item) => (
              <SideBtn key={item.label} item={item} />
            ))}
          </View>

          {/* Center: dragon + play button */}
          <View style={styles.centerArea}>
            <DragonMascot size={W * 0.5} />
            <PlayButton onPress={() => router.push('/(app)/game')} />
            <View style={styles.playHint}>
              <Text style={styles.playHintText}>✨ Tap to start merging!</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom nav */}
      <BottomNav />
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:             { flex: 1, backgroundColor: '#0D0500' },
  safeArea:         { flex: 1 },

  // HUD
  topHud:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4 },
  currencyRow:      { flexDirection: 'row', gap: 8 },
  pill:             { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.52)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,215,0,0.4)', gap: 4 },
  pillText:         { color: '#FFE082', fontWeight: '800', fontSize: 13 },
  settingsBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },

  // Logo
  logoWrap:         { alignItems: 'center', marginTop: 8 },
  logoFrame:        { borderRadius: 14, padding: 3 },
  logoInner:        { backgroundColor: '#1A0900', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10 },
  logoText:         { color: '#FFD700', fontWeight: '900', fontSize: 22, textAlign: 'center', letterSpacing: 3, textShadowColor: '#FF8F00', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },

  // Play area
  playArea:         { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  sidebar:          { alignItems: 'center', gap: 10, paddingLeft: 4 },
  centerArea:       { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 20 },

  // Sidebar buttons
  sideBtnWrap:      { alignItems: 'center' },
  sideBtnRing:      { position: 'absolute', top: -2, left: -2, right: -2, bottom: 18, borderRadius: 30, borderWidth: 2, borderColor: 'rgba(255,215,0,0.7)', zIndex: 2 },
  sideBtnInner:     { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  sideBtnIcon:      { fontSize: 22, zIndex: 1 },
  sideBtnLabel:     { color: '#FFE082', fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  badge:            { position: 'absolute', top: -3, right: -3, backgroundColor: '#F44336', borderRadius: 9, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'white', zIndex: 3 },
  badgeText:        { color: 'white', fontSize: 9, fontWeight: '900' },

  // Play button
  playBtn:          { width: 200, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  playBtnGloss:     { position: 'absolute', top: 3, left: 20, right: 20, height: 22, backgroundColor: 'rgba(255,255,255,0.38)', borderRadius: 12 },
  playBtnContent:   { flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 1 },
  playBtnText:      { color: 'white', fontWeight: '900', fontSize: 26, letterSpacing: 3, textShadowColor: '#1B5E20', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  playHint:         { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  playHintText:     { color: '#FFE082', fontSize: 11, fontWeight: '600' },

  // Bottom nav
  bottomNav:        { position: 'absolute', bottom: 0, left: 0, right: 0 },
  bottomNavGrad:    { paddingBottom: 16, paddingTop: 20 },
  bottomNavRow:     { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navItem:          { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4 },
  navIconWrap:      { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,215,0,0.08)' },
  navIconWrapActive:{ backgroundColor: 'rgba(255,215,0,0.22)' },
  navEmoji:         { fontSize: 22 },
  navGlow:          { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 26, borderWidth: 1.5, borderColor: 'rgba(255,215,0,0.6)' },
  navLabel:         { color: '#7A5C3A', fontSize: 9, fontWeight: '700', marginTop: 2 },
  navLabelActive:   { color: '#FFD700' },
});
