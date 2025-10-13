# What’s in the `src` folder

This project splits shared, reusable utilities into **`src/kit/`** and keeps game-specific code in **`src/game/`**, with small **`systems/`** (engine helpers) and **`ui/`** "heads up display" (HUD) layers.

---

## Main kit logic

- [`src/kit/types.ts`](./src/kit/types.ts) – shared types
  Common primitives: `Cell`, `Grid`, `Shape`, `Point`, `ActivePiece { row, col, shape }`, `GameState`, `HUDData`, `GameConfig`, `StateUpdater`.

- [`src/kit/rotation.ts`](./src/kit/rotation.ts) – safe shape rotation utilities
  `rotateRight`, `rotateLeft`, `precomputeRotations` with validation and friendly error messages.

- [`src/kit/grid.ts`](./src/kit/grid.ts) – grid helpers
  `createGrid`, `collides`, `place`, `clearLines`.
  Fast path for gameplay; optional DEV validations can be toggled inside.

- [`src/kit/scoring.ts`](./src/kit/scoring.ts) – scoring & pacing
  `scoreForLines`, `levelForLines`, `speedForLevel`.

> Import example:
>
> ```ts
> import { rotateRight, precomputeRotations } from "./kit/rotation";
> import { createGrid, collides, place, clearLines } from "./kit/grid";
> import { scoreForLines, levelForLines, speedForLevel } from "./kit/scoring";
> import type { Grid, Shape, ActivePiece } from "./kit/types";
> ```

---

## Game-specific code

- [`src/main.ts`](./src/main.ts) – **entry point**
  Creates initial state, installs keyboard (`installKeyboard`), runs the gravity loop, calls `render` and `updateHUD`.

- [`src/game/pieces.ts`](./src/game/pieces.ts) – piece definitions & RNG
  Seven classic pieces as small matrices. Each piece is **tinted with an ID (1–7)** so the renderer palette applies distinct colors. Includes a toggle for **seven-bag** vs **pure random**.

- [`src/game/state.ts`](./src/game/state.ts) – game state container
  Grid, `active: ActivePiece | null`, `nextKey`, score, level, lines, pause, gameOver.

- [`src/game/transitions.ts`](./src/game/transitions.ts) – pure state transitions
  `spawnPiece`, `move(dx,dy)`, `rotate()`, **`hardDrop()`**, `togglePause()`, `restart()`.
  Uses `row/col` (no `pos`) and calls kit helpers for collision, placement, clears, and scoring.

- [`src/systems/renderer.ts`](./src/systems/renderer.ts) – rendering
  Draws the **board** and **active piece** on the main canvas using a fixed color palette.
  (It **does not** draw the Next preview; that lives in the HUD. It may still clear the Next canvas background.)

- [`src/systems/input.ts`](./src/systems/input.ts) – keyboard controls
  Installs a single `keydown` listener on `window` with `event.code` keys:
  **ArrowLeft/Right/Down/Up**, **Space** (hard drop), **P** (pause), **R** (restart).
  Prevents default page scrolling for Space/Arrows.

- [`src/ui/hud.ts`](./src/ui/hud.ts) – HUD & Next preview
  Updates the `Score | Level | Lines` text, shows/hides overlay (Pause / Game Over), and draws the **Next** piece preview using the same color IDs as the board.

> Typical flow:
>
> - `main.ts` initializes state, installs keyboard, starts the loop.
> - `transitions.ts` updates state from input/timers (pure functions).
> - `renderer.ts` paints the grid + active piece on the main canvas.
> - `hud.ts` updates text/overlay and draws the "Next" preview.

---

## Notes for contributors

- **Edit piece shapes safely:** see `src/game/pieces.ts`. Shapes are small `number[][]` matrices; the kit rotates & validates them. Each shape is "tinted" with an ID (1–7) so the renderer palette colors them differently.

- **Tweak difficulty:** see `src/kit/scoring.ts` for line scores, level thresholds, and drop speed per level.

- **Theming:** CSS variables live in `index.css` (page, panels, borders).
  **Canvas backgrounds are painted in code** (see `src/systems/renderer.ts` for the main board and `src/ui/hud.ts` for the Next preview). Change those fills to alter canvas backgrounds.

- **Keyboard:** keys are bound via `event.code` and call pure transitions; Space/Arrows won’t scroll the page.

- **Types:** gameplay uses `row/col` for positions; use `toPoint({row,col})` adapters only when a `{x,y}` is needed by helpers.
