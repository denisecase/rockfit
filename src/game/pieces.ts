// ============================================================
// File: src/game/pieces.ts
// Purpose: Define the game pieces (shapes) and rotations
// ------------------------------------------------------------
// This module defines all available pieces (7 classic shapes)
// and provides a unified way to get the next random piece.
// ------------------------------------------------------------
// To change behavior, flip USE_SEVEN_BAG below:
//   true  → each bag of 7 is used once before reshuffling
//   false → fully random (possible repeats)
// ------------------------------------------------------------
// Each piece is a small matrix (number[][]) that represents
// how blocks appear in the grid. The kit handles rotation
// and validation, so these definitions stay simple.
// ============================================================

import { Shape } from "../kit/types";
import { precomputeRotations } from "../kit/rotation";
import { SevenBag, randomKeyPure } from "./pieces/bag_randomizer";

// ------------------------------------------------------------
// Developer toggle: choose how pieces appear
// ------------------------------------------------------------
const USE_SEVEN_BAG = true;

// ------------------------------------------------------------
// Map each piece key to a color-id (1..7). 0 is reserved for empty.
// ------------------------------------------------------------
export type PieceKey = "I" | "J" | "L" | "O" | "S" | "T" | "Z";
const ID: Record<PieceKey, number> = { I: 1, J: 2, L: 3, O: 4, S: 5, T: 6, Z: 7 };

// ------------------------------------------------------------
// Convert a raw 0/1 shape into an ID-tinted shape (0 → 0, 1 → id).
// ------------------------------------------------------------
function tint(id: number, raw: number[][]): Shape {
  return raw.map((row) => row.map((v) => (v ? id : 0)));
}

// ------------------------------------------------------------
// Define piece shapes (0 = empty, 1 = filled)
// ------------------------------------------------------------
export const PIECES: Record<PieceKey, Shape[]> = {
  I: precomputeRotations(tint(ID.I, [[1, 1, 1, 1]])),
  J: precomputeRotations(
    tint(ID.J, [
      [1, 0, 0],
      [1, 1, 1]
    ])
  ),
  L: precomputeRotations(
    tint(ID.L, [
      [0, 0, 1],
      [1, 1, 1]
    ])
  ),
  O: precomputeRotations(
    tint(ID.O, [
      [1, 1],
      [1, 1]
    ])
  ),
  S: precomputeRotations(
    tint(ID.S, [
      [0, 1, 1],
      [1, 1, 0]
    ])
  ),
  T: precomputeRotations(
    tint(ID.T, [
      [0, 1, 0],
      [1, 1, 1]
    ])
  ),
  Z: precomputeRotations(
    tint(ID.Z, [
      [1, 1, 0],
      [0, 1, 1]
    ])
  )
};

// ------------------------------------------------------------
// Randomization logic
// ------------------------------------------------------------
const keys = Object.keys(PIECES);
const sevenBag = new SevenBag(keys);

/**
 * Return the next random piece key based on selected mode.
 */
export function randomPieceKey(): string {
  return USE_SEVEN_BAG ? sevenBag.next() : randomKeyPure(keys);
}
