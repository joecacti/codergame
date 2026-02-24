# Pirates of the Coderbbean: The First Byte

## Development Specification

---

## Overview

A browser-based educational game that teaches programming concepts (variables, IF/ELSE, loops, functions, arrays, debugging) through a pirate adventure. Kids ages 8–12 play through levels where game mechanics ARE programming concepts — no lectures, no quizzes.

**Stack:** React + Vite  
**Target:** Modern browsers, Chromebooks, tablets  
**Play time:** 10–15 minutes per run

---

## Screens & Flow

```
Login Screen → Level 1 (Build Your Ship) → Level 2 (First Sail) → Leaderboard
                                                                  ↑
                                                          Admin Dashboard
```

---

## Screen 1: Login

### Layout
- Centered card on dark ocean background
- Captain emoji (🏴‍☠️) splashing in water above the card (SVG animation)
- Title: "Pirates of the Coderbbean — The First Byte"
- Initials input field
- "Set Sail" button
- "Admin Login" button below a divider

### Behavior
- Input accepts 2–3 uppercase letters only (auto-capitalizes, strips non-alpha)
- Validation: minimum 2 characters, show inline error if less
- As user types, a **live ship preview** renders below the card showing their initials on the hull in gold text
- "Set Sail" button is disabled/dimmed until 2+ characters entered
- On submit → navigate to Level 1
- "Admin Login" → navigate to Admin Dashboard

### Data
```
playerInitials: string (2-3 uppercase letters)
```

---

## Screen 2: Level 1 — Build Your Ship

### Concept Taught
**Variables** — named storage that holds values (HP, gold, crew count, etc.)

### Layout (3-column)

| Left Column (195px) | Center (flex) | Right Column (210px) |
|---|---|---|
| Code Toolbox | Ship Visual (SVG) | Drop Zones |
| Draggable code blocks | Animated ship building | 4 labeled slots |

**Above columns:**
- Header bar: game title, captain name + initials, level label
- Progress bar: X/4 parts placed
- Captain message bar: contextual dialogue in italics

**Below columns:**
- Action buttons: "Launch Ship!" / "Try Again" / "Set Sail → Level 2"

### Code Toolbox (Left)
Contains 8 draggable code blocks — 4 correct, 4 distractors:

**Correct blocks:**
```javascript
let hull = "oak"
let sails = 3
let crew = 12
let anchor = true
```

**Distractor blocks (wrong values):**
```javascript
let hull = 0
let sails = "fish"
let crew = -5
let anchor = "maybe"
```

- Blocks are shuffled randomly on load and after each reset
- Each block shows a drag handle icon (⠿) on the left
- Blocks are styled as dashed-border cards with monospace font
- When dragging, the block highlights blue
- When a block is placed in a slot, it disappears from the toolbox
- When a block is returned (wrong answer or manual remove), it reappears

### Ship Visual (Center)
SVG illustration, viewBox `0 0 100 100`:

**Empty state (no parts placed):**
- Sky gradient top half, ocean gradient bottom half
- Captain (🏴‍☠️) emoji at water line with "SPLASH!" text and bubble circles
- Text: "Build me a ship, quick!"

**As parts are placed correctly:**
- `hull` → Brown polygon ship hull appears with player initials in gold on the side
- `sails` → Mast extends, two sail polygons unfurl (white triangles)
- `crew` → 3 small pirate emojis appear on deck
- `anchor` → Anchor emoji appears at bow
- Captain emoji stands on deck when hull exists

**Wave animation:** Wavy path at water line, white stroke, low opacity

### Drop Zones (Right)
4 labeled slots, one per ship part:

| Slot | Label | Accepts |
|---|---|---|
| hull | 🛟 Hull | Any block containing "hull" |
| sails | ⛵ Sails | Any block containing "sails" |
| crew | 👥 Crew | Any block containing "crew" |
| anchor | ⚓ Anchor | Any block containing "anchor" |

**Slot states:**
- **Empty:** Dashed border, placeholder text `[ drop hull code here ]`
- **Empty + dragging:** Blue dashed border, light blue background
- **Filled correct:** Green dashed border, green text, green tinted background
- **Filled wrong:** Red dashed border briefly (shake animation), then triggers sink sequence
- **Click to remove:** Clicking a filled slot (before launch) returns the block to toolbox

Below drop zones: **Concept Tracker** showing `🔒 Variables` (unlocks to `✅ Variables` on success)

### Interactions

#### Drag & Drop
1. Player drags a code block from toolbox
2. Drops it on a matching slot (block must contain the slot name, e.g. "sails" block → sails slot)
3. If dropped on wrong slot type → captain message: "That's for a different part!"
4. Block snaps into slot, disappears from toolbox

#### Correct Block Dropped
- Ship part appears on the SVG with fade-in animation
- **Confetti cannon fires** — particle effect (colored rectangles, physics-based, ~2 second duration)
- Captain says encouraging message (e.g. "Solid oak hull! 💪")
- Drop zone border turns green

#### Wrong Block Dropped (ship exists)
Full sink sequence — 6 stages, ~7 seconds total:

| Stage | Time | Visual | Captain Says |
|---|---|---|---|
| 1 | 0s | Ship tilts 8° | Funny message about the wrong value |
| 2 | 1s | Ship cracks in two, debris flies | "She's cracking apart! 💥" |
| 3 | 2s | Ship sinks, bubbles rise | "She's going down! 🫧" |
| 4 | 3s | Captain swimming in water | "Captain overboard! SWIM! 🏊" |
| 5 | 4.2s | Shark fin approaches captain | "Is that a... FIN?! 😱" |
| 6 | 5.4s | Shark eats captain, "burp" text | "CHOMP! 🦈 Bad code sinks ships!" |

After stage 6 (7s): **Full reset** — all slots cleared, toolbox reshuffled, start over.

#### Wrong Block Dropped (no ship yet)
- Block bounces back to toolbox after 1.5s
- Captain message: "Not right! Try another block!"
- No sink animation (nothing to sink)

#### Launch Ship Button
- Only enabled when all 4 slots are filled
- **All correct:** Grand confetti (3 simultaneous bursts), success state, Variables badge unlocks
- **Any wrong:** Full 6-stage sink + shark sequence, then shows error breakdown:
  - Lists each wrong block with ✗ marker
  - Shows the correct block with ✓ marker
  - "Try Again" button to reset

#### Success State
- Ship visual shows celebration: crew cheering, full sails, confetti
- Green banner: "🎉 Variables Unlocked!"
- Message: "Captain [INITIALS], you used variables to build a ship!"
- "Set Sail → Level 2" button appears

### Funny Messages per Wrong Block

| Wrong Block | Captain Says |
|---|---|
| `let sails = "fish"` | "Fish for sails?! 🐟 Not how boats work!" |
| `let hull = 0` | "A hull of ZERO? She'll sink instantly!" |
| `let crew = -5` | "Negative five crew? Less than nobody! 😂" |
| `let anchor = "maybe"` | "\"Maybe\" won't hold us in place!" |

### Confetti System
- Particle effect using SVG rectangles
- Physics: random velocity (vx, vy), gravity simulation, rotation
- Colors: gold, red, green, blue, purple, orange, pink
- ~30-50 particles per burst
- 2 second lifetime, fade out via opacity
- Fires from approximate cannon position on ship

---

## Screen 3: Level 2 — First Sail

### Concept Taught
**IF/ELSE** — conditional logic (check a condition, take different actions)

### Layout

**Top section (same as Level 1):**
- Header bar with title, captain name, level label
- Score bar: X/5 with progress fill
- Captain message bar

**Center: Ocean View (360px tall)**
- Top-down perspective ocean (blue gradient background)
- Horizontal wave lines (SVG paths, white, low opacity)
- Player's ship at bottom center with initials on hull
- Obstacles appear and approach from top

**Below ocean:**
- Code challenge panel (appears when obstacle arrives)
- Win state panel (after reaching 5 points)

### Obstacle Pool (8 types, 5 randomly selected per game)

| Emoji | Name | Position | Correct Answer |
|---|---|---|---|
| 🪨 | Rock | left | `"right"` |
| 🌀 | Whirlpool | right | `"left"` |
| 🧊 | Iceberg | left | `"right"` |
| 🐙 | Kraken Tentacle | right | `"left"` |
| 🏴‍☠️ | Enemy Ship | left | `"right"` |
| ⚡ | Storm | right | `"left"` |
| 🌊 | Giant Wave | left | `"right"` |
| 🦈 | Shark Pack | right | `"left"` |

### Game Loop

```
SAILING (2s pause) → CHALLENGE (obstacle appears, show code) → ANSWER
  ↓                                                              ↓
  ← ← ← ← ← ← ← CORRECT (+1 point, dodge animation) ← ← ← ← ←
  ← ← ← ← ← ← ← WRONG (crash animation, no point) ← ← ← ← ← ←
```

Repeat until score reaches 5.

### Code Challenge Panel
Appears below the ocean when an obstacle arrives.

**Structure:**
```
⚠️ [emoji] [Name] ahead! Complete the code:

┌─────────────────────────────────────┐
│ if (obstacle === "[name]") {        │
│   ship.steer(___)                   │
│ }                                   │
└─────────────────────────────────────┘

[ "right" ]  [ "left" ]  [ "stop" ]     ← 3 clickable buttons
```

- Code displayed in monospace, dark background, cyan text
- 3 answer buttons displayed in a row, equal width
- Only one answer is correct (steers AWAY from the obstacle)
- Buttons disable after selection

**Answer feedback:**
- Correct: button gets green border, "✅ Correct! Steering [direction]!" text
- Wrong: button gets red border, correct answer highlighted green, error message shown

### Correct Answer Flow
1. Ship slides left or right (CSS transition on `left` property, 0.8s ease)
2. Confetti fires
3. Captain says "Nice dodge! 🎉"
4. After 1.5s: score increments, ship returns to center, next obstacle queued

### Wrong Answer Flow (Crash)
3-stage crash animation, ~3.5 seconds:

| Stage | Time | Visual |
|---|---|---|
| 1 | 0s | 💥 explosion emoji at ship position |
| 2 | 0.8s | 🫧 bubbles + "CRASH!" text |
| 3 | 1.6s | 🔧 wrench + "Repairing..." text |

After 3.5s: crash clears, next obstacle queued, score unchanged.

### Ship Visual
SVG, smaller than Level 1 (80x66px):
- Hull polygon with player initials in gold
- Mast + sails
- Captain emoji on deck
- Positioned at bottom of ocean view
- `left` property animated for dodging (default 50%, dodge to 35% or 65%)

### Win State (5 points)
- Ship replaced with 🏆 trophy emoji
- "LEVEL COMPLETE!" text
- Green panel below ocean:
  - "🎉🏆🎉 IF/ELSE Unlocked!"
  - "Captain [INITIALS], you navigated 5 obstacles using conditional logic!"
  - Badge row: `✅ Variables` `✅ IF/ELSE` `🔒 Loops`
  - "View Leaderboard" button

---

## Screen 4: Admin Dashboard

### Access
- Via "Admin Login" button on login screen
- Via "View Leaderboard" button on Level 2 win screen

### Layout

**Header:** "🔑 Admin Dashboard" with back button

**Stats Row (3 cards):**

| Card | Value | Icon |
|---|---|---|
| Total Students | count | 👥 |
| Avg Level | calculated | 📊 |
| Avg Badges | calculated | 🏅 |

**Leaderboard Table:**

| Rank | Ship | Captain | Level | Badges | Time |
|---|---|---|---|---|---|
| 🥇/🥈/🥉/#N | Mini ship SVG with initials | "Captain [XX]" | Level N | X/6 badge | MM:SS |

- Sorted by badges (desc), then level (desc)
- Top row gets gold background tint
- Each row shows a tiny ship SVG with that player's initials

**Concept Mastery Section:**
Progress bars for each concept:

| Concept | Example % | Color Logic |
|---|---|---|
| Variables | 95% | Green (>70%) |
| IF/ELSE | 80% | Green |
| Loops | 65% | Yellow (40-70%) |
| Functions | 50% | Yellow |
| Arrays | 30% | Red (<40%) |
| Debugging | 70% | Yellow |

---

## Design System

### Colors

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0a1628` | Page background |
| `--bg-secondary` | `#1a2a4a` | Gradient end |
| `--gold` | `#fbbf24` | Titles, accents, captain text |
| `--gold-dark` | `#f59e0b` | Button gradients |
| `--green` | `#22c55e` | Success states |
| `--red` | `#ef4444` | Error states |
| `--blue` | `#4a90d9` | Interactive/drag states |
| `--cyan` | `#a5f3fc` | Code text |
| `--text` | `#e2e8f0` | Body text |
| `--text-muted` | `#888` | Secondary text |
| `--border` | `rgba(255,255,255,0.1)` | Borders |
| `--panel` | `rgba(0,0,0,0.3)` | Panel backgrounds |

### Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Titles | Georgia, serif | 16-28px | 700 |
| Body | System font stack | 12-14px | 400 |
| Code | 'Courier New', monospace | 11-13px | 400 |
| Labels | System font | 10-11px | 600, uppercase, letter-spacing: 1px |
| Captain dialogue | Georgia, serif, italic | 13px | 400 |

### Ship Colors (SVG)
- Hull: `#8B4513` fill, `#5C2E00` stroke
- Mast: `#5C2E00`
- Sails: `#fff` / `#ffe` with `#ddd` stroke
- Initials on hull: `#fbbf24`, bold, Georgia serif
- Sky gradient: `#87CEEB` → `#b6e3f4`
- Sea gradient: `#2980b9` → `#1a5276`

### Animations

| Animation | Duration | Easing |
|---|---|---|
| Confetti burst | 2s | Physics-based (gravity) |
| Ship part appear | 0.4s | Fade in |
| Wrong block shake | 0.4s | translateX oscillation |
| Ship dodge (L2) | 0.8s | ease |
| Sink sequence | 7s total | Staged timeouts |
| Crash sequence (L2) | 3.5s total | Staged timeouts |
| Progress bar fill | 0.4-0.5s | CSS transition |

---

## State Management

### Global State
```javascript
{
  screen: "login" | "level1" | "level2" | "admin",
  playerInitials: string
}
```

### Level 1 State
```javascript
{
  toolbox: string[],           // available code blocks
  slots: {                     // what's in each drop zone
    hull: string | null,
    sails: string | null,
    crew: string | null,
    anchor: string | null
  },
  dragging: string | null,     // currently dragged block
  wrongSlot: string | null,    // slot that just got wrong answer (for shake)
  miniSink: number,            // 0-6, sink animation stage on wrong drop
  failState: number,           // 0-6, sink animation stage on launch fail
  successState: boolean,
  launched: boolean,
  msg: string,                 // captain dialogue
  confetti: Array<{id, x, y}> // active confetti bursts
}
```

### Level 2 State
```javascript
{
  score: number,               // 0-5
  obstacleIdx: number,         // which obstacle we're on
  phase: "sailing" | "challenge" | "dodging" | "crash" | "win",
  shipX: number,               // 0-100, horizontal position
  selected: number | null,     // which answer button was clicked
  feedback: string,            // answer feedback text
  obstacles: Obstacle[],       // shuffled array of 5 obstacles
  crashState: number,          // 0-3, crash animation stage
  msg: string,
  confetti: Array<{id, x, y}>
}
```

---

## File Structure (Vite + React)

```
pirates-game/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx              ← Router (login/level1/level2/admin)
│   ├── components/
│   │   ├── Confetti.jsx
│   │   ├── ShipVisual.jsx
│   │   ├── LoginScreen.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── Level1.jsx
│   │   └── Level2.jsx
│   └── data/
│       ├── codeBlocks.js    ← CORRECT, DISTRACTORS constants
│       └── obstacles.js     ← Obstacle pool for Level 2
```

---

## Setup Instructions

```bash
# Create project
npm create vite@latest pirates-game -- --template react
cd pirates-game
npm install

# Paste the game code into src/App.jsx
# (single-file version works — split into components later)

# Run dev server
npm run dev
# → opens at http://localhost:5173

# Build for production
npm run build
# → outputs to dist/ folder, deploy anywhere (Vercel, Netlify, GitHub Pages)
```

---

## Future Levels (Not Yet Built)

| Level | Concept | Mechanic |
|---|---|---|
| 3 | Loops | Combat rounds — WHILE loop battles against enemies |
| 4 | Functions | Reusable pirate skills — askRiddle(enemy) works on any enemy |
| 5 | Arrays | Treasure chests — pick by index (chests[0], chests[1], chests[2]) |
| 6 | Debugging | Puzzle with intentional errors — step through and fix |

**Planned features:**
- Code Sandbox Mode — write pseudocode to create your own rooms
- Classroom Mode — teacher dashboard tracking concept mastery per student
- Chapter 2: The Kraken's Nest — nested loops, string operations, boss fight
