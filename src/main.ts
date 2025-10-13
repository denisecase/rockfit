console.log("[RockFit] main.ts loaded");
// ============================================================
// File: src/main.ts
// Purpose: App entry — wire state, input, loop, rendering, HUD
// Execution flow:
//   main() -> initDOM() -> initState() -> initialPaint()
//         -> installInputs() -> startLoop() -> registerSW()
// ============================================================

import packageInfo from "../package.json";

import { newGameState, GameState } from "./game/state";
import { spawnPiece, move, togglePause } from "./game/transitions";
import { render } from "./systems/renderer";
import { updateHUD } from "./ui/hud";
import { speedForLevel } from "./kit/scoring";
import { installKeyboard } from "./systems/input";
import { installTouchControls } from "./systems/touch";
import { bindTouchClassListeners } from "./kit/touch-env";

// ---------- Module-scope refs ----------
let gameCanvas!: HTMLCanvasElement;
let nextCanvas!: HTMLCanvasElement;
let hudEl!: HTMLDivElement;
let overlayEl!: HTMLDivElement;
let footerEl: HTMLElement | null = null;

let state!: GameState;

// Assist (optional slow/score scaling)
const assist = {
  level: 0 as 0 | 1 | 2 | 3,
  slowFactor: [1.0, 1.5, 2.0, 2.5] as const,
  scoreMul: [1.0, 0.8, 0.6, 0.5] as const
};

// ---------- Loop timing (we'll reset these when resuming) ----------
let lastTime = performance.now();
let dropAccum = 0;

// ---------- DOM & focus ----------
function initDOM(): void {
  gameCanvas = document.getElementById("game") as HTMLCanvasElement;
  nextCanvas = document.getElementById("next") as HTMLCanvasElement;
  hudEl = document.getElementById("hud") as HTMLDivElement;
  overlayEl = document.getElementById("overlay") as HTMLDivElement;
  footerEl = document.getElementById("version");

  if (!gameCanvas || !nextCanvas || !hudEl || !overlayEl) {
    throw new Error(
      "Missing required DOM elements. Ensure #game, #next, #hud, and #overlay exist."
    );
  }

  if (footerEl) {
    const updated = new Date(document.lastModified).toISOString().split("T")[0];
    footerEl.textContent = ` • Version: ${packageInfo.version} • Updated: ${updated}`;
  }

  // Make the canvas keyboard-focusable and focused (critical for keys)
  gameCanvas.tabIndex = 0;
  requestAnimationFrame(() => gameCanvas.focus());
  gameCanvas.addEventListener(
    "pointerdown",
    () => {
      if (document.activeElement !== gameCanvas) gameCanvas.focus();
    },
    { passive: true }
  );
}

// ---------- State & helpers ----------
function initState(): void {
  state = spawnPiece(newGameState());
  console.log("[RockFit] Initial state:", {
    level: state.level,
    nextKey: state.nextKey,
    active: !!state.active,
    gridSize: `${state.grid[0]?.length}x${state.grid.length}`
  });
}

function applyState(next: GameState): void {
  if (next !== state) {
    state = next;
    render(gameCanvas, nextCanvas, state);
    updateHUD(hudEl, overlayEl, state);
  }
}

// Guard external inputs while paused/gameOver
function applyStateWhenActive(next: GameState): void {
  if (state.paused || state.gameOver) return;
  applyState(next);
}

function reflectPauseUI(paused: boolean): void {
  overlayEl.style.display = paused ? "block" : "none";

  const btn = document.querySelector<HTMLButtonElement>('button[data-action="pause"]');
  if (!btn) return;

  // Icon only
  btn.textContent = paused ? "▶️" : "⏸️";

  // Accessibility + state
  btn.setAttribute("aria-pressed", String(paused));
  btn.setAttribute("aria-label", paused ? "Resume" : "Pause");
  btn.title = paused ? "Resume" : "Pause";
}

function setPaused(next: boolean): void {
  if (state.paused === next) return;

  // Flip paused via pure transition
  state = togglePause(state);

  // --- NEW: reset loop timing on RESUME so gravity restarts cleanly ---
  if (!state.paused) {
    lastTime = performance.now();
    dropAccum = 0;
  }

  reflectPauseUI(state.paused);
  render(gameCanvas, nextCanvas, state);
  updateHUD(hudEl, overlayEl, state);
}

function bumpAssist(delta: -1 | 1): void {
  let next = (assist.level + delta) as 0 | 1 | 2 | 3;
  if (next < 0) next = 0;
  if (next > 3) next = 3;
  assist.level = next;
  console.log(`[RockFit] Assist ${assist.level}/3 (slow x${assist.slowFactor[assist.level]})`);
  updateHUD(hudEl, overlayEl, state);
}

// ---------- Initial paint ----------
function initialPaint(): void {
  render(gameCanvas, nextCanvas, state);
  updateHUD(hudEl, overlayEl, state);
}

// ---------- Inputs (keyboard + touch + env detection) ----------
function installInputs(): () => void {
  // 1) Toggle body.touch based on device/viewport; returns a disposer.
  const disposeTouchEnv = bindTouchClassListeners();

  // 2) Keyboard controls from your input system (arrows/rotate/etc.)
  const disposeKeyboard = installKeyboard(() => state, applyStateWhenActive);

  // 3) Pause button — fast on touch; capture + own the event to avoid conflicts.
  const pauseBtn = document.querySelector('button[data-action="pause"]');
  const onPauseTap = (ev: Event) => {
    ev.preventDefault();
    (ev as any).stopImmediatePropagation?.();
    setPaused(!state.paused);
  };
  pauseBtn?.addEventListener("pointerdown", onPauseTap as EventListener, {
    passive: false,
    capture: true
  });

  // 4) Hotkeys: PageUp/PageDown assist, P to pause. Ignore repeats and typing fields.
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat) return;

    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;

    if (e.code === "PageDown") {
      bumpAssist(1);
      e.preventDefault();
      e.stopImmediatePropagation();
    } else if (e.code === "PageUp") {
      bumpAssist(-1);
      e.preventDefault();
      e.stopImmediatePropagation();
    } else if (e.code === "KeyP" || e.key?.toLowerCase() === "p") {
      e.preventDefault();
      e.stopImmediatePropagation();
      setPaused(!state.paused);
    }
  };
  window.addEventListener("keydown", onKeyDown, { capture: true });

  // 5) Touch controls (safe no-op if #touch missing). Returns a disposer or undefined.
  const touchRoot = document.getElementById("touch") as HTMLElement | null;
  let disposeTouch: (() => void) | undefined;
  try {
    disposeTouch = installTouchControls(touchRoot, () => state, applyStateWhenActive);
  } catch (e) {
    console.error("[RockFit] installTouchControls failed:", e);
  }

  // 6) Auto-pause when the tab/app is backgrounded.
  const onVis = () => {
    if (document.hidden && !state.paused) setPaused(true);
  };
  document.addEventListener("visibilitychange", onVis);

  // ---- Cleanup everything from one place ----
  return () => {
    disposeTouchEnv?.();
    disposeKeyboard?.();
    disposeTouch?.();
    pauseBtn?.removeEventListener("pointerdown", onPauseTap as EventListener);
    window.removeEventListener("keydown", onKeyDown, { capture: true } as any);
    document.removeEventListener("visibilitychange", onVis);
  };
}

// ---------- Game loop (RAF + time accumulator) ----------
function startLoop(): void {
  // lastTime & dropAccum are module-scope and get reset on resume
  function loop(now: number) {
    const dt = now - lastTime;
    lastTime = now;

    let changed = false;

    if (!state.paused && !state.gameOver) {
      dropAccum += dt;

      const cfg = speedForLevel(state.level);
      const baseDrop = Math.max(60, Number.isFinite(cfg as number) ? (cfg as number) : 800);
      const dropEvery = Math.floor(baseDrop * assist.slowFactor[assist.level]);

      if (!Number.isFinite(cfg as number)) {
        console.warn("[RockFit] speedForLevel non-finite; fallback 800ms", {
          level: state.level,
          cfg
        });
      }

      while (dropAccum >= dropEvery) {
        const before = state;
        const beforeScore = before.score;

        state = move(state, 0, 1); // try one-row drop
        dropAccum -= dropEvery;

        if (state !== before) {
          const delta = state.score - beforeScore;
          if (delta > 0) {
            const mul = assist.scoreMul[assist.level];
            if (mul !== 1) state = { ...state, score: beforeScore + Math.round(delta * mul) };
          }
          changed = true;
        } else {
          break;
        }
      }
    }

    if (changed) {
      render(gameCanvas, nextCanvas, state);
      updateHUD(hudEl, overlayEl, state);
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// ---------- SW register (prod only) ----------
function registerSW(): void {
  if (!("serviceWorker" in navigator)) return;
  const base = import.meta.env.BASE_URL || "/";
  const buildId = (import.meta as any).env?.VITE_BUILD_ID || Date.now().toString();
  const swUrl = `${base}service-worker.js?v=${encodeURIComponent(buildId)}`;
  navigator.serviceWorker.register(swUrl).catch((err) => {
    console.warn("SW register failed:", err);
  });
}

// ---------- Bootstrap ----------
function main(): void {
  initDOM();
  initState();
  initialPaint();
  const disposeInputs = installInputs();
  startLoop();
  registerSW();

  // If hot-reload or teardown, call disposeInputs()
}

main();

console.log("[RockFit] main.ts boot", {
  BASE_URL: (import.meta as any).env?.BASE_URL,
  VITE_BUILD_ID: (import.meta as any).env?.VITE_BUILD_ID
});
