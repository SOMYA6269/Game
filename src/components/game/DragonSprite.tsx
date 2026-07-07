import React, { useEffect, useRef, memo } from 'react';
import { View, Text, Animated } from 'react-native';
import { getDragonDef } from '../../lib/gameData';
import type { PhysicsObject } from '../../lib/gameTypes';

interface Props {
  obj: PhysicsObject;
}

const DragonSprite = memo(function DragonSprite({ obj }: Props) {
  const def = getDragonDef(obj.level);
  const scaleAnim = useRef(new Animated.Value(obj.scale)).current;
  const opacityAnim = useRef(new Animated.Value(obj.opacity)).current;

  // Sync scale & opacity from physics (no extra loop animation → 60fps friendly)
  useEffect(() => { scaleAnim.setValue(obj.scale); }, [obj.scale, scaleAnim]);
  useEffect(() => { opacityAnim.setValue(obj.opacity); }, [obj.opacity, opacityAnim]);

  const size = obj.radius * 2;
  const fontSize = obj.radius * 0.78;
  const glowSize = size + 10;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: obj.x - obj.radius,
        top: obj.y - obj.radius,
        width: size,
        height: size,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
        zIndex: obj.level,
      }}
    >
      {/* Outer glow */}
      <View style={{
        position: 'absolute',
        left: -(glowSize - size) / 2,
        top: -(glowSize - size) / 2,
        width: glowSize,
        height: glowSize,
        borderRadius: glowSize / 2,
        backgroundColor: def.glowColor,
        opacity: 0.45,
      }} />
      {/* Main body */}
      <View style={{
        width: size, height: size, borderRadius: obj.radius,
        backgroundColor: def.bgColor,
        borderWidth: 2.5,
        borderColor: def.borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Gloss highlight */}
        <View style={{
          position: 'absolute',
          top: 4, left: 6,
          width: size * 0.38,
          height: size * 0.22,
          borderRadius: size * 0.18,
          backgroundColor: 'rgba(255,255,255,0.6)',
        }} />
        {obj.isBomb
          ? <Text style={{ fontSize: fontSize * 0.88 }}>💣</Text>
          : <Text style={{ fontSize, lineHeight: fontSize * 1.1 }}>{def.emoji}</Text>
        }
      </View>
    </Animated.View>
  );
});

export default DragonSprite;
