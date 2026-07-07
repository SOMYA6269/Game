import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

// Premium Cartoon Mobile Game Theme
export const THEME = {
  light: {
    background: '#E8F4FF', // light sky blue
    foreground: '#1A1A2E', // dark text
    card: '#FFFFFF',
    cardForeground: '#1A1A2E',
    popover: '#FFFFFF',
    popoverForeground: '#1A1A2E',
    primary: '#6B5CE7', // vibrant purple
    primaryForeground: '#FFFFFF',
    secondary: '#FFA500', // vibrant orange
    secondaryForeground: '#FFFFFF',
    muted: '#F0F0F0',
    mutedForeground: '#808080',
    accent: '#FF1493', // hot pink
    accentForeground: '#FFFFFF',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    border: '#E0E0E0',
    input: '#F5F5F5',
    ring: '#6B5CE7',
    radius: '1rem',
  },
  dark: {
    background: '#1A1A2E',
    foreground: '#FFFFFF',
    card: '#2D2D44',
    cardForeground: '#FFFFFF',
    popover: '#2D2D44',
    popoverForeground: '#FFFFFF',
    primary: '#6B5CE7',
    primaryForeground: '#FFFFFF',
    secondary: '#FFA500',
    secondaryForeground: '#FFFFFF',
    muted: '#444444',
    mutedForeground: '#AAAAAA',
    accent: '#FF1493',
    accentForeground: '#FFFFFF',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    border: '#444444',
    input: '#333333',
    ring: '#6B5CE7',
    radius: '1rem',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
