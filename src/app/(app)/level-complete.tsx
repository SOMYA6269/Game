import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Star, RotateCcw, Home, ChevronRight } from 'lucide-react-native';

export default function LevelCompleteScreen() {
  const params = useLocalSearchParams<{ score: string; bestScore: string }>();
  const score = Number(params.score ?? 0);
  const bestScore = Number(params.bestScore ?? 0);
  const isNewBest = score >= bestScore;

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const star1 = useRef(new Animated.Value(0)).current;
  const star2 = useRef(new Animated.Value(0)).current;
  const star3 = useRef(new Animated.Value(0)).current;

  const stars = score > 5000 ? 3 : score > 2000 ? 2 : 1;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      // Animate stars one by one
      const starAnims = [star1, star2, star3];
      starAnims.forEach((anim, i) => {
        if (i < stars) {
          setTimeout(() => {
            Animated.spring(anim, {
              toValue: 1, useNativeDriver: true, tension: 200, friction: 7,
            }).start();
          }, 300 + i * 200);
        }
      });
    });
  }, []);

  const handleReplay = () => {
    router.replace('/(app)/game' as never);
  };

  const handleHome = () => {
    router.replace('/(app)/home' as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(10,1,24,0.9)' }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Animated.View
          style={{
            width: '100%',
            backgroundColor: '#1A0A3E',
            borderRadius: 28, padding: 32,
            alignItems: 'center',
            borderWidth: 3, borderColor: '#7C3AED',
            shadowColor: '#7C3AED',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6, shadowRadius: 24,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Trophy */}
          <Text style={{ fontSize: 72, marginBottom: 8 }}>🏆</Text>

          <Text style={{ color: '#FBBF24', fontSize: 28, fontWeight: '900', marginBottom: 4 }}>
            {isNewBest ? 'NEW BEST!' : 'GAME OVER'}
          </Text>
          <Text style={{ color: '#C4B5FD', fontSize: 14, marginBottom: 24 }}>
            {isNewBest ? '🎉 Amazing new high score!' : 'Keep merging, you\'ll do better!'}
          </Text>

          {/* Stars */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            {[star1, star2, star3].map((anim, i) => (
              <Animated.View key={i} style={{ transform: [{ scale: anim }] }}>
                <Star
                  size={40}
                  color={i < stars ? '#FBBF24' : '#2D1060'}
                  fill={i < stars ? '#FBBF24' : 'none'}
                />
              </Animated.View>
            ))}
          </View>

          {/* Score */}
          <View style={{
            backgroundColor: '#0F0520', borderRadius: 16,
            paddingVertical: 16, paddingHorizontal: 32,
            width: '100%', alignItems: 'center', marginBottom: 8,
          }}>
            <Text style={{ color: '#9D7EC9', fontSize: 11, fontWeight: '700', marginBottom: 4, letterSpacing: 1 }}>
              SCORE
            </Text>
            <Text style={{ color: '#fff', fontSize: 36, fontWeight: '900' }}>
              {score.toLocaleString()}
            </Text>
          </View>

          <View style={{
            backgroundColor: '#0F0520', borderRadius: 12,
            paddingVertical: 10, paddingHorizontal: 20,
            width: '100%', alignItems: 'center',
            flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 28,
          }}>
            <Text style={{ color: '#9D7EC9', fontSize: 12 }}>👑 Best:</Text>
            <Text style={{ color: '#FBBF24', fontSize: 16, fontWeight: '800' }}>
              {Math.max(score, bestScore).toLocaleString()}
            </Text>
          </View>

          {/* Rewards earned */}
          <View style={{
            flexDirection: 'row', gap: 16, marginBottom: 28,
            backgroundColor: '#0F0520', borderRadius: 14,
            padding: 14, width: '100%', justifyContent: 'center',
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>🪙</Text>
              <Text style={{ color: '#FBBF24', fontWeight: '800', fontSize: 14 }}>+{Math.floor(score / 10)}</Text>
              <Text style={{ color: '#9D7EC9', fontSize: 10 }}>Coins</Text>
            </View>
            <View style={{ width: 1, backgroundColor: '#2D1060' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>💎</Text>
              <Text style={{ color: '#60A5FA', fontWeight: '800', fontSize: 14 }}>+{stars * 5}</Text>
              <Text style={{ color: '#9D7EC9', fontSize: 10 }}>Gems</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <Pressable
              onPress={handleHome}
              style={{
                flex: 1, backgroundColor: '#2D1060',
                borderRadius: 16, paddingVertical: 14,
                alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 6,
              }}
            >
              <Home size={18} color="#C084FC" />
              <Text style={{ color: '#C084FC', fontWeight: '700', fontSize: 14 }}>Home</Text>
            </Pressable>

            <Pressable
              onPress={handleReplay}
              style={{
                flex: 2, backgroundColor: '#7C3AED',
                borderRadius: 16, paddingVertical: 14,
                alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 6,
                shadowColor: '#7C3AED',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.6, shadowRadius: 12,
              }}
            >
              <RotateCcw size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>Play Again</Text>
            </Pressable>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
