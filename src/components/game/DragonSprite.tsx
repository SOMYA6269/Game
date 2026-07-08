import React, { useRef, useEffect, memo } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { getDragonDef } from '../../lib/gameData';
import type { PhysicsObject } from '../../lib/gameTypes';

interface Props { obj: PhysicsObject }

const DragonSprite = memo(function DragonSprite({ obj }: Props) {
  const def   = getDragonDef(obj.level);
  const size  = obj.radius * 2;
  const left  = obj.x - obj.radius;
  const top   = obj.y - obj.radius;

  // Idle breathing scale
  const breathe = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!obj.settled) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1.05, duration: 700 + obj.level * 50, useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 1,    duration: 700 + obj.level * 50, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [obj.settled, obj.level, breathe]);

  const scaleX = obj.scale ?? 1;
  const scaleY = obj.scale ? (2 - obj.scale) : 1; // squash in opposite axis

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left, top, width: size, height: size,
          borderRadius: size / 2,
          opacity: obj.opacity ?? 1,
          transform: [
            { scaleX },
            { scaleY },
            { scale: obj.settled ? breathe : 1 },
          ],
          // Glow border color
          borderColor: def.borderColor,
          borderWidth: obj.settled ? 2.5 : 2,
          backgroundColor: def.bgColor,
          shadowColor: def.glowColor,
          shadowRadius: obj.settled ? 8 : 4,
          shadowOpacity: 0.7,
        },
      ]}
    >
      {/* Gloss highlight */}
      <View style={[styles.gloss, { width: size * 0.38, height: size * 0.22, borderRadius: size * 0.12 }]} />

      {/* Cartoon animal image */}
      {def.imageUrl ? (
        <Image
          source={{ uri: def.imageUrl }}
          style={{ width: size * 0.88, height: size * 0.88 }}
          contentFit="contain"
        />
      ) : (
        // Fallback: rarity gradient circle with emoji
        <View style={[styles.fallback, { backgroundColor: def.color + '22' }]}>
          <Animated.Text style={{ fontSize: size * 0.48, lineHeight: size * 0.6 }}>
            {def.emoji}
          </Animated.Text>
        </View>
      )}

      {/* Level badge */}
      <View style={[styles.lvBadge, { backgroundColor: def.color }]}>
        <Animated.Text style={styles.lvText}>{obj.level}</Animated.Text>
      </View>

      {/* Bomb indicator */}
      {obj.isBomb && (
        <View style={styles.bombOverlay}>
          <Animated.Text style={styles.bombText}>💣</Animated.Text>
        </View>
      )}
    </Animated.View>
  );
});

export default DragonSprite;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: '8%',
    left: '15%',
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lvBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
    minWidth: 14,
    alignItems: 'center',
  },
  lvText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 10,
  },
  bombOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 999,
  },
  bombText: { fontSize: 18 },
});
