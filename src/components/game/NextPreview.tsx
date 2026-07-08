import React from 'react';
import { View, Text } from 'react-native';
import { getDragonDef } from '../../lib/gameData';

interface Props { level: number; }

export default function NextPreview({ level }: Props) {
  const def = getDragonDef(level);
  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16, padding: 8,
      alignItems: 'center', minWidth: 70,
      shadowColor: def.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25, shadowRadius: 6,
      borderWidth: 2, borderColor: def.borderColor,
    }}>
      <Text style={{ fontSize: 9, color: '#8B5CF6', fontWeight: '800', letterSpacing: 0.5 }}>NEXT</Text>
      <View style={{
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: def.bgColor,
        borderWidth: 2, borderColor: def.borderColor,
        alignItems: 'center', justifyContent: 'center',
        marginVertical: 4,
      }}>
        <Text style={{ fontSize: 20 }}>{def.emoji}</Text>
      </View>
      <Text style={{ fontSize: 8, color: '#6B7280', fontWeight: '700' }}>{def.name}</Text>
    </View>
  );
}
