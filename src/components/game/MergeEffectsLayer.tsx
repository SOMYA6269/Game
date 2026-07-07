import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import type { MergeEffect, Particle } from '@/lib/gameTypes';
import { getDragonDef } from '@/lib/gameData';

interface MergeEffectsLayerProps {
  effects: MergeEffect[];
  particles: Particle[];
}

function MergePopup({ effect }: { effect: MergeEffect }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const def = getDragonDef(effect.level);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, tension: 200, friction: 8 }),
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(translateY, { toValue: -40, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: effect.x - 30,
        top: effect.y - 30,
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: [{ scale }, { translateY }],
      }}
    >
      {/* Flash ring */}
      <View
        style={{
          position: 'absolute',
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: `${def.color}40`,
          borderWidth: 2,
          borderColor: def.color,
        }}
      />
      <Text style={{ fontSize: 22 }}>✨</Text>
      <Text style={{ fontSize: 11, fontWeight: '900', color: def.color, marginTop: 2 }}>
        +{def.score}
      </Text>
    </Animated.View>
  );
}

function ParticleDot({ particle }: { particle: Particle }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: particle.x - particle.size / 2,
        top: particle.y - particle.size / 2,
        width: particle.size,
        height: particle.size,
        borderRadius: particle.size / 2,
        backgroundColor: particle.color,
        opacity: particle.life,
      }}
    />
  );
}

export default function MergeEffectsLayer({ effects, particles }: MergeEffectsLayerProps) {
  return (
    <View style={{ position: 'absolute', inset: 0 }} pointerEvents="none">
      {particles.map(p => (
        <ParticleDot key={p.id} particle={p} />
      ))}
      {effects.map(e => (
        <MergePopup key={e.id} effect={e} />
      ))}
    </View>
  );
}
