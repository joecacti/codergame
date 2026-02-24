# Pirates of the Coderibbean - Project Breakdown

> An educational browser game teaching kids (ages 8-12) programming concepts through pirate adventures.
> Built with **Vue 3 + Vite**. Runs in the browser. ~10-15 min per play session.

---

## Game Flow

```
LOGIN  ──>  LEVEL 1: Build Your Ship  ──>  LEVEL 2: First Sail  ──>  LEADERBOARD
 (initials)    (teaches VARIABLES)          (teaches IF/ELSE)        (admin view)
```

---

## Screens

### 1. Login Screen
- Enter 2-3 letter initials (auto-capitalized)
- Live ship preview with your initials on the hull
- Returning players see their rank
- Admin button for teacher dashboard

### 2. Level 1 - "Build Your Ship" (Variables)

**Goal:** Drag the correct code blocks into 4 ship part slots to build your ship.

**Build Order:** Hull > Sails > Crew > Anchor (must go in order)

| Slot       | Correct Code           | Type    |
|------------|------------------------|---------|
| Hull       | `let hull = "oak"`     | String  |
| Sails      | `let sails = 3`        | Number  |
| Crew       | `let crew = 12`        | Number  |
| Anchor     | `let anchor = true`    | Boolean |

**Distractors (wrong blocks):**

| Bad Code               | Funny Message                              |
|------------------------|--------------------------------------------|
| `let sails = "fish"`   | "Fish for sails?! Not how boats work!"     |
| `let hull = 0`         | "A hull of ZERO? She'll sink instantly!"   |
| `let crew = -5`        | "Negative five crew? Less than nobody!"    |
| `let anchor = "maybe"` | "'Maybe' won't hold us in place!"          |

**What happens:**
- **Correct drop** > Ship part appears, confetti, +10 XP (+5 bonus for first try)
- **Wrong drop (ship already built)** > 7-second sink sequence:
  1. Ship tilts
  2. Ship cracks in two
  3. Ship sinks with bubbles
  4. Captain swimming
  5. Shark fin appears
  6. CHOMP! Shark eats captain
  7. Full reset - try again
- **All 4 correct + Launch** > Victory! Triple confetti burst, "Variables Unlocked!" badge, +50 XP

**Panels:** Variable Watch (shows current values), Code Explainer (breaks down syntax), Hint Button (costs 5 XP), 7-step Tutorial

---

### 3. Level 2 - "First Sail" (IF/ELSE)

**Goal:** Navigate 5 random obstacles by completing code challenges correctly.

**Each obstacle has 3 phases:**
1. **Prediction** - Logic warm-up question (Yes/No)
2. **Challenge** - Fill in the blank in an `if` statement (3 choices)
3. **Result** - Dodge animation (correct) or crash sequence (wrong)

**All 10 Obstacles:**

| Obstacle      | Code Challenge                                      | Answer     | Teaches             |
|---------------|-----------------------------------------------------|------------|---------------------|
| Rock          | `if (shipStrength ___ 50)`                          | `>`        | Greater-than        |
| Whirlpool     | `if (speed < 20) { speed = ___ }`                   | `100`      | Value assignment     |
| Iceberg       | `if (water === ___)`                                | `"cold"`   | String equality      |
| Kraken        | `if (cannonballs ___ 5)`                            | `>`        | Comparison           |
| Enemy Ship    | `if (ourCrew > enemyCrew) { ___ }`                  | `fight()`  | Function calls       |
| Storm         | `if (wind > 50) { hide() } ___ { sail() }`         | `else`     | Else keyword         |
| Giant Wave    | `if (wave === "big") { crew = ___ }`                | `20`       | Number vs string     |
| Shark Pack    | `if (sharks ___ 3)`                                 | `>`        | Threshold logic      |
| Fog Bank      | `if (canSee ___ 10)`                                | `<`        | Less-than            |
| Reef          | `if (waterDepth > shipSize) { ___ }`                | `keepGoing()` | Variable comparison |

5 are randomly selected per game.

**Scoring:**
- Correct dodge: +15 XP (+5 first-try bonus)
- Wrong: 3.5-second crash sequence (explosion > wreck > repair), no points
- Streak tracker with fire emoji, golden confetti at 3+ streak
- Win at 5/5 obstacles: +50 XP, "IF/ELSE Unlocked!" badge

---

### 4. Admin Dashboard (Leaderboard)

- Total students, average level, average badges
- Leaderboard table sorted by badges then level
- Concept mastery bars (color-coded: green >70%, yellow 40-70%, red <40%)
- Includes fake sample data for 5 players

---

## XP & Rank System

| Rank          | Icon | XP Required |
|---------------|------|-------------|
| Deck Swabber  |      | 0           |
| First Mate    |      | 50          |
| Captain       |      | 150         |
| Admiral       |      | 300         |

**XP Sources:**

| Action                     | XP   |
|----------------------------|------|
| Correct drop (Level 1)     | +10  |
| First-try slot (Level 1)   | +5   |
| Correct dodge (Level 2)    | +15  |
| First-try obstacle (Lvl 2) | +5   |
| Level complete              | +50  |
| Hint used                   | -5   |

XP persists in localStorage across sessions. Ranks are displayed on login.

---

## Badges (6 total)

| Badge        | Status     | How to Unlock               |
|--------------|------------|-----------------------------|
| Variables    | Unlockable | Complete Level 1            |
| IF/ELSE      | Unlockable | Complete Level 2            |
| Loops        | Locked     | Future Level 3              |
| Functions    | Locked     | Future Level 4              |
| Arrays       | Locked     | Future Level 5              |
| Debugging    | Locked     | Future Level 6              |

---

## Key Files

```
src/
  App.vue                    Main app - screen routing
  components/
    LoginScreen.vue          Player login + initials
    Level1.vue               Build Your Ship (variables)
    Level2.vue               First Sail (if/else)
    AdminDashboard.vue       Leaderboard + analytics
    ShipVisual.vue           SVG ship with animations
    Confetti.vue             Particle effects (3 variants)
    CodeExplainer.vue        Color-coded code breakdowns
    VariableWatch.vue        Memory box display
    HintButton.vue           Progressive hints (costs XP)
    ConceptCard.vue          Achievement card overlay
  data/
    codeBlocks.js            Level 1 puzzle data
    obstacles.js             Level 2 obstacle data
  composables/
    useProgress.js           XP, ranks, persistence
    useSound.js              Audio synthesis
  assets/styles/
    global.css               Base styles
    variables.css            Design tokens
```

---

## Effects & Feedback

| Event            | Visual                        | Sound              |
|------------------|-------------------------------|---------------------|
| Correct answer   | Green border, confetti        | Rising 3-note chime |
| Wrong answer     | Red shake, sink/crash anim    | Descending buzz      |
| Level complete   | Triple golden confetti burst  | 4-note fanfare       |
| Drag block       | Blue highlight                | Low thud             |
| Ship launch      | Ship sails away               | Rising sweep         |
| Hint used        | Slide-in reveal               | Click tone           |

Sound is synthesized via Web Audio API (no audio files). Mute toggle persists in localStorage.

---

## Future Levels (Planned)

| Level | Concept    | Mechanic                                    |
|-------|------------|---------------------------------------------|
| 3     | Loops      | WHILE loop battles against enemies          |
| 4     | Functions  | Reusable skills - `askRiddle(enemy)`        |
| 5     | Arrays     | Pick treasure by index - `chests[0]`        |
| 6     | Debugging  | Step through broken code and fix it         |

Also planned: Code Sandbox mode, Classroom mode, Chapter 2 (The Kraken's Nest).

---

## Storage

| Key               | Data                | Purpose                  |
|-------------------|---------------------|--------------------------|
| `pirates-progress`| `{ "xp": 250 }`    | XP persistence           |
| `pirates-muted`   | `"true"/"false"`    | Sound preference         |

Level state resets each session (always a fresh start).
