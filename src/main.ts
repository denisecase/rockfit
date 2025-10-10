// ============================================================
// File: src/main.ts
// Purpose: App entry — wire state, input, loop, rendering, HUD
// ------------------------------------------------------------
// This file connects everything:
//  - creates the initial game state
//  - binds keyboard input
//  - runs the tick loop (gravity)
//  - updates the canvas and the HUD each frame
// ============================================================

import packageInfo from "../package.json";

import { newGameState, GameState } from "./game/state";
import { spawnPiece, move } from "./game/transitions";
import { bindInput } from "./systems/input";
import { render } from "./systems/renderer";
import { updateHUD } from "./ui/hud";
import { speedForLevel } from "./kit/scoring";
import { installKeyboard } from "./systems/input";

// Grab DOM elements
const gameCanvas = document.getElementById("game") as HTMLCanvasElement | null;
const nextCanvas = document.getElementById("next") as HTMLCanvasElement | null;
const hudEl = document.getElementById("hud") as HTMLDivElement | null;
const overlayEl = document.getElementById("overlay") as HTMLDivElement | null;
const footerEl = document.getElementById("version");

if (footerEl) {
  const updated = new Date(document.lastModified).toISOString().split("T")[0];
  footerEl.textContent = ` • Version: ${packageInfo.version} • Updated: ${updated}`;
}

if (!gameCanvas || !nextCanvas || !hudEl || !overlayEl) {
  throw new Error(
    "Missing required DOM elements. Ensure #game, #next, #hud, and #overlay exist in index.html."
  );
}

// 1) Create state and spawn the first piece
let state: GameState = spawnPiece(newGameState());

// 2) Install keyboard controls (prevent default scrolling
const getState = () => state;
const setState = (next: GameState) => {
  state = next;
  render(gameCanvas, nextCanvas, state);
  updateHUD(hudEl, overlayEl, state);
};

// Mount the listener; it returns a cleanup function if needed
const disposeKeyboard = installKeyboard(getState, setState);

// 3) Game loop (gravity / drop). requestAnimationFrame + a timer.
let lastTime = performance.now();
let dropAccum = 0;

function loop(now: number) {
  const dt = now - lastTime;
  lastTime = now;

  if (!state.paused && !state.gameOver) {
    dropAccum += dt;
    const dropEvery = speedForLevel(state.level); // ms per auto-drop
    while (dropAccum >= dropEvery) {
      const before = state;
      state = move(state, 0, 1); // try to drop by one row
      dropAccum -= dropEvery;
      if (state !== before) {
        // state changed (moved, locked, cleared, or spawned)
        render(gameCanvas!, nextCanvas!, state);
        updateHUD(hudEl!, overlayEl!, state);
      } else {
        // couldn't move down (blocked but not locked) — nothing to do
      }
    }
  }

  // Paint every frame to keep it smooth (even if state didn’t change)
  render(gameCanvas!, nextCanvas!, state);
  updateHUD(hudEl!, overlayEl!, state);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
