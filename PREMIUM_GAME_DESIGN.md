# Dragon Merge Kingdom - Premium Game Design Specification

## 📋 Overview

This document outlines the complete visual and UX overhaul transforming Dragon Merge Kingdom into a premium, AAA-quality mobile game matching the design brief provided.

## 🎨 Design System

### Color Palette
The game uses a carefully selected 5-color palette for consistency and visual appeal:

```
Primary:     #6B5CE7  (Vibrant Purple) - Primary actions, headers, badges
Secondary:   #FFA500  (Vibrant Orange) - Accents, highlights, rewards
Accent:      #FF1493  (Hot Pink)       - Call-to-action, special events
Background:  #E8F4FF  (Sky Blue)       - Main background, calm atmosphere
Neutral:     #FFFFFF  (White)          - Cards, panels, content areas
```

### Typography
- **Font Family**: System fonts (iOS San Francisco, Android Roboto)
- **Headers**: 24-26pt, weight 900, letter-spacing 0.3-0.5
- **Body**: 14pt, weight 800
- **Small Text**: 11-12pt, weight 600-700

### Spacing & Sizing
- **Padding**: 14px, 16px, 18px, 20px (4-step system)
- **Border Radius**: 20px (default), 24-28px (large), 14-18px (small)
- **Shadows**: Progressive depth from 1px to 12px offset
- **Touch Targets**: Minimum 40x40 (buttons), 50x50+ (main actions)

## 🎮 Screen-by-Screen Design

### 1. Home Screen
**Purpose**: Welcoming entry point, main navigation hub

**Visual Elements**:
- Sky gradient background (light blue transition)
- Animated bouncing dragon logo (80pt emoji)
- "Dragon Merge ✨ KINGDOM ✨" title (premium styling)
- Big green PLAY button (40pt font, 10B981 color, thick border)
- Currency bar (coins/gems with quick-buy buttons)
- 4x2 navigation grid:
  - World Map (blue theme)
  - Collection (purple theme)
  - Shop (orange theme)
  - Daily Reward (green theme, NEW badge)
  - Achievements (orange theme)
  - Dragon Book (pink theme)
- Best Score trophy card
- Scrollable dragon row (tap to collection)

**Key Metrics**:
- Border radius: 24-26px
- Button padding: 20-22pt vertical
- Card shadow: 6px offset, 0.4-0.5 opacity
- Typography: Bold, letter-spaced

### 2. Game Screen (Merge Board)
**Purpose**: Core gameplay - merge dragons, progress

**Background**:
- Sky gradient: #87CEEB → #B0E0E6 → #E0FFFF
- Animated clouds (5 cloud elements at different speeds)
- Floating particles (18 total, 6 colors, alpha animation)
- Distant mountains/landscape (subtle, low opacity)

**Board Frame** (Premium Wooden Style):
- Background: #8B6F47 → #C9A876 (wood gradient)
- Border radius: 28px
- Border: 4px thick (#6B5230)
- Shadow: 12px offset, 0.6 opacity (#000000)
- Inner padding: 6px
- Drop zone: #C9A876 (lighter wood)
- Play area: #F0FAFF (light sky blue)

**HUD Elements**:
- Top Panel:
  - Pause button: 40x40, purple theme, glowing shadow
  - Score display: Large bold text, 19pt level badge
  - Progress bar: 9px height, glow effect
  - Currency: Coin and gem indicators
  - Level badge: Purple (#9333EA), 2.5px border
  
- Next Preview:
  - 76px minimum width
  - Dragon circle: 56x56, 28px radius
  - Glossy shadow effect
  - "NEXT" label (10pt, purple)
  
- Booster Buttons (×4):
  - 16px border radius
  - 2.5px border, color-matched
  - Count badge: 22x22, glowing shadow
  - Hover/press state: Scale animation

**Gameplay Area**:
- Dragons: 24-73px radius (levels 1-11)
- Grid lines: 1.5px, subtle opacity
- Danger line: 2px red, animated pulse
- Aim indicator: 10 dots, pulsing glow
- Score popups: Animated rise + fade
- Combo labels: Color-coded, spring animation
- Merge glow: Particle burst effect

### 3. Collection Screen (Dragon Book)
**Purpose**: Browse and collect dragons

**Header**:
- Back button: 40x40, purple theme, shadow
- Title: 24pt, bold, letter-spaced
- Progress badge: Purple background, white text

**Filter Buttons**:
- 6 options: All, Common, Rare, Epic, Legendary, Mythic
- Active state: Color fill + shadow
- Inactive: Light background, colored border
- Rounded: 18px

**Dragon Cards**:
- 2-column grid
- 24px border radius
- Padding: 16px
- Dragon circle: 72x72, 36px radius
- Name: 14pt, bold
- Rarity badge: Color-coded background
- Level badge: Top-right corner
- Bounce animation (unlocked dragons)
- Shadow: Color-matched glow

**Colors by Rarity**:
- Common: Gray (#6B7280)
- Rare: Blue (#3B82F6)
- Epic: Purple (#8B5CF6)
- Legendary: Orange (#F59E0B)
- Mythic: Pink (#EC4899)

### 4. World Map Screen
**Purpose**: Level selection, progression tracking

**Header**:
- Back button: 40x40, purple theme
- Title: 24pt, bold, letter-spaced
- Trophy icon (right)

**Level Cards**:
- 24px border radius
- 18px padding
- Kingdom icon: 68x68, 34px radius, glowing shadow
- Level name: 17pt, bold, letter-spaced
- Stars: 3-star rating display
- Target score: Badge with icon
- Play/Lock button: 52x52, color-matched shadow
- Level badge: Top-left corner
- Full-width layout

**Visual States**:
- Unlocked: Full opacity, colored shadows, clickable
- Locked: 60% opacity, gray shadows, disabled state

## 🎯 Interactive Elements

### Buttons (Universal)
- **Small**: 36-40px, 1.5-2px border, 2-3px shadow
- **Medium**: 40-50px, 2-2.5px border, 4-6px shadow
- **Large**: 50-60px+, 2.5-3.5px border, 6-12px shadow

### Cards & Panels
- **Standard**: 20-24px radius, 2-3px border, 4-6px shadow
- **Featured**: 24-28px radius, 2.5-3.5px border, 6-12px shadow

### Badges
- **Count badges**: 22x22, 2.5px border, centered
- **Level badges**: 22-24px radius, positioned top-right
- **Filter badges**: 16px radius, full-width padding

## 🎬 Animation System

### Timing
- **Quick interactions**: 80-150ms
- **Standard transitions**: 300-500ms
- **Elaborate animations**: 1000-2000ms+

### Effects
- **Spring animations**: tension 50-90, friction 4-5 (snappy, playful)
- **Fading**: opacity 0 → 1, linear timing
- **Scaling**: 0.5 → 1 (entrance), 0.93 → 1 (press)
- **Floating**: -6 to 0 over 900-1800ms (continuous loop)
- **Pulsing**: opacity 0.25 → 1 over 400ms (attention)

### Particle Effects
- **Merge glow**: Rainbow burst, 1000-1100ms duration
- **Score popup**: Rise + fade, particle sparkles
- **Combo labels**: Spring scale + fade, color-coded
- **Shockwave**: Expanding circle, 650ms total

## 📱 Responsive Design

### Device Considerations
- **Portrait-only**: All screens designed for portrait orientation
- **Safe areas**: Top and bottom insets respected
- **Scalability**: 1.5-2x scaling for larger tablets
- **Touch feedback**: Haptic feedback on button press (iOS)
- **Performance**: 60 FPS target, optimized animations

## ✨ Polish & Polish

### Visual Effects
- ✅ Glossy shadows on all interactive elements
- ✅ Color-coordinated glow effects
- ✅ Smooth spring animations
- ✅ Particle burst effects
- ✅ Smooth opacity transitions
- ✅ Depth layering (Z-axis clarity)

### Audio Cues (Future)
- ✅ Button press: Soft click
- ✅ Merge success: Satisfying chime
- ✅ Level complete: Victory fanfare
- ✅ Danger warning: Alert beep
- ✅ Background music: Calm, loopable

### User Feedback
- ✅ Button press scale animation
- ✅ Success animations on merge
- ✅ Danger line pulse warning
- ✅ Combo labels with colors
- ✅ Score popups
- ✅ Progress bar fill animation

## 🚀 Performance Targets

- **Initial load**: < 2 seconds
- **Frame rate**: 60 FPS (steady)
- **Memory**: < 100MB
- **Animation smoothness**: No jank
- **Touch response**: < 100ms

## 🎨 Art Direction Summary

**Aesthetic**: Premium cartoon merge game
**Target Audience**: Casual players (kids, families)
**Mood**: Playful, vibrant, encouraging
**Inspiration**: Merge Dragon, Merge Mansion, Match 3 games
**Quality Level**: AAA mobile game
**Style**: Modern, glossy, colorful

---

**Version**: 1.0  
**Last Updated**: July 7, 2026  
**Status**: ✅ Design complete and implemented
