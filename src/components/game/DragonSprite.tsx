import React, { memo } from 'react';
import { View, Text } from 'react-native';
import type { PhysicsObject } from '@/lib/gameTypes';
import { getDragonDef } from '@/lib/gameData';

interface DragonSpriteProps {
  object: PhysicsObject;
  onPress?: (id: string) => void;
  bombMode?: boolean;
}

const DragonSprite = memo(function DragonSprite({ object, onPress, bombMode }: DragonSpriteProps) {
  const def = getDragonDef(object.level);
  const size = object.radius * 2;

  const handlePress = () => {
    if (bombMode && onPress) onPress(object.id);
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: object.x - object.radius,
        top: object.y - object.radius,
        width: size,
        height: size,
        opacity: object.opacity,
        transform: [{ scale: object.scale }],
      }}
    >
      {/* Glow ring for high-level dragons */}
      {object.level >= 7 && (
        <View
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: object.radius + 4,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: def.glowColor,
            opacity: 0.6,
          }}
        />
      )}

      {/* Main circle body */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: object.radius,
          backgroundColor: def.bgColor,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2.5,
          borderColor: def.color,
          shadowColor: def.glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: object.level >= 5 ? 0.9 : 0.5,
          shadowRadius: object.radius * 0.4,
          overflow: 'hidden',
        }}
      >
        {/* Inner gradient shimmer */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '45%',
            backgroundColor: `${def.color}22`,
            borderRadius: object.radius,
          }}
        />

        {/* Emoji */}
        <Text
          style={{
            fontSize: object.radius * 0.75,
            textAlign: 'center',
            lineHeight: object.radius * 0.9,
          }}
          selectable={false}
        >
          {bombMode ? '💥' : def.emoji}
        </Text>
      </View>

      {/* Level badge for dragons */}
      {object.level >= 7 && (
        <View
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            backgroundColor: '#FBBF24',
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ fontSize: 8, fontWeight: '900', color: '#1A0A2E' }}>{object.level}</Text>
        </View>
      )}
    </View>
  );
});

export default DragonSprite;
