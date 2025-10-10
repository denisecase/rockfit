// ============================================================
// File: src/systems/input.ts
// Purpose: Handle keyboard input
// ------------------------------------------------------------
// Binds arrow keys, space, P, and R to movement and game
// control actions. Keeps the interface simple for learners.
// ============================================================

import { GameState } from "../game/state";
import { move, rotate, togglePause, restart, hardDrop } from "../game/transitions";

export type InputHandler = (state: GameState) => GameState;

/**
 * Return a map of key → handler function.
 */
export function createInputHandlers(): Record<string, InputHandler> {
  return {
    ArrowLeft: (s) => move(s, -1, 0),
    ArrowRight: (s) => move(s, 1, 0),
    ArrowDown: (s) => move(s, 0, 1),
    ArrowUp: (s) => rotate(s),
    Space: (s) => hardDrop(s),
    KeyP: (s) => togglePause(s),
    KeyR: (s) => restart(s)
  };
}

/**
 * Attach global event listeners.
 */
export function bindInput(onChange: (fn: InputHandler) => void): void {
  window.addEventListener("keydown", (e) => {
    const key = e.code;
    const handlers = createInputHandlers();
    const fn = handlers[key];
    if (fn) {
      e.preventDefault();
      onChange(fn);
    }
  });
}

/** Install keyboard handler. Returns an uninstall function. */
export function installKeyboard(
  getState: () => GameState,
  setState: (next: GameState) => void
): () => void {
  const handlers = createInputHandlers();

  const onKeyDown = (e: KeyboardEvent) => {
    const fn = handlers[e.code];
    if (!fn) return;

    // stop the page from scrolling on Space/Arrows
    e.preventDefault();

    // update once per keydown; ignore auto-repeat if you want:
    // if (e.repeat) return;

    const curr = getState();
    // If paused or gameOver, only P and R should work:
    if ((curr.paused || curr.gameOver) && !(e.code === "KeyP" || e.code === "KeyR")) {
      return;
    }

    const next = fn(curr);
    if (next !== curr) setState(next);
  };

  // Use passive:false so preventDefault() is allowed in some browsers
  window.addEventListener("keydown", onKeyDown, { passive: false });
  return () => window.removeEventListener("keydown", onKeyDown);
}
