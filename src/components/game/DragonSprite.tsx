import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { getDragonDef } from '../../lib/gameData';
import type { PhysicsObject } from '../../lib/gameTypes';

interface Props {
  obj: PhysicsObject;
  boardWidth: number;
  boardHeight: number;
}

export default function DragonSprite({ obj, boardWidth, boardHeight }: Props) {
  const def = getDragonDef(obj.level);
  const scaleAnim = useRef(new Animated.Value(obj.scale)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scaleAnim.setValue(obj.scale);
  }, [obj.scale, scaleAnim]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -3, duration: 700, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bounceAnim]);

  const left = obj.x - obj.radius;
  const top  = obj.y - obj.radius;
  const size = obj.radius * 2;
  const fontSize = obj.radius * 0.75;
  const faceFontSize = obj.radius * 0.45;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        opacity: obj.opacity,
        transform: [
          { scale: scaleAnim },
          { translateY: bounceAnim },
        ],
      }}
    >
      {/* Glow shadow */}
      <View
        style={{
          position: 'absolute',
          left: -4, top: -4, right: -4, bottom: -4,
          borderRadius: obj.radius + 4,
          backgroundColor: def.glowColor,
          opacity: 0.5,
        }}
      />
      {/* Main circle */}
      <View
        style={{
          width: size, height: size,
          borderRadius: obj.radius,
          backgroundColor: def.bgColor,
          borderWidth: 2.5,
          borderColor: def.borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Glossy highlight */}
        <View
          style={{
            position: 'absolute',
            top: 4, left: 6,
            width: size * 0.4,
            height: size * 0.25,
            borderRadius: size * 0.2,
            backgroundColor: 'rgba(255,255,255,0.55)',
          }}
        />
        {/* Bomb */}
        {obj.isBomb ? (
          <Text style={{ fontSize: fontSize * 0.9 }}>💣</Text>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize, lineHeight: fontSize * 1.1 }}>{def.emoji}</Text>
            {obj.level <= 5 && (
              <Text style={{ fontSize: faceFontSize, position: 'absolute', bottom: -2 }}>{def.face}</Text>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );
}
