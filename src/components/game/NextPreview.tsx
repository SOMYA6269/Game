import React from 'react';
import { View, Text } from 'react-native';
import { getDragonDef } from '@/lib/gameData';

interface NextPreviewProps {
  level: number;
}

export default function NextPreview({ level }: NextPreviewProps) {
  const def = getDragonDef(level);
  return (
    <View className="items-center">
      <Text className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
        Next
      </Text>
      <View
        className="rounded-2xl items-center justify-center p-2"
        style={{
          width: 56,
          height: 64,
          backgroundColor: def.bgColor,
          borderWidth: 2,
          borderColor: def.color,
          borderCurve: 'continuous',
          shadowColor: def.glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 8,
        }}
      >
        <View
          style={{
            width: def.radius * 1.1,
            height: def.radius * 1.1,
            borderRadius: def.radius,
            backgroundColor: def.bgColor,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: def.color,
          }}
        >
          <Text style={{ fontSize: def.radius * 0.65 }}>{def.emoji}</Text>
        </View>
        <Text
          className="font-bold mt-0.5"
          style={{ fontSize: 8, color: def.color }}
          numberOfLines={1}
        >
          {def.name.split(' ')[0]}
        </Text>
      </View>
    </View>
  );
}
