// ============================================================
// File: src/systems/renderer.ts
// Purpose: Draw the board, active piece, and "next" preview
// ------------------------------------------------------------
// Derives cell sizes from canvas dimensions so the game
// scales if you change canvas size in index.html.
// ============================================================

import { GameState } from "../game/state";
import { Shape } from "../kit/types";
import { colorFor } from "../kit/palettes";

const GRID_BACKGROUND_COLOR = "#111";
const FAINT_GRID_COLOR = "rgba(255,255,255,0.06)";

/**
 * Draw the full game state: grid, active piece, and "next" preview
 */
export function render(
  gameCanvas: HTMLCanvasElement,
  nextCanvas: HTMLCanvasElement,
  state: GameState
): void {
  drawGrid(gameCanvas, state);
  // Next preview is now drawn in updateHUD for consistency
}

/**
 * Draw the grid and the active piece
 */
function drawGrid(canvas: HTMLCanvasElement, state: GameState): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rows = state.grid.length;
  const cols = state.grid[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return;

  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  // Clear + background
  ctx.fillStyle = GRID_BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw faint grid lines
  ctx.strokeStyle = FAINT_GRID_COLOR;
  ctx.lineWidth = 1;
  for (let r = 0; r <= rows; r++) {
    const y = r * cellH;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let c = 0; c <= cols; c++) {
    const x = c * cellW;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Draw locked cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = state.grid[r]?.[c] ?? 0;
      if (val > 0) {
        drawCell(ctx, c, r, cellW, cellH, val);
      }
    }
  }

  // Draw active piece
  if (state.active) {
    const shape = state.active.shape;
    const offsetRow = state.active.row;
    const offsetCol = state.active.col;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r]!.length; c++) {
        const val = shape[r]![c] ?? 0;
        if (val > 0) {
          const gridRow = offsetRow + r;
          const gridCol = offsetCol + c;
          if (gridRow >= 0 && gridRow < rows && gridCol >= 0 && gridCol < cols) {
            drawCell(ctx, gridCol, gridRow, cellW, cellH, val);
          }
        }
      }
    }
  }
}

/**
 * Draw a single colored cell with border
 */
function drawCell(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  cellW: number,
  cellH: number,
  value: number
): void {
  const x = col * cellW;
  const y = row * cellH;

  // Fill with palette color
  ctx.fillStyle = colorFor(value);
  ctx.fillRect(x, y, cellW, cellH);

  // Draw border
  ctx.strokeStyle = "#0b0b0b";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, cellW - 1, cellH - 1);
}
