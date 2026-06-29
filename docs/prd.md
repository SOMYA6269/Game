# Requirements Document

## 1. Application Overview

**Application Name**: Cute Dragon Merge Kingdom

**Description**: A premium mobile puzzle game featuring physics-based drop and merge gameplay with cute original dragon characters. Players drop magical dragon eggs from the top, merge identical eggs into baby dragons, and continue merging to create larger dragons. The game features smooth physics, satisfying merge effects, and a Disney/Pixar-inspired art style with 100% original artwork.

**Platform**: Mobile App (React Native + Expo)

**Orientation**: Portrait 9:16

**Reference Image**: https://miaoda-conversation-file.s3cdn.medo.dev/user-cqrbqbt621vk/app-cuhcy5wjz3lt/20260707/1000090006.png (for layout reference only)

---

## 2. Target Users and Usage Scenarios

**Target Users**:
- Casual mobile game players
- Puzzle game enthusiasts
- Players who enjoy merge mechanics
- Fans of cute cartoon art style

**Core Usage Scenarios**:
- Playing quick puzzle sessions during breaks
- Collecting and evolving dragon characters
- Progressing through world map levels
- Using boosters to achieve higher scores

---

## 3. Screen Structure and Functionality

### Screen Hierarchy

```
Cute Dragon Merge Kingdom
├── Main Game Screen
├── Collection Book Screen
├── World Map Screen
├── Daily Rewards Screen
├── Shop Screen
├── Settings Screen
├── Level Complete Screen
├── Unlock Animation Screen
└── Character Evolution Tree Screen
```

### 3.1 Main Game Screen

**Layout Elements**:
- Large premium wooden game container in center
- White dotted aiming line from top
- Next character preview card
- Large score panel centered at top
- Coin counter
- Gem counter
- Pause button
- Settings button
- Bottom booster toolbar with 4 buttons

**Core Gameplay**:
- Drop magical dragon eggs from the top of the game board
- Eggs fall with physics-based bouncing behavior
- When two identical eggs touch, they merge into a baby dragon
- When two identical dragons touch, they merge into a larger dragon
- Merged objects trigger explosion effects with combo animations and soft particle effects
- Game board is a dark purple play area within wooden frame
- Physics objects interact with smooth squash and stretch animations
- Glowing merge effects and sparkles appear during merges

**UI Components**:
- Score panel displays current score
- Coin counter shows available coins
- Gem counter shows available gems
- Next character preview shows upcoming egg/dragon to drop
- Aiming line helps player position drop location
- Pause button pauses gameplay
- Settings button opens Settings Screen

**Bottom Booster Toolbar**:
- Undo button (with count badge showing remaining uses)
- Shake button (with count badge showing remaining uses)
- Bomb button (with count badge showing remaining uses)
- Magnet button (with count badge showing remaining uses)

**Character Types** (100% original dragons):
- Green dragon
- Blue dragon
- Purple dragon
- Red dragon
- Golden dragon
- Pink dragon
- Each dragon has unique horns, wings, eyes, and expressions

**Art Style Elements**:
- Disney/Pixar-inspired quality with 100% original artwork
- Bright fantasy world background
- Cute baby dragons
- Magical eggs
- Soft lighting
- Pastel backgrounds
- Floating islands
- Castle scenery
- Clouds
- Nature elements
- Happy atmosphere

**UI Style**:
- AAA mobile casual game quality
- Rounded glossy buttons
- Soft shadows
- Modern gradients
- Cute cartoon icons
- High readability
- Premium spacing
- Professional mobile UX

### 3.2 Collection Book Screen

**Functionality**:
- Display all dragon characters in the game
- Show locked and unlocked dragons
- Display dragon evolution stages
- Show dragon details when tapped

### 3.3 World Map Screen

**Functionality**:
- Display game levels in a map format
- Show completed and locked levels
- Allow player to select available levels
- Display level progress

### 3.4 Daily Rewards Screen

**Functionality**:
- Display daily login rewards
- Show reward calendar
- Allow player to claim daily rewards
- Display reward items (coins, gems, boosters)

### 3.5 Shop Screen

**Functionality**:
- Display purchasable items
- Show coin packs
- Show gem packs
- Show booster packs
- Allow player to purchase items
- Display prices

### 3.6 Settings Screen

**Functionality**:
- Adjust sound volume
- Adjust music volume
- Toggle notifications
- View game version
- Access help/tutorial
- Logout option

### 3.7 Level Complete Screen

**Functionality**:
- Display final score
- Show coins earned
- Show gems earned
- Display star rating
- Show next level button
- Show replay button
- Show return to map button

### 3.8 Unlock Animation Screen

**Functionality**:
- Play animation when new dragon is unlocked
- Display unlocked dragon character
- Show dragon name and description
- Show continue button

### 3.9 Character Evolution Tree Screen

**Functionality**:
- Display dragon evolution paths
- Show merge combinations
- Display all evolution stages
- Show locked and unlocked evolutions

---

## 4. Game Rules and Logic

### Merge Mechanics
- Two identical eggs merge into one baby dragon
- Two identical baby dragons merge into one larger dragon
- Merge progression follows evolution tree
- Each merge increases score
- Consecutive merges trigger combo multipliers

### Physics Behavior
- Eggs and dragons fall with gravity
- Objects bounce when hitting surfaces or other objects
- Smooth physics simulation with squash and stretch effects
- Objects settle naturally in the game board

### Scoring System
- Points awarded for each merge
- Higher-level dragons award more points
- Combo merges multiply score
- Final score determines level completion rating

### Booster Functions
- Undo: Reverses last drop, consumes one use
- Shake: Shakes game board to rearrange objects, consumes one use
- Bomb: Removes selected object, consumes one use
- Magnet: Attracts nearby identical objects, consumes one use
- Each booster has limited uses shown in count badge

### Level Progression
- Complete levels to unlock new levels on World Map
- Earn stars based on score achieved
- Unlock new dragon types as player progresses

### Currency System
- Coins earned through gameplay
- Gems earned through special achievements or purchases
- Currencies used to purchase boosters and items in Shop

---

## 5. Edge Cases and Exceptions

| Scenario | Handling |
|----------|----------|
| Game board is full | Game ends, show Level Complete Screen |
| Booster count reaches zero | Booster button becomes disabled |
| No valid merge available | Player can continue dropping or use boosters |
| Player pauses during gameplay | Game state is saved, timer stops |
| Player exits app during gameplay | Game state is saved, resume on return |
| Network connection lost | Game continues offline, sync when reconnected |
| Insufficient coins/gems for purchase | Display insufficient currency message |
| Daily reward already claimed | Show next available reward time |

---

## 6. Acceptance Criteria

1. Launch app and view Main Game Screen with wooden game container, score panel, coin/gem counters, and bottom booster toolbar
2. Drop a magical dragon egg from the top using the white dotted aiming line
3. Drop another identical egg to trigger merge into baby dragon with explosion effect and particle animations
4. Continue merging identical dragons to create larger dragons with smooth physics and glowing effects
5. Use one booster from the bottom toolbar (Undo/Shake/Bomb/Magnet) and observe count badge decrease
6. Fill the game board until no more drops are possible, triggering Level Complete Screen with final score and rewards

---

## 7. Out of Scope for This Release

- Multiplayer or competitive modes
- Social features (leaderboards, friend invites, sharing)
- In-game chat or messaging
- Video ads or rewarded video system
- Cloud save synchronization across devices
- Seasonal events or limited-time challenges
- Character customization or skins
- Background music composition (placeholder music acceptable)
- Voice acting or sound effects recording (placeholder sounds acceptable)
- Tutorial or onboarding flow
- Achievement system
- Push notifications
- Analytics integration
- Localization to other languages
- Accessibility features (colorblind mode, screen reader support)
- Performance optimization for low-end devices