// ============================================================
// File: src/systems/renderer.ts
// Purpose: Draw the board, active piece, and "next" preview
// ------------------------------------------------------------
// Derives cell sizes from canvas dimensions so the game
// scales if you change canvas size in index.html.
// ============================================================

import { GameState } from "../game/state";
import { Shape } from "../kit/types";

const GRID_BACKGROUND_COLOR = "#111";
const FAINT_GRID_COLOR = "rgba(255,255,255,0.06)";

// Colors for filled cells (index 0 = empty)
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

// Always return a valid color string
function colorFor(value: number): string {
  // 0 means empty; non-zero indexes into COLORS with clamp
  if (!Number.isFinite(value) || value <= 0) return COLORS[0];
  const idx = Math.min(value, COLORS.length - 1);
  return COLORS[idx] ?? COLORS[0];
}

/**
 * Draw a shape matrix to a 2D canvas at a grid position.
 */
function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  gx: number,
  gy: number,
  cell: number
) {
  const shapeRows = shape.length;
  if (shapeRows === 0) return;
  const shapeCols = shape[0]!.length;

  for (let r = 0; r < shapeRows; r++) {
    const shapeRow = shape[r]!;
    for (let c = 0; c < shapeCols; c++) {
      const v = shapeRow[c] ?? 0;
      if (v) {
        const x = (gx + c) * cell;
        const y = (gy + r) * cell;
        ctx.fillStyle = colorFor(v);
        ctx.fillRect(x, y, cell, cell);

        // subtle bevel
        ctx.strokeStyle = GRID_BACKGROUND_COLOR;
        ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      }
    }
  }
}

/**
 * Render the full game frame.
 */
export function render(
  gameCanvas: HTMLCanvasElement,
  nextCanvas: HTMLCanvasElement,
  state: GameState
): void {
  const gctx = gameCanvas.getContext("2d");
  const nctx = nextCanvas.getContext("2d");
  if (!gctx || !nctx) return;

  // --- Guard: empty or malformed grid ---
  const rows = state.grid.length;
  if (rows === 0) return;
  const firstRow = state.grid[0];
  if (!firstRow) return;
  const cols = firstRow.length;
  if (cols === 0) return;

  // Compute cell size from canvas
  const cell = Math.floor(Math.min(gameCanvas.width / cols, gameCanvas.height / rows)) || 1;

  // Clear background
  gctx.fillStyle = GRID_BACKGROUND_COLOR;
  gctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Draw board cells
  for (let r = 0; r < rows; r++) {
    const rowArr = state.grid[r]!;
    for (let c = 0; c < cols; c++) {
      const v = rowArr[c] ?? 0;
      const x = c * cell;
      const y = r * cell;

      if (v) {
        gctx.fillStyle = colorFor(v);
        gctx.fillRect(x, y, cell, cell);
        gctx.strokeStyle = GRID_BACKGROUND_COLOR;
        gctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      } else {
        // faint grid
        gctx.strokeStyle = FAINT_GRID_COLOR;
        gctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      }
    }
  }

  // Draw active piece (row/col → x/y)
  if (state.active) {
    drawShape(gctx, state.active.shape, state.active.col, state.active.row, cell);
  }

  // Clear and paint the "Next" canvas background (preview drawn by HUD)
  nctx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  nctx.fillStyle = GRID_BACKGROUND_COLOR;
  nctx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  // Next preview is handled in src/ui/hud.ts to avoid coupling to piece defs.
}
