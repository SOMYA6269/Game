import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="game" />
      <Stack.Screen name="collection" />
      <Stack.Screen name="world-map" />
      <Stack.Screen name="shop" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="daily-rewards" />
      <Stack.Screen name="evolution-tree" />
      <Stack.Screen name="level-complete" options={{ presentation: 'transparentModal' }} />
      <Stack.Screen name="unlock-animation" options={{ presentation: 'transparentModal' }} />
    </Stack>
  );
}
