import React from 'react';
import { View, Text, Pressable } from 'react-native';

interface BoosterButtonProps {
  emoji: string;
  label: string;
  count: number;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}

function BoosterButton({ emoji, label, count, color, onPress, disabled }: BoosterButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || count === 0}
      className="items-center flex-1 active:opacity-70"
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 18,
          backgroundColor: disabled || count === 0 ? '#1F1035' : color,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: disabled || count === 0 ? '#3D2060' : `${color}AA`,
          borderCurve: 'continuous' as const,
          opacity: disabled || count === 0 ? 0.5 : 1,
          shadowColor: disabled || count === 0 ? 'transparent' : color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
        }}
      >
        <Text style={{ fontSize: 26 }}>{emoji}</Text>
      </View>

      {/* Count badge */}
      <View
        style={{
          position: 'absolute',
          top: -4,
          right: 4,
          backgroundColor: '#FBBF24',
          borderRadius: 8,
          minWidth: 18,
          height: 18,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: '800', color: '#1A0A2E' }}>{count}</Text>
      </View>

      <Text style={{ fontSize: 10, color: '#9D7EC9', marginTop: 4, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

interface BoosterBarProps {
  boosters: { undo: number; shake: number; bomb: number; magnet: number };
  onUndo: () => void;
  onShake: () => void;
  onBomb: () => void;
  onMagnet: () => void;
  bombMode?: boolean;
}

export default function BoosterBar({ boosters, onUndo, onShake, onBomb, onMagnet, bombMode }: BoosterBarProps) {
  return (
    <View
      className="flex-row items-center justify-around px-4 py-3"
      style={{
        backgroundColor: '#0F0520',
        borderTopWidth: 1,
        borderTopColor: '#2D1060',
      }}
    >
      <BoosterButton emoji="↩️" label="UNDO" count={boosters.undo} color="#3B82F6" onPress={onUndo} />
      <BoosterButton emoji="🌀" label="SHAKE" count={boosters.shake} color="#8B5CF6" onPress={onShake} />
      <BoosterButton emoji="💣" label="BOMB" count={boosters.bomb} color="#EF4444" onPress={onBomb} disabled={bombMode} />
      <BoosterButton emoji="🧲" label="MAGNET" count={boosters.magnet} color="#10B981" onPress={onMagnet} />
    </View>
  );
}
