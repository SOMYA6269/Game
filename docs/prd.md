# Requirements Document

## 1. Application Overview

**Application Name**: Dragon Merge Kingdom

**Description**: A premium mobile puzzle game featuring physics-based drop and merge gameplay with cute cartoon characters. Players drop magical eggs from the top, merge identical eggs into baby animals, and continue merging to create larger characters up to the ultimate Dragon King. The game features smooth 60 FPS animations, rich cartoon fantasy environments, and a bright colorful art style with high-quality cartoon assets.

**Platform**: Mobile App (React Native + Expo)

**Orientation**: Portrait 9:16

---

## 2. Target Users and Usage Scenarios

**Target Users**:
- Casual mobile game players
- Puzzle game enthusiasts
- Players who enjoy merge mechanics
- Fans of cute cartoon art style

**Core Usage Scenarios**:
- Playing quick puzzle sessions during breaks
- Collecting and evolving cartoon characters
- Progressing through world map levels
- Using boosters to achieve higher scores

---

## 3. Screen Structure and Functionality

### Screen Hierarchy

```
Dragon Merge Kingdom
├── Home Screen
├── Gameplay Screen
├── Collection Screen
├── World Map Screen
├── Daily Reward Screen
├── Shop Screen
├── Settings Screen
├── Level Complete Screen
├── Unlock Animation Screen
└── Merge Guide Screen
```

### 3.1 Home Screen

**Layout Elements**:
- Big \"DRAGON MERGE KINGDOM\" logo at top left with dragon icon
- Currency bar top-right: coins display (1560) with + button, gems display (260) with + button
- Full-screen cartoon fantasy background (castle, floating islands, blue sky, clouds, mountains, trees, rivers)
- Large green PLAY button center-right
- Bottom navigation bar with 5 icons: WORLD MAP, COLLECTION, DAILY REWARD, SHOP, SETTINGS

**Functionality**:
- Tap PLAY button to enter Gameplay Screen
- Tap + button next to coins to open Shop Screen (coins section)
- Tap + button next to gems to open Shop Screen (gems section)
- Tap WORLD MAP icon to open World Map Screen
- Tap COLLECTION icon to open Collection Screen
- Tap DAILY REWARD icon to open Daily Reward Screen
- Tap SHOP icon to open Shop Screen
- Tap SETTINGS icon to open Settings Screen

### 3.2 Gameplay Screen

**Core Gameplay**:
- Drop magical eggs from the top of the game board using follow-finger aiming with glowing dot aim line
- Eggs fall with smooth physics (60 FPS) and bounce on land
- When two identical eggs touch, they merge with explosion effect, screen shake, particles and floating score popup
- Merged objects trigger particles (stars, coins, sparkles)
- Characters have idle bounce animations
- Game board fills from bottom up
- When danger line is crossed for 3 seconds, game ends

**Top HUD Elements**: Pause button, BEST SCORE display, current score, coins counter, gems counter, level progress bar

**NEXT Piece Preview Panel**: Shows next dragon/egg character to drop, and \"then\" preview

**Game Board**: Wooden/premium frame, physics-based play area, danger line (red warning line near top)

**Aiming System**: Follow-finger aiming with glowing dot aim line

**Bottom Booster Bar**: UNDO, SHAKE, BOMB, MAGNET buttons with count badges

**Bottom Toolbar**: SHOP, COLLECTION, HOME, EVENT, SETTING icons

**Character System** (11 levels):
- Level 1: Leafy Egg (green)
- Level 2: Sky Egg (blue)
- Level 3: Candy Egg (purple)
- Level 4: Ember Egg (red)
- Level 5: Sunburst Egg (gold)
- Level 6: Sprout Dragon (green)
- Level 7: Aqua Dragon (cyan)
- Level 8: Blaze Dragon (orange)
- Level 9: Crystal Dragon (purple)
- Level 10: Solar Dragon (gold)
- Level 11: Rainbow Dragon (pink)

**Booster Functions**:
- UNDO: Reverses last drop
- SHAKE/FREEZE: Freezes time for 5 seconds
- BOMB: Removes top object with explosion animation
- MAGNET: Attracts nearby identical objects together

**Special Events**: Coin Rain, Double Score (2×), Freeze Time, Golden Dragon, Mystery Egg — triggered randomly during gameplay

### 3.3 Collection Screen
- Modal-style overlay showing all 11 dragons in 3-column grid
- Filter tabs: ALL, COMMON, RARE, LEGENDARY
- Shows lock icon if character is locked (levels 8+ locked initially)
- MERGE GUIDE section showing merge chain pairs

### 3.4 World Map Screen
- 8 themed kingdoms: Green Forest, Fire Mountain, Ice Kingdom, Sky Castle, Mystic Cave, Dragon Palace, Volcano World, Space Kingdom
- Floating islands connected by dotted path
- Star ratings (1-3) per level, locked/unlocked states
- Mission sidebar with 4 missions
- SPIN and RANK buttons (present but not functional in v1)
- Tap level island to select, tap PLAY to start

### 3.5 Daily Reward Screen
- 7-day cycle calendar showing daily login rewards (coins, gems, boosters)
- Achievements tab with 6 achievements
- Lucky Spin wheel with 8 prizes
- Claim daily rewards with animation

### 3.6 Shop Screen
- Grid layout with purchasable items
- Booster packs (UNDO, BOMB, MAGNET, FREEZE, RAINBOW)
- Coin packs (500, 2000, 6000 coins)
- Gem packs (free via ad, paid)
- Purchase confirmation and insufficient currency handling

### 3.7 Settings Screen
- Audio toggles: Background Music, Sound Effects, Haptic Feedback
- Gameplay toggles: Particle Effects, Daily Reminder
- Navigation links to all main screens
- Profile card showing dragon master name, best score, daily streak
- About section with Rate Us, Privacy Policy, Terms of Service
- Game version display

### 3.8 Level Complete Screen
- Final score with large numbers
- Coins earned and gems earned
- Star rating (1-3 stars)
- NEXT LEVEL, REPLAY, RETURN TO MAP buttons
- Celebration animation and particles

### 3.9 Unlock Animation Screen
- Full-screen animation when new character is unlocked
- Spotlight effect on unlocked character
- Particles and celebration effects
- CONTINUE button to dismiss

---

## 4. Game Rules and Logic

### Merge Mechanics
- Two identical level-N objects merge into one level-(N+1) object
- Merge progression follows 11-level character system
- Each merge increases score; consecutive merges trigger combo multipliers
- Level 11 (Rainbow Dragon) cannot merge further

### Physics Behavior
- Gravity-based falling at 60 FPS
- Mass-weighted collision resolution (4 passes)
- Objects bounce on floor and walls with damping
- Squash/stretch effects on impact

### Scoring System
- Points per merge based on character level (10 → 20 → 40 → 80 → 160 → 320 → 640 → 1280 → 2560 → 5120 → 10240)
- Double score multiplier available via special event
- Combo labels: Nice! (×2), Great! (×3), Awesome! (×5), Amazing! (×8), LEGENDARY! (×12)
- Best score saved and displayed

### Level Progression
- 8 levels with targets: 500, 1200, 2500, 4200, 6500, 10000, 15000, 22000 points
- Complete level to unlock next
- 1-3 stars based on score

### Booster System
- UNDO: removes last dropped object (3 initial uses)
- BOMB: removes topmost object (1 initial use)
- MAGNET: pulls matching-level objects together (1 initial use)
- FREEZE: stops physics for 5 seconds (2 initial uses)
- RAINBOW: merges any two top objects (1 initial use)

### Currency System
- Coins earned through gameplay; gems through achievements or purchase
- Used to buy boosters in Shop

### Game Over Condition
- Objects cross danger line and stay for 3 seconds → game ends

---

## 5. Edge Cases

| Scenario | Handling |
|----------|----------|
| Danger line crossed | 3-second countdown then game over |
| Booster count = 0 | Button greyed out, disabled |
| Player pauses | Physics paused, state saved |
| Insufficient currency | Insufficient message shown in Shop |
| Daily reward claimed | Show next available reward time |
| Tap outside modal | Modal stays open, only X closes |
| Rapid tapping | Tap cooldown prevents double actions |

---

## 6. Acceptance Criteria

1. Launch → Home Screen with logo, currency bar, fantasy background, PLAY button, bottom nav
2. Tap PLAY → Gameplay Screen with HUD, NEXT preview, wooden board, danger line, boosters, toolbar
3. Drop egg using finger aim → smooth physics and bounce animation
4. Drop identical egg → merge with explosion, screen shake, particles, score popup
5. Continue merging → progress through 11 character levels
6. Use SHAKE booster → freeze effect, count decreases by 1
7. Fill board to danger line → game over screen with score, coins, gems, star rating

---

## 7. Out of Scope for This Release

- Multiplayer/competitive modes
- Social features (leaderboards, friend invites)
- Video ads or rewarded video
- Cloud save sync across devices
- Seasonal events or limited-time challenges
- Character customization beyond the 11-level system
- Voice acting or full soundtrack
- Detailed tutorial/onboarding
- Push notifications
- Analytics integration
- Localization
- Accessibility features
- SPIN/RANK/EVENT functional implementation (buttons present but not functional)
- Mission system beyond display