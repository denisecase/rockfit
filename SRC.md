# The `src` folder

This project uses a functional, immutable state approach (no classes).
It splits shared, reusable utilities into **`src/kit/`** and keeps game-specific code in **`src/game/`**, with small **`systems/`** (engine helpers) and **`ui/`** "heads up display" (HUD) layers.

---

## Main kit logic

- [`src/kit/types.ts`](./src/kit/types.ts) – shared types
  Common primitives: `Cell`, `Grid`, `Shape`, `Point`, `ActivePiece { row, col, shape }`, `GameState`, `HUDData`, `GameConfig`, `StateUpdater`.

- [`src/kit/rotation.ts`](./src/kit/rotation.ts) – safe shape rotation utilities
  `rotateRight`, `rotateLeft`, `precomputeRotations` with validation and friendly error messages.

- [`src/kit/grid.ts`](./src/kit/grid.ts) – grid helpers
  `createGrid`, `collides`, `place`, `clearLines`.
  Fast path for gameplay; optional DEV validations can be toggled inside.

- [`src/kit/scoring.ts`](./src/kit/scoring.ts) – scoring & pacing with combo system
  `scoreForLines` (with combo bonuses), `levelForLines`, `speedForLevel`, `getCombo`, `resetCombo`.
  Also includes optional drop scoring: `scoreForSoftDrop`, `scoreForHardDrop`.
  **Combo system:** consecutive line clears award bonus points (50 × combo × level).

- [`src/kit/palettes.ts`](./src/kit/palettes.ts) – color theme system
  Six built-in themes (Classic, Vibrant, Pastel, Retro, Ocean, Sunset).
  Manages theme selection and persistence via localStorage.
  `getCurrentPalette`, `nextPalette`, `colorFor`, `initPalette`.

> Import example:
>
> ```ts
> import { rotateRight, precomputeRotations } from "./kit/rotation";
> import { createGrid, collides, place, clearLines } from "./kit/grid";
> import { scoreForLines, levelForLines, speedForLevel, getCombo, resetCombo } from "./kit/scoring";
> import { initPalette, nextPalette, colorFor } from "./kit/palettes";
> import type { Grid, Shape, ActivePiece } from "./kit/types";
> ```

---

## Game-specific code

- [`src/main.ts`](./src/main.ts) – **entry point**
  Creates initial state, installs keyboard (`installKeyboard`), runs the gravity loop, calls `render` and `updateHUD`.
  Manages high score tracking and theme cycling.
  **Hotkeys:** R (restart), P (pause), C (cycle theme), PageUp/PageDown (assist mode).

- [`src/game/pieces.ts`](./src/game/pieces.ts) – piece definitions & RNG
  Seven classic pieces as small matrices. Each piece is **tinted with an ID (1–7)** so the renderer palette applies distinct colors. Includes a toggle for **seven-bag** vs **pure random**.

- [`src/game/state.ts`](./src/game/state.ts) – game state container
  Grid, `active: ActivePiece | null`, `nextKey`, score, level, lines, **combo** (tracks consecutive clears), pause, gameOver.

- [`src/game/transitions.ts`](./src/game/transitions.ts) – pure state transitions
  `spawnPiece`, `move(dx,dy)`, `rotate()`, **`hardDrop()`**, `togglePause()`, `restart()`.
  Uses `row/col` (no `pos`) and calls kit helpers for collision, placement, clears, and scoring.
  **Combo tracking:** updates combo count after line clears.

- [`src/systems/renderer.ts`](./src/systems/renderer.ts) – rendering with theme support
  Draws the **board** and **active piece** on the main canvas using the current color palette from `palettes.ts`.
  Dynamically updates when theme changes.

- [`src/systems/input.ts`](./src/systems/input.ts) – keyboard controls
  Installs a single `keydown` listener on `window` with `event.code` keys:
  **ArrowLeft/Right/Down/Up**, **Space** (hard drop), **P** (pause), **R** (restart).
  Prevents default page scrolling for Space/Arrows.
  Note: **R key** and **C key** are handled in `main.ts` to bypass state guards for restart and theme cycling.

- [`src/systems/highscore.ts`](./src/systems/highscore.ts) – persistent high score
  Manages high score storage via localStorage.
  `loadHighScore`, `maybeUpdateHighScore`, `clearHighScore`.

- [`src/ui/hud.ts`](./src/ui/hud.ts) – HUD & Next preview
  Updates the `Score | High | Level | Lines | Combo | Theme` text, shows/hides overlay (Pause / Game Over), and draws the **Next** piece preview using the current theme's colors.
  **Displays:** current score, high score, level, lines cleared, active combo, and theme name.

> Typical flow:
>
> - `main.ts` initializes state, loads palette and high score, installs keyboard, starts the loop.
> - `transitions.ts` updates state from input/timers (pure functions), tracks combos.
> - `renderer.ts` paints the grid + active piece using current theme colors.
> - `hud.ts` updates text/overlay (including combo and theme name) and draws the "Next" preview.
> - `highscore.ts` persists and tracks the best score across sessions.

---

## Features

### Combo System
Consecutive line clears award bonus points: **50 × (combo - 1) × level**.
The combo counter displays in the HUD when active (2x, 3x, 4x, etc.) and resets when a piece locks without clearing lines.

### Color Themes
Six beautiful themes to choose from:
- **Classic** – Original earthy tones
- **Vibrant** – Neon colors (hot pink, spring green, purple, orange)
- **Pastel** – Soft, gentle colors
- **Retro** – 90s aesthetic (coral, turquoise, sky blue)
- **Ocean** – Blue gradient (deep to pale)
- **Sunset** – Warm gradient (dark red to gold)

Press **C** to cycle through themes. Your choice is saved automatically.

### High Score
Tracks high score across sessions using localStorage.
Automatically updates.
Clear button available to reset high score.

### Controls
- **Arrow Keys** – Move left/right/down, rotate
- **Space** – Hard drop (instant drop to bottom)
- **P** – Pause/resume
- **R** – Restart game (works even when game over)
- **C** – Cycle color theme
- **PageUp/PageDown** – Adjust assist mode (slow down game)

---

## Notes for contributors

- **Edit piece shapes safely:** see `src/game/pieces.ts`. Shapes are small `number[][]` matrices; the kit rotates & validates them. Each shape is "tinted" with an ID (1–7) so the renderer palette colors them differently.

- **Tweak difficulty:** see `src/kit/scoring.ts` for line scores, level thresholds, and drop speed per level. Combo bonus is configurable (default: 50 pts per combo level).

- **Add themes:** Edit `PALETTES` array in `src/kit/palettes.ts`. Each palette needs a name and 8 colors (index 0 for empty cells, 1-7 for pieces).

- **Theming:** CSS variables live in `index.css` (page, panels, borders).
  **Canvas backgrounds and piece colors** are managed by the palette system in `src/kit/palettes.ts`.
  The renderer and HUD both use `colorFor()` to get colors from the current theme.

- **Keyboard:** Most keys are bound via `event.code` in `src/systems/input.ts` and call pure transitions.
  **R** and **C** keys are handled directly in `main.ts` to bypass state guards.
  Space/Arrows won't scroll the page.

- **Types:** gameplay uses `row/col` for positions; use `toPoint({row,col})` adapters only when a `{x,y}` is needed by helpers.

- **State management:** The project uses immutable state updates. The combo counter is tracked both in `GameState` and internally in `scoring.ts` for scoring calculations.

- **High scores:** Stored in localStorage with key `rockfit-highscore`. Can be cleared via button or by calling `clearHighScore()`.

---

## Scoring System

### Base Points (per level)
- **1 line (Single):** 40 × level
- **2 lines (Double):** 100 × level
- **3 lines (Triple):** 300 × level
- **4 lines (Tetris):** 1200 × level

### Combo Bonus
When clearing lines consecutively without missing:
- Combo 1: No bonus
- Combo 2: +50 × level
- Combo 3: +100 × level
- Combo 4: +150 × level
- And so on...

**Example at Level 1:**
```
Clear 1 line:  40 pts
Clear 1 line:  90 pts   (40 + 50 combo bonus)
Clear 1 line:  140 pts  (40 + 100 combo bonus)
Miss a clear:  Combo resets
```

### Optional Drop Bonuses
- **Soft Drop:** 1 point per cell (when holding down)
- **Hard Drop:** 2 points per cell (Space key)

*Drop bonuses are available but not currently implemented in the main game loop.*
