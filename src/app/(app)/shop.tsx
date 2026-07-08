// @ts-nocheck
/**
 * SHOP SCREEN — Premium rebuild
 * Tabs: Offers | Boosters | Coins | Gems | Dragons
 * Boosters tab: real gameplay power-ups matching HUD icons exactly
 * Visual: rich gradient backgrounds per category, embossed cards, ribbon tags, 3D price pills
 * All icons use BOOSTER_ICONS from AnimalAvatar for pixel-consistency with game HUD
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  useWindowDimensions, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { BOOSTER_ICONS } from '../../components/game/AnimalAvatar';

// ── Shared currency icon sources (local repo assets) ─────────────────────────
const COIN_SRC  = require('../../../assets/coin.png');
const GEM_SRC   = require('../../../assets/gem.png');

// ── Dragon art for shop bundles (local repo assets for levels 1 & 3, URL for 10) ─
const DRAGON_IMG_1  = require('../../../assets/egg_common.png');
const DRAGON_IMG_3  = require('../../../assets/dragon_red.png');
const DRAGON_IMG_10 = { uri: 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_40b0a1ae-9e82-4cb5-abca-d1e0a267e647.jpg' };

// ── Booster definitions — Undo, Freeze, Wildcard only (no Bomb or Magnet) ────
const BOOSTERS = [
  {
    key: 'undo',
    name: 'Undo',
    desc: 'Take back your last drop — save a bad move.',
    iconUri: BOOSTER_ICONS.undo,
    currency: COIN_SRC,
    price: '200',
    qty: 'x3',
    bgColors: ['#1a2a3a', '#0d1f30'] as [string, string],
    accentColor: '#4DB8FF',
  },
  {
    key: 'freeze',
    name: 'Freeze',
    desc: 'Pauses the drop timer for 10 seconds.',
    iconUri: BOOSTER_ICONS.freeze,
    currency: GEM_SRC,
    price: '15',
    qty: 'x3',
    bgColors: ['#0a1f2e', '#061220'] as [string, string],
    accentColor: '#67E8F9',
  },
  {
    key: 'rainbow',
    name: 'Wildcard',
    desc: 'Merges any two dragons regardless of type.',
    iconUri: BOOSTER_ICONS.rainbow,
    currency: GEM_SRC,
    price: '25',
    qty: 'x3',
    bgColors: ['#1e0a2e', '#130620'] as [string, string],
    accentColor: '#F472B6',
  },
];

// ── Bundle offers ─────────────────────────────────────────────────────────────
const BUNDLES = [
  {
    name: 'Starter Bundle',
    tag: 'HOT',
    tagColor: '#FF4444',
    desc: '5× Undo + 3× Bomb + 1,500 Coins',
    imageUri: DRAGON_IMG_1,
    priceFull: '$4.99',
    price: '$1.99',
    bgColors: ['#1a0a00', '#2d1600'] as [string,string],
    borderColor: '#FF8F00',
  },
  {
    name: 'Dragon Pack',
    tag: 'NEW',
    tagColor: '#22C55E',
    desc: 'Fire Dragon skin + 500 Gems + 10× Wildcards',
    imageUri: DRAGON_IMG_3,
    priceFull: '$9.99',
    price: '$6.99',
    bgColors: ['#1a000a', '#2d0010'] as [string,string],
    borderColor: '#FF1F8F',
  },
  {
    name: 'Legendary Bundle',
    tag: null,
    tagColor: '',
    desc: 'Legendary Dragon skin + 2,000 Gems + All boosters ×5',
    imageUri: DRAGON_IMG_10,
    priceFull: '$29.99',
    price: '$19.99',
    bgColors: ['#1a1200', '#2d1f00'] as [string,string],
    borderColor: '#FFD700',
  },
];

// ── Gem packs ─────────────────────────────────────────────────────────────────
const GEM_PACKS = [
  { gems: '80',   bonus: null,      price: '$0.99',  label: 'Small Pouch'  },
  { gems: '500',  bonus: '+50 FREE', price: '$4.99',  label: 'Gem Bag'     },
  { gems: '1200', bonus: '+200 FREE',price: '$9.99',  label: 'Gem Chest'   },
  { gems: '2500', bonus: '+500 FREE',price: '$19.99', label: 'Gem Vault'   },
];

// ── Coin packs ────────────────────────────────────────────────────────────────
const COIN_PACKS = [
  { coins: '1,000',  bonus: null,       price: '50 💎',  label: 'Coin Pouch'  },
  { coins: '5,000',  bonus: '+500 FREE',price: '200 💎', label: 'Coin Bag'    },
  { coins: '15,000', bonus: '+2k FREE', price: '500 💎', label: 'Coin Chest'  },
  { coins: '50,000', bonus: '+10k FREE',price: '1500 💎',label: 'Coin Vault'  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      {active && <LinearGradient colors={['#6D28D9','#4C1D95']} style={StyleSheet.absoluteFill} />}
      <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>{label}</Text>
    </Pressable>
  );
}

function RibbonTag({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.ribbon, { backgroundColor: color }]}>
      <View style={[styles.ribbonCut, { borderTopColor: color }]} />
      <Text style={styles.ribbonTxt}>{label}</Text>
    </View>
  );
}

function PriceBtn({ currencySrc, price, onPress }: { currencySrc: any; price: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.pricePillWrap}>
      <View style={styles.pricePillShadow} />
      <LinearGradient colors={['#2ECC71','#16A34A','#0d6b2e']} style={styles.pricePill}>
        <View style={styles.pricePillGloss} />
        {typeof currencySrc === 'string'
          ? <Text style={styles.pricePillTxt}>{currencySrc} {price}</Text>
          : <><Image source={currencySrc} style={{ width: 16, height: 16 }} resizeMode="contain" /><Text style={styles.pricePillTxt}> {price}</Text></>
        }
      </LinearGradient>
    </Pressable>
  );
}

function BoosterCard({ item }: { item: typeof BOOSTERS[0] }) {
  return (
    <LinearGradient colors={item.bgColors} style={[styles.boosterCard, { borderColor: item.accentColor + '55' }]}>
      {/* Embossed border highlight */}
      <View style={[styles.boosterCardHighlight, { borderColor: item.accentColor + '33' }]} />
      {/* Icon using same image as HUD */}
      <View style={[styles.boosterIconWrap, { backgroundColor: item.accentColor + '22', borderColor: item.accentColor + '55' }]}>
        <Image source={item.iconUri} style={styles.boosterIconImg} resizeMode="contain" />
        {/* Glossy top */}
        <View style={styles.boosterIconGloss} />
      </View>
      {/* Text info */}
      <View style={styles.boosterInfo}>
        <View style={styles.boosterHeader}>
          <Text style={[styles.boosterName, { color: item.accentColor }]}>{item.name}</Text>
          <View style={[styles.boosterQtyPill, { backgroundColor: item.accentColor + '33' }]}>
            <Text style={[styles.boosterQtyTxt, { color: item.accentColor }]}>{item.qty}</Text>
          </View>
        </View>
        <Text style={styles.boosterDesc}>{item.desc}</Text>
      </View>
      {/* Price */}
      <PriceBtn currencySrc={item.currency} price={item.price} onPress={() => {}} />
    </LinearGradient>
  );
}

function BundleCard({ item }: { item: typeof BUNDLES[0] }) {
  return (
    <LinearGradient colors={item.bgColors} style={[styles.bundleCard, { borderColor: item.borderColor + '66' }]}>
      {/* Texture pattern overlay */}
      <View style={styles.bundleTexture} />
      {item.tag && <RibbonTag label={item.tag} color={item.tagColor} />}
      <Image source={item.imageUri} style={styles.bundleImg} resizeMode="contain" />
      <View style={styles.bundleBody}>
        <Text style={[styles.bundleName, { color: item.borderColor }]}>{item.name}</Text>
        <Text style={styles.bundleDesc}>{item.desc}</Text>
        <View style={styles.bundlePriceRow}>
          <Text style={styles.bundlePriceFull}>{item.priceFull}</Text>
          <PriceBtn currency="💳" price={item.price} onPress={() => {}} />
        </View>
      </View>
    </LinearGradient>
  );
}

function SimplePackCard({
  iconSrc, label, value, bonus, price, gradColors,
}: {
  iconSrc: any; label: string; value: string; bonus?: string|null;
  price: string; gradColors: [string,string];
}) {
  return (
    <LinearGradient colors={gradColors} style={styles.packCard}>
      <View style={styles.packGloss} />
      <Image source={iconSrc} style={{ width: 28, height: 28 }} resizeMode="contain" />
      <View style={styles.packBody}>
        <Text style={styles.packLabel}>{label}</Text>
        <Text style={styles.packValue}>{value}</Text>
        {bonus && <Text style={styles.packBonus}>{bonus}</Text>}
      </View>
      <PriceBtn currencySrc="💳" price={price} onPress={() => {}} />
    </LinearGradient>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
const TABS = ['Offers', 'Boosters', 'Coins', 'Gems', 'Dragons'];

export default function ShopScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const { width } = useWindowDimensions();

  return (
    <View style={{ flex: 1, backgroundColor: '#07051a' }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1a0938', '#07051a']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backTxt}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>🏪  SHOP</Text>
          <View style={styles.headerCurrency}>
            <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
              <Image source={COIN_SRC} style={{ width:18, height:18 }} resizeMode="contain" />
              <Text style={styles.headerCurrTxt}>1,560</Text>
            </View>
            <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
              <Image source={GEM_SRC} style={{ width:18, height:18 }} resizeMode="contain" />
              <Text style={styles.headerCurrTxt}>260</Text>
            </View>
          </View>
        </View>

        {/* Tab bar */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.tabBar} contentContainerStyle={styles.tabBarContent}
        >
          {TABS.map((t, i) => (
            <Tab key={t} label={t} active={activeTab === i} onPress={() => setActiveTab(i)} />
          ))}
        </ScrollView>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── OFFERS ── */}
          {activeTab === 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔥  Today's Deals</Text>
              {BUNDLES.map(b => <BundleCard key={b.name} item={b} />)}
            </View>
          )}

          {/* ── BOOSTERS ── */}
          {activeTab === 1 && (
            <View style={styles.section}>
              <LinearGradient colors={['#2d1200','#1a0800']} style={styles.boosterBanner}>
                <Text style={styles.boosterBannerTitle}>⚡  Power-Up Boosters</Text>
                <Text style={styles.boosterBannerSub}>Use during gameplay — tap HUD button or buy more here</Text>
              </LinearGradient>
              {BOOSTERS.map(b => <BoosterCard key={b.key} item={b} />)}
            </View>
          )}

          {/* ── COINS ── */}
          {activeTab === 2 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🪙  Coin Packs</Text>
              {COIN_PACKS.map(p => (
                <SimplePackCard
                  key={p.label}
                  iconSrc={COIN_SRC} label={p.label} value={p.coins} bonus={p.bonus} price={p.price}
                  gradColors={['#1a1000','#2d1c00']}
                />
              ))}
            </View>
          )}

          {/* ── GEMS ── */}
          {activeTab === 3 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💎  Gem Packs</Text>
              {GEM_PACKS.map(p => (
                <SimplePackCard
                  key={p.label}
                  iconSrc={GEM_SRC} label={p.label} value={p.gems} bonus={p.bonus} price={p.price}
                  gradColors={['#0a0020','#150035']}
                />
              ))}
            </View>
          )}

          {/* ── DRAGONS ── */}
          {activeTab === 4 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🐉  Dragon Skins</Text>
              {[
                { name:'Fire Drake Skin', img: DRAGON_IMG_3,  price:'800 💎', tag:'HOT'  },
                { name:'Shadow Wraith Skin', img:'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d2218dbe-685b-44ac-bc05-9f2a0b167c94.jpg', price:'1,200 💎', tag:'NEW' },
                { name:'Ancient Legend Skin', img: DRAGON_IMG_10, price:'2,000 💎', tag:null },
              ].map(d => (
                <LinearGradient key={d.name} colors={['#1a0030','#0d001a']} style={styles.dragonSkinCard}>
                  <Image source={typeof d.img === 'string' ? { uri: d.img } : d.img} style={styles.dragonSkinImg} resizeMode="contain" />
                  <View style={styles.dragonSkinBody}>
                    {d.tag && <RibbonTag label={d.tag} color={d.tag === 'HOT' ? '#FF4444' : '#22C55E'} />}
                    <Text style={styles.dragonSkinName}>{d.name}</Text>
                    <PriceBtn currency="" price={d.price} onPress={() => {}} />
                  </View>
                </LinearGradient>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, gap: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  backTxt: { color: '#fff', fontSize: 28, fontWeight: '900', lineHeight: 34 },
  headerTitle: {
    flex: 1, color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  headerCurrency: { gap: 4 },
  headerCurrTxt: { color: '#FFD700', fontSize: 12, fontWeight: '900' },

  // Tab bar
  tabBar: { maxHeight: 44, marginBottom: 4 },
  tabBarContent: { paddingHorizontal: 12, gap: 8, alignItems: 'center' },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  tabActive: { borderColor: '#7C3AED' },
  tabTxt: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '700' },
  tabTxtActive: { color: '#fff', fontWeight: '900' },

  scrollContent: { paddingHorizontal: 14, paddingBottom: 24, gap: 14 },
  section: { gap: 12 },
  sectionTitle: {
    color: '#FFD700', fontSize: 16, fontWeight: '900', letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },

  // Ribbon tag
  ribbon: {
    position: 'absolute', top: 12, right: -2, zIndex: 10,
    paddingHorizontal: 10, paddingVertical: 4, borderTopLeftRadius: 8, borderBottomLeftRadius: 8,
  },
  ribbonCut: {
    position: 'absolute', bottom: -8, right: 0,
    borderLeftWidth: 0, borderRightWidth: 8, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: '#000',
  },
  ribbonTxt: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },

  // Booster tab banner
  boosterBanner: {
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,160,0,0.3)',
  },
  boosterBannerTitle: { color: '#FFB300', fontSize: 16, fontWeight: '900', marginBottom: 2 },
  boosterBannerSub: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },

  // Booster card
  boosterCard: {
    borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1.5, overflow: 'hidden',
  },
  boosterCardHighlight: {
    position: 'absolute', inset: 2, borderRadius: 16, borderWidth: 1,
  },
  boosterIconWrap: {
    width: 60, height: 60, borderRadius: 16, overflow: 'hidden',
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  boosterIconImg: { width: 60, height: 60 },
  boosterIconGloss: {
    position: 'absolute', top: 3, left: 5, right: 5, height: 10,
    borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.3)',
  },
  boosterInfo: { flex: 1, gap: 3 },
  boosterHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  boosterName: { fontSize: 15, fontWeight: '900' },
  boosterQtyPill: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  boosterQtyTxt: { fontSize: 11, fontWeight: '800' },
  boosterDesc: { color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 16 },

  // Price pill button
  pricePillWrap: { position: 'relative' },
  pricePillShadow: {
    position: 'absolute', bottom: -4, left: 4, right: 4, height: '100%',
    borderRadius: 16, backgroundColor: 'rgba(0,80,20,0.6)',
  },
  pricePill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(200,255,150,0.5)', overflow: 'hidden',
  },
  pricePillGloss: {
    position: 'absolute', top: 3, left: '15%', right: '15%', height: 6,
    borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)',
  },
  pricePillTxt: { color: '#fff', fontSize: 13, fontWeight: '900' },

  // Bundle card
  bundleCard: {
    borderRadius: 20, overflow: 'hidden', borderWidth: 2,
    flexDirection: 'row', alignItems: 'center',
  },
  bundleTexture: {
    position: 'absolute', inset: 0, opacity: 0.06,
    backgroundColor: 'transparent',
  },
  bundleImg: { width: 90, height: 90 },
  bundleBody: { flex: 1, padding: 12, gap: 4 },
  bundleName: { fontSize: 16, fontWeight: '900' },
  bundleDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12, lineHeight: 17 },
  bundlePriceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  bundlePriceFull: {
    color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: '700',
    textDecorationLine: 'line-through',
  },

  // Simple pack card (coins/gems)
  packCard: {
    borderRadius: 18, padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  packGloss: {
    position: 'absolute', top: 4, left: '8%', right: '8%', height: 10,
    borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.12)',
  },
  packIcon: { fontSize: 34 },
  packBody: { flex: 1, gap: 1 },
  packLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700' },
  packValue: { color: '#fff', fontSize: 20, fontWeight: '900' },
  packBonus: { color: '#4ADE80', fontSize: 11, fontWeight: '800' },

  // Dragon skin card
  dragonSkinCard: {
    borderRadius: 18, overflow: 'hidden', flexDirection: 'row',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.3)',
  },
  dragonSkinImg: { width: 90, height: 90 },
  dragonSkinBody: { flex: 1, padding: 14, gap: 8 },
  dragonSkinName: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
