import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface BoosterButtonProps {
  emoji: string;
  label: string;
  count: number;
  color: string;
  bgColor: string;
  onPress: () => void;
  disabled?: boolean;
}

function BoosterButton({ emoji, label, count, color, bgColor, onPress, disabled }: BoosterButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || count === 0}
      style={{
        flex: 1, alignItems: 'center',
        backgroundColor: disabled || count === 0 ? '#F3F4F6' : bgColor,
        borderRadius: 14, paddingVertical: 8,
        borderWidth: 2,
        borderColor: disabled || count === 0 ? '#E5E7EB' : color,
        opacity: count === 0 ? 0.5 : 1,
        position: 'relative',
      }}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={{
        fontSize: 9, fontWeight: '800',
        color: disabled || count === 0 ? '#9CA3AF' : color,
        marginTop: 2, letterSpacing: 0.3,
      }}>{label}</Text>
      {count > 0 && (
        <View style={{
          position: 'absolute', top: -6, right: -6,
          backgroundColor: color, borderRadius: 9,
          width: 18, height: 18, alignItems: 'center', justifyContent: 'center',
          borderWidth: 2, borderColor: '#fff',
        }}>
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{count}</Text>
        </View>
      )}
    </Pressable>
  );
}

interface Props {
  boosters: { undo: number; bomb: number; magnet: number; freeze: number; rainbow: number };
  onUndo: () => void;
  onBomb: () => void;
  onMagnet: () => void;
  onFreeze: () => void;
  onRainbow: () => void;
}

export default function BoosterBar({ boosters, onUndo, onBomb, onMagnet, onFreeze, onRainbow }: Props) {
  return (
    <View style={{
      flexDirection: 'row', gap: 6,
      paddingHorizontal: 8, paddingBottom: 8,
    }}>
      <BoosterButton emoji="↩️" label="UNDO"    count={boosters.undo}    color="#8B5CF6" bgColor="#EDE9FE" onPress={onUndo} />
      <BoosterButton emoji="💣" label="BOMB"    count={boosters.bomb}    color="#EF4444" bgColor="#FEE2E2" onPress={onBomb} />
      <BoosterButton emoji="🧲" label="MAGNET"  count={boosters.magnet}  color="#3B82F6" bgColor="#DBEAFE" onPress={onMagnet} />
      <BoosterButton emoji="❄️" label="FREEZE"  count={boosters.freeze}  color="#06B6D4" bgColor="#CFFAFE" onPress={onFreeze} />
      <BoosterButton emoji="🌈" label="RAINBOW" count={boosters.rainbow} color="#EC4899" bgColor="#FCE7F3" onPress={onRainbow} />
    </View>
  );
}
