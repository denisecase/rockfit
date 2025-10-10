// ============================================================
// File: src/ui/hud.ts
// Purpose: Update the Heads Up Display (HUD) text
// and overlay; draw "Next" preview
// ------------------------------------------------------------
// Keeps UI concerns separate from game logic and rendering.
// ============================================================

import { GameState } from "../game/state";
import { PIECES } from "../game/pieces";

// Add a small local palette + helper (same indexes as renderer)
const COLORS = [
  "#000000",
  "#2f4f4f",
  "#556b2f",
  "#8b4513",
  "#708090",
  "#b8860b",
  "#7b3f00",
  "#1e90ff"
] as const;

/**Return the color string for a given value */
function colorFor(v: number): string {
  if (!Number.isFinite(v) || v <= 0) return COLORS[0];
  const idx = Math.min(v, COLORS.length - 1);
  return COLORS[idx] ?? COLORS[0];
}

/**
 * Update the main scoreboard line and overlay visibility,
 * and draw the "Next" piece preview (if the canvas exists).
 */
export function updateHUD(hudEl: HTMLElement, overlayEl: HTMLElement, state: GameState): void {
  // ---- Score line ----
  hudEl.textContent = `Score: ${state.score} | Level: ${state.level} | Lines: ${state.lines}`;

  // ---- Overlay ----
  if (state.gameOver) {
    overlayEl.textContent = "Game Over — press R to restart";
    overlayEl.classList.add("show");
  } else if (state.paused) {
    overlayEl.textContent = "Paused — press P to resume";
    overlayEl.classList.add("show");
  } else {
    overlayEl.textContent = "";
    overlayEl.classList.remove("show");
  }

  // ---- "Next" preview (optional) ----
  const nextCanvas = document.getElementById("next") as HTMLCanvasElement | null;
  if (!nextCanvas) return;
  const ctx = nextCanvas.getContext("2d");
  if (!ctx) return;

  // Clear background
  ctx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

  // Look up the next piece definition safely
  const rotations = PIECES[state.nextKey as keyof typeof PIECES]; // Shape[] | undefined
  if (!rotations || rotations.length === 0) return;

  const shape = rotations[0]; // Shape (matrix)
  if (
    !Array.isArray(shape) ||
    shape.length === 0 ||
    !Array.isArray(shape[0]) ||
    shape[0].length === 0
  ) {
    // Defensive: malformed shape — skip drawing
    return;
  }

  // Compute cell size to fit nicely
  const rows = shape.length;
  const cols = shape[0].length;
  const cell =
    Math.floor(Math.min(nextCanvas.width / (cols + 1), nextCanvas.height / (rows + 1))) || 1;

  // Center the preview
  const offsetX = Math.floor((nextCanvas.width - cols * cell) / 2);
  const offsetY = Math.floor((nextCanvas.height - rows * cell) / 2);

  // Simple color for preview (always a valid string)
  const strokeColor = "#0b0b0b";

  // Draw the matrix safely
  for (let r = 0; r < rows; r++) {
    const sRow = shape[r]!;
    for (let c = 0; c < cols; c++) {
      const v = sRow[c] ?? 0;
      if (!v) continue;

      const x = offsetX + c * cell;
      const y = offsetY + r * cell;
      ctx.fillStyle = colorFor(v); // ← use per-cell color
      ctx.fillRect(x, y, cell, cell);
      ctx.strokeStyle = strokeColor;
      ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
    }
  }
}
