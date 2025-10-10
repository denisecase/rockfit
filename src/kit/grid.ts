// ============================================================
// File: src/kit/grid.ts
// Purpose: Grid creation, collision detection, and placement
// ------------------------------------------------------------
// Fast, safe helpers for the game loop. Validation is available
// in DEV mode via a toggle, but normal play avoids throwing so
// movement can never be blocked by a runtime assert.
// ============================================================

import type { Grid, Shape, Point } from "./types";

// Turn on if you want extra runtime checks & messages.
const DEBUG_VALIDATE = false;

/** Create an empty grid of given width and height. */
export function createGrid(width: number, height: number): Grid {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error(`createGrid: width/height must be positive integers (got ${width}×${height})`);
  }
  return Array.from({ length: height }, () => Array(width).fill(0));
}

/* ---------- Optional validators (DEV only) ---------- */

function assertGrid(grid: Grid, ctx = "grid"): void {
  if (!DEBUG_VALIDATE) return;
  if (!Array.isArray(grid) || grid.length === 0) {
    throw new Error(`${ctx}: expected a non-empty 2D array.`);
  }
  const width = grid[0]?.length ?? 0;
  if (width === 0) throw new Error(`${ctx}: first row must have at least one column.`);
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    if (!Array.isArray(row) || row.length !== width) {
      throw new Error(
        `${ctx}: row ${r} length ${row?.length ?? "undefined"} != ${width} (must be rectangular).`
      );
    }
    for (let c = 0; c < row.length; c++) {
      const v = row[c];
      if (typeof v !== "number" || !Number.isFinite(v)) {
        throw new Error(`${ctx}: cell [${r},${c}] is not a finite number.`);
      }
    }
  }
}

function assertShape(shape: Shape, ctx = "shape"): void {
  if (!DEBUG_VALIDATE) return;
  if (!Array.isArray(shape) || shape.length === 0) {
    throw new Error(`${ctx}: must be a non-empty number[][]`);
  }
  const w = shape[0]?.length ?? 0;
  if (w === 0) throw new Error(`${ctx}: first row must have at least one column`);
  for (let r = 0; r < shape.length; r++) {
    const row = shape[r];
    if (!Array.isArray(row) || row.length !== w) {
      throw new Error(`${ctx}: row ${r} length ${row?.length ?? "undefined"} != ${w}`);
    }
    for (let c = 0; c < w; c++) {
      const v = row[c];
      if (typeof v !== "number" || !Number.isFinite(v)) {
        throw new Error(`${ctx}: cell [${r},${c}] is not a finite number`);
      }
    }
  }
}

/* ---------- Fast helpers used every frame ---------- */

/**
 * Check if a shape at pos collides with grid or walls.
 * - Above-top rows (y < 0) are allowed during spawn.
 * - Returns true/false; never throws in normal play.
 */
export function collides(grid: Grid, shape: Shape, pos: Point): boolean {
  // Optional dev validations:
  assertGrid(grid, "collides(grid)");
  assertShape(shape, "collides(shape)");

  const height = grid.length;
  if (height === 0) return true;
  const width = grid[0]?.length ?? 0;
  if (width === 0) return true;

  const rows = shape.length;
  if (rows === 0) return true;
  const cols = shape[0]?.length ?? 0;
  if (cols === 0) return true;

  // Ensure integer grid positions (defensive)
  const baseX = Math.trunc(pos.x);
  const baseY = Math.trunc(pos.y);

  for (let r = 0; r < rows; r++) {
    const sRow = shape[r]!;
    for (let c = 0; c < cols; c++) {
      const v = sRow[c]!;
      if (!v) continue;

      const x = baseX + c;
      const y = baseY + r;

      // Hit walls/floor
      if (x < 0 || x >= width || y >= height) return true;

      // Above the top is permitted; only test filled cells when y >= 0
      if (y >= 0 && grid[y]![x]!) return true;
    }
  }
  return false;
}

/**
 * Merge a shape into the grid (place a piece).
 * Silently ignores any cells outside the visible grid.
 */
export function place(grid: Grid, shape: Shape, pos: Point): void {
  assertGrid(grid, "place(grid)");
  assertShape(shape, "place(shape)");

  const height = grid.length;
  if (height === 0) return;
  const width = grid[0]?.length ?? 0;
  if (width === 0) return;

  const rows = shape.length;
  if (rows === 0) return;
  const cols = shape[0]?.length ?? 0;
  if (cols === 0) return;

  const baseX = Math.trunc(pos.x);
  const baseY = Math.trunc(pos.y);

  for (let r = 0; r < rows; r++) {
    const sRow = shape[r]!;
    for (let c = 0; c < cols; c++) {
      const v = sRow[c]!;
      if (!v) continue;

      const x = baseX + c;
      const y = baseY + r;
      if (y >= 0 && y < height && x >= 0 && x < width) {
        grid[y]![x] = v;
      }
    }
  }
}

/**
 * Clear completed lines and return how many were cleared.
 */
export function clearLines(grid: Grid): number {
  assertGrid(grid, "clearLines(grid)");

  const width = grid[0]?.length ?? 0;
  if (width === 0) return 0;

  let cleared = 0;
  for (let r = grid.length - 1; r >= 0; r--) {
    const row = grid[r]!;
    const full = row.every((v) => v !== 0);
    if (full) {
      grid.splice(r, 1);
      grid.unshift(Array(width).fill(0));
      cleared++;
      r++; // re-check after rows shift down
    }
  }
  return cleared;
}
