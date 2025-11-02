// ============================================================
// File: src/game/state.ts
// Purpose: Manage the game state in memory
// ------------------------------------------------------------
// Holds the grid, active piece, next queue, score, level, and
// control flags (paused, gameOver). State changes are handled
// by functions in transitions.ts.
// ============================================================

import { createGrid } from "../kit/grid";
import { PIECES, randomPieceKey } from "./pieces";
import { ActivePiece } from "../kit/types";

export interface GameState {
  grid: number[][];
  active: ActivePiece | null;
  nextKey: string;
  score: number;
  level: number;
  lines: number;
  combo: number; // track consecutive line clears
  paused: boolean;
  gameOver: boolean;
}

// Create a fresh starting game state
export function newGameState(width = 10, height = 20): GameState {
  const grid = createGrid(width, height);
  const nextKey = randomPieceKey();
  return {
    grid,
    active: null,
    nextKey,
    score: 0,
    level: 1,
    lines: 0,
    combo: 0,
    paused: false,
    gameOver: false
  };
}
