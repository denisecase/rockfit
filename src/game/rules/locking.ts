// ============================================================
// File: src/game/rules/locking.ts
// Purpose: Lock an active piece into the playfield grid
// ------------------------------------------------------------
// This function merges a piece’s filled cells into the grid once
// it can no longer move down (a "lock" event).
// It includes safety checks and friendly error messages for new
// contributors learning how the grid and shapes work.
// ============================================================

import { Grid, ActivePiece } from "../../kit/types";

/**
 * Ensure the grid is rectangular and non-empty.
 * Throws friendly errors if malformed, to help contributors.
 */
function assertGrid(grid: Grid, ctx = "grid"): void {
  if (!Array.isArray(grid) || grid.length === 0) {
    throw new Error(`${ctx}: expected a non-empty 2D array.`);
  }
  const width = grid[0]?.length ?? 0;
  if (width === 0) {
    throw new Error(`${ctx}: first row must have at least one column.`);
  }
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    if (!Array.isArray(row) || row.length !== width) {
      throw new Error(
        `${ctx}: row ${r} length ${row?.length ?? "undefined"} != ${width} (grid must be rectangular).`
      );
    }
  }
}

/**
 * Ensure the ActivePiece is valid.
 * Checks for numeric row/col and rectangular shape.
 */
function assertActivePiece(p: ActivePiece, ctx = "active piece"): void {
  if (!p || typeof p.row !== "number" || typeof p.col !== "number") {
    throw new Error(`${ctx}: missing numeric row/col.`);
  }
  const shape = p.shape;
  if (!Array.isArray(shape) || shape.length === 0) {
    throw new Error(`${ctx}: shape must be a non-empty array.`);
  }
  const w = shape[0]?.length ?? 0;
  if (w === 0) {
    throw new Error(`${ctx}: shape[0] must have at least one column.`);
  }

  for (let r = 0; r < shape.length; r++) {
    const row = shape[r];
    if (!Array.isArray(row) || row.length !== w) {
      throw new Error(`${ctx}: row ${r} length ${row?.length ?? "undefined"} != ${w}.`);
    }
    for (let c = 0; c < w; c++) {
      const v = row[c];
      if (typeof v !== "number" || !Number.isFinite(v)) {
        throw new Error(`${ctx}: shape cell [${r},${c}] is not a finite number.`);
      }
    }
  }
}

/**
 * Lock the active piece into the grid.
 *
 * - Copies non-zero cells from the piece shape into the grid.
 * - Ignores cells that fall outside the grid bounds.
 * - Validates both the grid and the piece before modifying.
 * - Writes the *actual* numeric values from the shape (not hard-coded 1s),
 *   so color or type data can be preserved.
 *
 * Example:
 *   lockPiece(grid, activePiece);
 */
export function lockPiece(grid: Grid, p: ActivePiece): void {
  assertGrid(grid, "lockPiece(grid)");
  assertActivePiece(p, "lockPiece(active)");

  const height = grid.length;
  const width = grid[0]!.length; // ! tells TypeScript we've validated this

  const shape = p.shape;
  const shapeRows = shape.length;
  const shapeCols = shape[0]!.length;

  for (let r = 0; r < shapeRows; r++) {
    const shapeRow = shape[r]!;
    for (let c = 0; c < shapeCols; c++) {
      const val = shapeRow[c]!;
      if (!val) continue; // skip empty cells

      const gr = p.row + r;
      const gc = p.col + c;

      // Skip cells that fall outside the grid bounds
      if (gr < 0 || gr >= height || gc < 0 || gc >= width) continue;

      // By this point, grid[gr] and grid[gr][gc] are safe to access
      const gridRow = grid[gr]!;
      gridRow[gc] = val;
    }
  }
}
