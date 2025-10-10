// ============================================================
// File: src/systems/touch.ts
// Purpose: On-screen buttons for phones/tablets (no keyboard)
// ------------------------------------------------------------
// Wires tap/hold to the same pure transitions used by keyboard.
// - Single taps: left / right / rotate / soft drop / hard drop / pause / restart
// - Hold repeat: left / right / soft drop (with a small delay)
// ============================================================

import type { GameState } from "../game/state";
import { move, rotate, togglePause, restart, hardDrop } from "../game/transitions";

type Getter = () => GameState;
type Setter = (next: GameState) => void;

type Action = "left" | "right" | "down" | "rotate" | "hard" | "pause" | "restart";

interface RepeatHandle {
  timeout?: number;
  interval?: number;
}

export function installTouchControls(root: HTMLElement | null, get: Getter, set: Setter) {
  if (!root) return () => {};

  // Helper to apply a state change safely
  const apply = (fn: (s: GameState) => GameState) => {
    const s = get();
    if (s.paused && fn !== togglePause && fn !== restart) return;
    const next = fn(s);
    if (next !== s) set(next);
  };

  // Map action strings to transitions
  const once = (action: Action) => {
    switch (action) {
      case "left":
        return apply((s) => move(s, -1, 0));
      case "right":
        return apply((s) => move(s, +1, 0));
      case "down":
        return apply((s) => move(s, 0, +1));
      case "rotate":
        return apply((s) => rotate(s));
      case "hard":
        return apply((s) => hardDrop(s));
      case "pause":
        return apply((s) => togglePause(s));
      case "restart":
        return apply((s) => restart(s));
    }
  };

  // Press-and-hold repeat for left/right/down
  const repeats: Record<Action, boolean> = {
    left: true,
    right: true,
    down: true,
    rotate: false,
    hard: false,
    pause: false,
    restart: false
  };

  const handles = new Map<HTMLElement, RepeatHandle>();

  const startRepeat = (btn: HTMLElement, action: Action) => {
    const h: RepeatHandle = {};
    handles.set(btn, h);

    // Fire immediately
    once(action);

    if (!repeats[action]) return;

    // After a short delay, start repeating
    h.timeout = window.setTimeout(() => {
      h.interval = window.setInterval(() => once(action), 60); // repeat rate
    }, 220); // initial delay before repeating
  };

  const stopRepeat = (btn: HTMLElement) => {
    const h = handles.get(btn);
    if (!h) return;
    if (h.timeout) window.clearTimeout(h.timeout);
    if (h.interval) window.clearInterval(h.interval);
    handles.delete(btn);
  };

  // Pointer events (work for touch and mouse)
  const onDown = (e: Event) => {
    const el = e.currentTarget as HTMLElement;
    const action = (el.getAttribute("data-action") || "") as Action;
    if (!action) return;
    (e as PointerEvent).preventDefault();
    startRepeat(el, action);
  };

  const onUp = (e: Event) => {
    const el = e.currentTarget as HTMLElement;
    stopRepeat(el);
  };

  // Attach to all buttons inside root
  const buttons = Array.from(root.querySelectorAll<HTMLElement>("[data-action]"));
  for (const btn of buttons) {
    btn.addEventListener("pointerdown", onDown);
    btn.addEventListener("pointerup", onUp);
    btn.addEventListener("pointercancel", onUp);
    btn.addEventListener("pointerleave", onUp);
  }

  // Prevent double-tap zoom on iOS
  root.addEventListener(
    "touchend",
    (e) => {
      if ((e as TouchEvent).target instanceof HTMLElement) e.preventDefault();
    },
    { passive: false }
  );

  // Cleanup
  return () => {
    for (const btn of buttons) {
      btn.removeEventListener("pointerdown", onDown);
      btn.removeEventListener("pointerup", onUp);
      btn.removeEventListener("pointercancel", onUp);
      btn.removeEventListener("pointerleave", onUp);
    }
  };
}
