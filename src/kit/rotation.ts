// ============================================================
// File: src/kit/rotation.ts
// Purpose: Safe and validated shape rotation utilities
// ------------------------------------------------------------
// Provides functions to rotate a 2D shape 90° clockwise or
// counterclockwise, and to precompute all four rotations.
// ============================================================

import { Shape } from "./types";

/**
 * Validate a Shape and give helpful messages if it's malformed.
 * Ensures a rectangular number[][] with at least 1 row and 1 col.
 */
function assertShape(shape: unknown, ctx: string = "shape"): asserts shape is Shape {
  if (!Array.isArray(shape)) throw new Error(`${ctx}: expected number[][]`);
  if (shape.length === 0) throw new Error(`${ctx}: must have at least one row`);
  const width = shape[0]?.length ?? 0;
  if (width === 0) throw new Error(`${ctx}: rows must have at least one column`);
  for (let r = 0; r < shape.length; r++) {
    const row = shape[r];
    if (!Array.isArray(row)) throw new Error(`${ctx}: row ${r} is not an array`);
    if (row.length !== width) {
      throw new Error(`${ctx}: row ${r} has length ${row.length}, expected ${width}`);
    }
    for (let c = 0; c < row.length; c++) {
      const v = row[c];
      if (typeof v !== "number" || !Number.isFinite(v)) {
        throw new Error(`${ctx}: cell [${r},${c}] must be a finite number`);
      }
    }
  }
}

/**
 * Rotate a rectangular matrix 90° clockwise.
 */
export function rotateRight(shape: Shape): Shape {
  assertShape(shape, "rotateRight(shape)");

  const rows = shape.length;
  const cols = shape[0]!.length; // safe after assertShape
  const out: Shape = Array.from({ length: cols }, () => new Array(rows).fill(0));

  for (let r = 0; r < rows; r++) {
    const srcRow = shape[r]!; // safe: 0 <= r < rows
    for (let c = 0; c < cols; c++) {
      const val = srcRow[c]!; // safe: 0 <= c < cols
      out[c]![rows - 1 - r] = val; // out[c] exists, index is in-bounds
    }
  }
  return out;
}

/**
 * Rotate a rectangular matrix 90° counterclockwise.
 */
export function rotateLeft(shape: Shape): Shape {
  assertShape(shape, "rotateLeft(shape)");

  const rows = shape.length;
  const cols = shape[0]!.length; // safe after assertShape
  const out: Shape = Array.from({ length: cols }, () => new Array(rows).fill(0));

  for (let r = 0; r < rows; r++) {
    const srcRow = shape[r]!;
    for (let c = 0; c < cols; c++) {
      const val = srcRow[c]!;
      out[cols - 1 - c]![r] = val;
    }
  }
  return out;
}

/**
 * Return all 4 possible rotations for a given shape.
 */
export function precomputeRotations(base: Shape): Shape[] {
  assertShape(base, "precomputeRotations(base)");
  const r0 = base;
  const r1 = rotateRight(r0);
  const r2 = rotateRight(r1);
  const r3 = rotateRight(r2);
  return [r0, r1, r2, r3];
}
