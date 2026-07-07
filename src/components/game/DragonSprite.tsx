import React, { useEffect, useRef, memo } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { getDragonDef } from '../../lib/gameData';
import type { PhysicsObject } from '../../lib/gameTypes';

// Cartoon character faces mapped to dragon levels
const CHAR_FACES: Record<number, string> = {
  1:  '🐧', // Penguin egg
  2:  '🐰', // Bunny
  3:  '🐷', // Piggy
  4:  '🦊', // Fox
  5:  '🦕', // Dino
  6:  '🐱', // Cat
  7:  '🐹', // Hamster
  8:  '🐼', // Panda
  9:  '🐨', // Koala
  10: '🐲', // Baby dragon
  11: '👑', // Dragon king
};

interface Props {
  obj: PhysicsObject;
}

const DragonSprite = memo(function DragonSprite({ obj }: Props) {
  const def        = getDragonDef(obj.level);
  const scaleAnim  = useRef(new Animated.Value(obj.scale)).current;
  const opacAnim   = useRef(new Animated.Value(obj.opacity)).current;

  useEffect(() => { scaleAnim.setValue(obj.scale);   }, [obj.scale,   scaleAnim]);
  useEffect(() => { opacAnim.setValue(obj.opacity);  }, [obj.opacity, opacAnim]);

  const size      = obj.radius * 2;
  const glowSize  = size + 16;
  const faceEmoji = obj.isBomb ? '💣' : (CHAR_FACES[obj.level] ?? def.emoji);
  const fontSize  = obj.radius * 0.72;

  return (
    <Animated.View style={[
      styles.container,
      {
        left:    obj.x - obj.radius,
        top:     obj.y - obj.radius,
        width:   size,
        height:  size,
        opacity: opacAnim,
        zIndex:  obj.level,
        transform: [{ scale: scaleAnim }],
      },
    ]}>
      {/* Outer glow ring */}
      <View style={[styles.glow, {
        width: glowSize, height: glowSize,
        borderRadius: glowSize / 2,
        backgroundColor: def.glowColor,
        left: -(glowSize - size) / 2,
        top:  -(glowSize - size) / 2,
      }]} />

      {/* Main body */}
      <View style={[styles.body, {
        width: size, height: size, borderRadius: obj.radius,
        backgroundColor: def.bgColor,
        borderColor: def.borderColor,
      }]}>
        {/* Glossy highlight */}
        <View style={[styles.gloss, {
          width:  size * 0.42,
          height: size * 0.22,
          borderRadius: size * 0.18,
        }]} />

        {/* Character emoji */}
        <Text style={{ fontSize, lineHeight: fontSize * 1.1 }}>{faceEmoji}</Text>

        {/* Level indicator dot — subtle bottom right */}
        <View style={[styles.lvDot, { backgroundColor: def.color }]}>
          <Text style={styles.lvDotText}>{obj.level}</Text>
        </View>
      </View>
    </Animated.View>
  );
});

export default DragonSprite;

const styles = StyleSheet.create({
  container: { position: 'absolute' },
  glow: {
    position: 'absolute',
    opacity: 0.5,
  },
  body: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 5, left: 7,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  lvDot: {
    position: 'absolute', bottom: 3, right: 3,
    width: 14, height: 14, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  lvDotText: { color: '#fff', fontSize: 7, fontWeight: '900' },
});
