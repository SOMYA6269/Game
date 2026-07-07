# Requirements Document

## 1. Application Overview

**Application Name**: Dragon Merge Kingdom

**Description**: A premium mobile puzzle game featuring physics-based drop and merge gameplay with cute cartoon characters. Players drop magical eggs from the top, merge identical eggs into baby animals, and continue merging to create larger characters up to the ultimate Dragon King. The game features smooth 60 FPS animations, rich cartoon fantasy environments, and a bright colorful art style with high-quality cartoon assets.

**Platform**: Mobile App (React Native + Expo)

**Orientation**: Portrait 9:16

**Reference Image**: https://miaoda-conversation-file.s3cdn.medo.dev/user-cqrbqbt621vk/app-cuhcy5wjz3lt/20260707/1000090006.png (exact visual reference for UI design)

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

**Visual Style**:
- Bright, colorful, soft, friendly and magical atmosphere
- Rich environments with depth and details using layered backgrounds
- Smooth transitions when tapping buttons

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

**Top HUD Elements**:
- Pause button (top left)
- BEST SCORE display and current score display (top center)
- Coins counter (top right)
- Gems counter (top right)

**NEXT Piece Preview Panel**:
- Located at top left
- Shows next dragon/egg character to drop
- Displays character emoji and visual

**Game Board**:
- Wooden/premium frame with cartoon style
- Physics-based play area
- Danger line (red warning line near top of board)
- Full-screen cartoon fantasy background visible behind board

**Aiming System**:
- Follow-finger aiming with glowing dot aim line
- White dotted line from top showing drop trajectory

**Bottom Booster Bar**:
- UNDO button with count badge
- SHAKE button with count badge
- BOMB button with count badge
- MAGNET button with count badge
- All buttons large and touch friendly with bright colors and soft shadows

**Bottom Toolbar**:
- SHOP icon
- COLLECTION icon
- HOME icon
- EVENT icon
- SETTING icon

**Core Gameplay**:
- Drop magical eggs from the top of the game board
- Eggs fall with smooth physics and bounce on land
- When two identical eggs touch, they merge with explosion effect and screen shake
- Merged objects trigger particles (stars, coins, sparkles)
- Floating score and combo text popups appear during merges
- Characters have idle bounce animations
- Game board fills from bottom up
- When danger line is crossed, game ends

**Character System** (11 levels):
- Level 1: Penguin egg (green)
- Level 2: Bunny (blue)
- Level 3: Piggy (pink)
- Level 4: Fox (orange)
- Level 5: Dino (green)
- Level 6: Cat (pink)
- Level 7: Hamster (brown)
- Level 8: Panda (black/white)
- Level 9: Koala (grey)
- Level 10: Dragon baby (blue)
- Level 11: Dragon king (gold)

**Visual Style**:
- Cute cartoon characters with big eyes
- High quality cartoon fantasy world
- Smooth 60 FPS animations
- Character animations: idle bounce, merge pop, bounce on land
- Particles and effects on every merge
- Bright colors and magical atmosphere

### 3.3 Collection Screen

**Layout**:
- Modal-style wooden panel overlay on top of current screen
- Header: \"COLLECTION\" title with X close button (top right)
- Filter tabs below header: ALL, COMMON, RARE, LEGENDARY
- 3-column grid of cartoon character cards
- MERGE GUIDE section at bottom showing merge chain (small + small = bigger)

**Character Cards**:
- Display character emoji/visual
- Show character name label below
- Show lock icon if character is locked
- Characters include: penguin, bunny, piggy, fox, dino, cat, hamster, panda, koala, dragon baby, dragon king

**Functionality**:
- Tap filter tabs to filter characters by rarity
- Tap character card to view details
- Tap X button to close and return to previous screen
- Smooth open/close modal animations

### 3.4 World Map Screen

**Layout Elements**:
- Floating islands connected by dotted path
- Level numbers displayed on islands (17, 18, 19, 20, 21...)
- Mission sidebar with missions list
- SPIN button
- RANK button
- Current level highlighted with player dragon character
- Bottom: large PLAY LEVEL [number] button

**Visual Style**:
- Blue sky background with clouds
- Floating islands with trees and nature elements
- Depth using layers for parallax feel
- Magical and lively atmosphere

**Functionality**:
- Tap level island to select level
- Tap PLAY LEVEL button to start selected level
- Tap SPIN button to access spin feature
- Tap RANK button to view rankings
- View mission list in sidebar
- Scroll to view more levels

### 3.5 Daily Reward Screen

**Functionality**:
- Display daily login rewards calendar
- Show reward items (coins, gems, boosters)
- Allow player to claim daily rewards
- Display next available reward time if already claimed
- Show reward collection animation when claimed

### 3.6 Shop Screen

**Functionality**:
- Display purchasable items in grid layout
- Show coin packs with prices
- Show gem packs with prices
- Show booster packs with prices
- Allow player to purchase items
- Display purchase confirmation
- Show insufficient currency message if needed

### 3.7 Settings Screen

**Functionality**:
- Adjust sound volume slider
- Adjust music volume slider
- Toggle notifications switch
- View game version number
- Access help/tutorial button
- Logout option

### 3.8 Level Complete Screen

**Layout Elements**:
- Display final score with large numbers
- Show coins earned with coin icon
- Show gems earned with gem icon
- Display star rating (1-3 stars based on score)
- Show NEXT LEVEL button
- Show REPLAY button
- Show RETURN TO MAP button

**Visual Style**:
- Celebration animation and particles
- Bright colorful panel with rounded corners
- Large touch-friendly buttons

**Functionality**:
- Tap NEXT LEVEL to proceed to next level
- Tap REPLAY to restart current level
- Tap RETURN TO MAP to go back to World Map Screen

### 3.9 Unlock Animation Screen

**Functionality**:
- Play full-screen animation when new character is unlocked
- Display unlocked character with spotlight effect
- Show character name and description
- Show particles and celebration effects
- Show CONTINUE button to dismiss

### 3.10 Merge Guide Screen

**Functionality**:
- Display complete merge chain from Level 1 to Level 11
- Show visual representation: small + small = bigger
- Display all character evolution stages
- Show locked and unlocked evolutions
- Accessible from Collection Screen

---

## 4. Game Rules and Logic

### Merge Mechanics
- Two identical eggs merge into one baby animal
- Two identical animals merge into one larger animal
- Merge progression follows 11-level character system
- Each merge increases score
- Consecutive merges trigger combo multipliers with floating text popups

### Physics Behavior
- Eggs and characters fall with gravity at 60 FPS
- Objects bounce when hitting surfaces or other objects
- Smooth physics simulation with optimized rendering
- Characters have squash and stretch effects on impact
- Objects settle naturally in the game board

### Scoring System
- Points awarded for each merge
- Higher-level characters award more points
- Combo merges multiply score with visual feedback
- Final score determines star rating (1-3 stars)
- Best score is saved and displayed

### Booster Functions
- UNDO: Reverses last drop, consumes one use, count badge decreases
- SHAKE: Shakes game board to rearrange objects, consumes one use, count badge decreases
- BOMB: Removes selected object with explosion animation, consumes one use, count badge decreases
- MAGNET: Attracts nearby identical objects together, consumes one use, count badge decreases
- Each booster has limited uses shown in count badge
- Booster button becomes disabled when count reaches zero

### Level Progression
- Complete levels to unlock new levels on World Map
- Earn 1-3 stars based on score achieved
- Unlock new character types as player progresses
- Current level is highlighted on World Map

### Currency System
- Coins earned through gameplay and level completion
- Gems earned through special achievements or purchases
- Currencies displayed in top-right corner of Home Screen and Gameplay Screen
- Tap + button to purchase more coins or gems in Shop
- Currencies used to purchase boosters and items in Shop

### Game Over Condition
- Game ends when objects cross the danger line (red warning line near top)
- Level Complete Screen appears showing final score and rewards

---

## 5. Edge Cases and Exceptions

| Scenario | Handling |
|----------|----------|
| Game board crosses danger line | Game ends, show Level Complete Screen with final score |
| Booster count reaches zero | Booster button becomes disabled and greyed out |
| No valid merge available | Player can continue dropping or use boosters to rearrange |
| Player pauses during gameplay | Game state is saved, timer stops, physics paused |
| Player exits app during gameplay | Game state is saved, resume on return to Gameplay Screen |
| Network connection lost | Game continues offline, sync when reconnected |
| Insufficient coins/gems for purchase | Display insufficient currency message in Shop |
| Daily reward already claimed | Show next available reward time on Daily Reward Screen |
| Player taps outside modal | Modal remains open, only X button closes modal |
| Rapid tapping on buttons | Implement tap cooldown to prevent double actions |

---

## 6. Acceptance Criteria

1. Launch app and view Home Screen with \"DRAGON MERGE KINGDOM\" logo, currency bar, full-screen cartoon fantasy background, green PLAY button, and bottom navigation bar
2. Tap PLAY button to enter Gameplay Screen with top HUD, NEXT piece preview, wooden game board, danger line, bottom booster bar, and bottom toolbar
3. Drop a penguin egg from the top using follow-finger aiming with glowing dot aim line, observe smooth physics and bounce animation
4. Drop another identical penguin egg to trigger merge with explosion effect, screen shake, particles, and floating score popup
5. Continue merging to progress through character levels (bunny, piggy, fox, dino, cat, hamster, panda, koala, dragon baby, dragon king)
6. Use SHAKE booster from bottom bar, observe game board shake animation and count badge decrease by 1
7. Fill game board until objects cross danger line, triggering Level Complete Screen with final score, coins earned, gems earned, and star rating

---

## 7. Out of Scope for This Release

- Multiplayer or competitive modes
- Social features (leaderboards, friend invites, sharing)
- In-game chat or messaging
- Video ads or rewarded video system
- Cloud save synchronization across devices
- Seasonal events or limited-time challenges
- Character customization or skins beyond the 11-level system
- Background music composition (placeholder music acceptable)
- Voice acting or sound effects recording (placeholder sounds acceptable)
- Detailed tutorial or onboarding flow
- Achievement system beyond level completion
- Push notifications
- Analytics integration
- Localization to other languages
- Accessibility features (colorblind mode, screen reader support)
- Performance optimization for low-end devices
- SPIN feature functionality (button present but not functional)
- RANK feature functionality (button present but not functional)
- EVENT feature functionality (icon present but not functional)
- Mission system functionality (sidebar present but not functional)
- Rarity system implementation (filter tabs present but all characters treated equally)