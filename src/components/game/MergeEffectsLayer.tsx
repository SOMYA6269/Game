import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import type { MergeEffect, Particle, ComboLabel } from '../../lib/gameTypes';
import { getDragonDef } from '../../lib/gameData';

interface ScorePopProps { effect: MergeEffect; }
function ScorePop({ effect }: ScorePopProps) {
  const def = getDragonDef(effect.level);
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }).start();
  }, [anim]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -50] });
  const opacity = anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] });
  const scale = anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.5, 1.3, 1] });
  return (
    <Animated.View style={{
      position: 'absolute',
      left: effect.x - 35, top: effect.y - 20,
      transform: [{ translateY }, { scale }],
      opacity, alignItems: 'center',
    }}>
      <View style={{
        backgroundColor: def.bgColor, borderRadius: 20,
        paddingHorizontal: 10, paddingVertical: 4,
        borderWidth: 2, borderColor: def.borderColor,
        flexDirection: 'row', alignItems: 'center', gap: 4,
      }}>
        <Text style={{ fontSize: 12 }}>{def.emoji}</Text>
        <Text style={{ color: def.color, fontWeight: '900', fontSize: 13 }}>{effect.scoreText}</Text>
      </View>
    </Animated.View>
  );
}

interface ComboTextProps { label: ComboLabel; }
function ComboText({ label }: ComboTextProps) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 1100, useNativeDriver: true }).start();
  }, [anim]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -70] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 0.9, 1], outputRange: [0, 1, 1, 0] });
  const scale = anim.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0.3, 1.5, 1.1, 1] });
  return (
    <Animated.View style={{
      position: 'absolute',
      left: label.x - 60, top: label.y - 20,
      transform: [{ translateY }, { scale }],
      opacity, alignItems: 'center',
    }}>
      <Text style={{
        fontSize: 22, fontWeight: '900', color: label.color,
        textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
      }}>{label.text}</Text>
    </Animated.View>
  );
}

interface ParticleDotProps { p: Particle; }
function ParticleDot({ p }: ParticleDotProps) {
  return (
    <View style={{
      position: 'absolute',
      left: p.x - p.size / 2, top: p.y - p.size / 2,
      width: p.size, height: p.size,
      borderRadius: p.size / 2,
      backgroundColor: p.color,
      opacity: Math.max(0, p.life),
    }} />
  );
}

interface Props {
  effects: MergeEffect[];
  particles: Particle[];
  comboLabels: ComboLabel[];
}
export default function MergeEffectsLayer({ effects, particles, comboLabels }: Props) {
  const now = Date.now();
  const activeEffects = effects.filter(e => now - e.createdAt < 1000);
  const activeLabels = comboLabels.filter(l => now - l.createdAt < 1200);
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
      {particles.map(p => <ParticleDot key={p.id} p={p} />)}
      {activeEffects.map(e => <ScorePop key={e.id} effect={e} />)}
      {activeLabels.map(l => <ComboText key={l.id} label={l} />)}
    </View>
  );
}
