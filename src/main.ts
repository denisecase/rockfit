console.log("[RockFit] main.ts loaded");
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
import { spawnPiece, move, rotate, togglePause, restart } from "./game/transitions";
import { render } from "./systems/renderer";
import { updateHUD } from "./ui/hud";
import { speedForLevel } from "./kit/scoring";
import { installKeyboard } from "./systems/input";
import { installTouchControls } from "./systems/touch";

// Grab Document elements
const gameCanvas = document.getElementById("game") as HTMLCanvasElement | null;
const nextCanvas = document.getElementById("next") as HTMLCanvasElement | null;
const hudEl = document.getElementById("hud") as HTMLDivElement | null;
const overlayEl = document.getElementById("overlay") as HTMLDivElement | null;
const footerEl = document.getElementById("version");

// ---- Secret Assist (PageUp/PageDown) -----------------------
// 0..3 where 0 = normal speed, 3 = slowest
const assist = {
  level: 0 as 0 | 1 | 2 | 3,
  // how much to slow gravity (multiply the drop interval)
  slowFactor: [1.0, 1.5, 2.0, 2.5] as const, // <- tuple
  // how much to scale scoring when slowed (multiply score delta)
  scoreMul: [1.0, 0.8, 0.6, 0.5] as const, // <- tuple
};

if (footerEl) {
  const updated = new Date(document.lastModified).toISOString().split("T")[0];
  footerEl.textContent = ` • Version: ${packageInfo.version} • Updated: ${updated}`;
}

if (!gameCanvas || !nextCanvas || !hudEl || !overlayEl) {
  throw new Error(
    "Missing required DOM elements. Ensure #game, #next, #hud, and #overlay exist in index.html."
  );
}

function bumpAssist(delta: -1 | 1) {
  const prev = assist.level;
  let next = (prev + delta) as 0 | 1 | 2 | 3;
  if (next < 0) next = 0;
  if (next > 3) next = 3;
  assist.level = next;
  // optional: tiny toast/log
  console.log(
    `[RockFit] Assist level: ${assist.level}/3 (slow x${assist.slowFactor[assist.level]})`
  );
  // immediate HUD refresh
  updateHUD(hudEl!, overlayEl!, state);
}

// 1) Create state and spawn the first piece
let state: GameState = spawnPiece(newGameState());
console.log("[RockFit] Initial state:", {
  level: state.level,
  nextKey: state.nextKey,
  active: !!state.active,
  gridSize: `${state.grid[0]?.length}x${state.grid.length}`
});

// Render once immediately so you always see the first piece
render(gameCanvas!, nextCanvas!, state);
updateHUD(hudEl!, overlayEl!, state);

// If first spawn failed, log it (you’ll see overlay = game over)
if (!state.active) {
  console.warn(
    "[RockFit] No active piece after spawn; gameOver?",
    state.gameOver,
    "nextKey:",
    state.nextKey
  );
}

// 2) Install input installers (keyboard + touch)
const getState = () => state;
const setState = (next: GameState) => {
  if (next !== state) {
    state = next;
    render(gameCanvas!, nextCanvas!, state);
    updateHUD(hudEl, overlayEl, state);
  }
};

// ---- Input (keyboard + touch) ---------------------------------------------
const disposeKeyboard = installKeyboard(getState, setState);

// Secret assist keys: PageDown = slower, PageUp = faster
window.addEventListener("keydown", (e) => {
  if (e.code === "PageDown") {
    bumpAssist(1); // slower (up to 3)
    e.preventDefault();
  } else if (e.code === "PageUp") {
    bumpAssist(-1); // faster (down to 0)
    e.preventDefault();
  }
});

// Touch is optional — safely no-op if #touch missing
const touchRoot = document.getElementById("touch") as HTMLElement | null;
try {
  installTouchControls(touchRoot, getState, setState);
} catch (e) {
  console.error("[RockFit] installTouchControls failed:", e);
}

// 3) Game loop (gravity / drop). requestAnimationFrame + a timer.
let lastTime = performance.now();
let dropAccum = 0;

function loop(now: number) {
  const dt = now - lastTime;
  lastTime = now;

  if (!state.paused && !state.gameOver) {
    dropAccum += dt;

    // Guard against bad config: clamp to a sane default if needed (ms/frame).
    const cfg = speedForLevel(state.level);
    const baseDrop = Math.max(60, Number.isFinite(cfg as number) ? (cfg as number) : 800);
    // slow gravity by assist factor
    const dropEvery = Math.floor(baseDrop * assist.slowFactor[assist.level]);

    // Debug once if cfg looked bad
    if (!Number.isFinite(cfg as number)) {
      console.warn("[RockFit] speedForLevel returned non-finite value; using fallback 800ms", {
        level: state.level,
        cfg
      });
    }

    // Apply as many drops as we owe
    while (dropAccum >= dropEvery) {
      const before = state;
      const beforeScore = before.score;

      state = move(state, 0, 1); // try to drop by one row
      dropAccum -= dropEvery;

      if (state !== before) {
        // If points were awarded inside transitions (line clears, etc.),
        // scale the delta when assist is active.
        const delta = state.score - beforeScore;
        if (delta > 0) {
          const mul = assist.scoreMul[assist.level];
          // Only change if multiplier != 1
          if (mul !== 1) {
            const adjusted = beforeScore + Math.round(delta * mul);
            // Keep immutability vibe
            state = { ...state, score: adjusted };
          }
        }
        render(gameCanvas!, nextCanvas!, state);
        updateHUD(hudEl!, overlayEl!, state);
      } else {
        // couldn't move down (blocked but not locked) — nothing to do
        break;
      }
    }
  }

  // Paint every frame to stay responsive
  render(gameCanvas!, nextCanvas!, state);
  updateHUD(hudEl!, overlayEl!, state);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

// Register SW (only in production, and only if supported)
if ("serviceWorker" in navigator) {
  const base = import.meta.env.BASE_URL || "/";
  const buildId = (import.meta as any).env?.VITE_BUILD_ID || Date.now().toString();
  // e.g. /rockfit/service-worker.js?v=abcdef1
  const swUrl = `${base}service-worker.js?v=${encodeURIComponent(buildId)}`;
  navigator.serviceWorker.register(swUrl).catch((err) => {
    console.warn("SW register failed:", err);
  });
}

console.log("[RockFit] main.ts boot", {
  BASE_URL: (import.meta as any).env?.BASE_URL,
  VITE_BUILD_ID: (import.meta as any).env?.VITE_BUILD_ID
});
