// ============================================================
// File: src/game/transitions.ts
// Purpose: Define pure state transitions (no rendering)
// ------------------------------------------------------------
// Each function takes a GameState and returns a new one.
// Handles spawn, movement, rotation, hard drop, locking,
// and line clears using helpers from the kit.
// ============================================================

import { GameState } from "./state";
import { PIECES, randomPieceKey, PieceKey } from "./pieces";
import { collides, place, clearLines } from "../kit/grid";
import { rotateRight } from "../kit/rotation";
import { scoreForLines, levelForLines, getCombo, resetCombo } from "../kit/scoring";
import type { ActivePiece, Shape } from "../kit/types";

const toPoint = (p: Pick<ActivePiece, "row" | "col">) => ({ x: p.col, y: p.row });

// --- spawn ---

export function spawnPiece(state: GameState): GameState {
  const key = state.nextKey as PieceKey;
  const defs = PIECES[key];
  if (!defs || defs.length === 0) {
    return { ...state, active: null, gameOver: true };
  }
  const shape: Shape = defs[0] ?? [[0]]; // fallback to a default shape if undefined
  const active: ActivePiece = { shape, row: -1, col: 3 };
  const nextKey = randomPieceKey();

  if (collides(state.grid, shape, toPoint(active))) {
    return { ...state, active: null, gameOver: true };
  }
  return { ...state, active, nextKey };
}

// --- movement ---

export function move(state: GameState, dx: number, dy: number): GameState {
  const a = state.active;
  if (!a) return state;

  const nextRow = a.row + dy;
  const nextCol = a.col + dx;

  if (collides(state.grid, a.shape, { x: nextCol, y: nextRow })) {
    if (dy > 0) {
      // lock + clear + spawn
      place(state.grid, a.shape, { x: a.col, y: a.row });
      const cleared = clearLines(state.grid);
      const totalLines = state.lines + cleared;
      const newLevel = levelForLines(totalLines);
      const newScore = state.score + scoreForLines(cleared, newLevel);
      const newCombo = getCombo();

      return spawnPiece({
        ...state,
        active: null,
        lines: totalLines,
        level: newLevel,
        score: newScore,
        combo: newCombo
      });
    }
    return state; // horizontal bump → ignore
  }

  return { ...state, active: { shape: a.shape, row: nextRow, col: nextCol } };
}

// --- rotation ---

export function rotate(state: GameState): GameState {
  const a = state.active;
  if (!a) return state;
  const nextShape = rotateRight(a.shape);
  if (!collides(state.grid, nextShape, toPoint(a))) {
    return { ...state, active: { shape: nextShape, row: a.row, col: a.col } };
  }
  return state;
}

// --- hard drop ---

export function hardDrop(state: GameState): GameState {
  const a = state.active;
  if (!a) return state;

  // Slide down until the *next* step would collide
  let row = a.row;
  while (!collides(state.grid, a.shape, { x: a.col, y: row + 1 })) {
    row++;
  }

  // Lock at final row
  place(state.grid, a.shape, { x: a.col, y: row });

  // Clear/score/level, then spawn once
  const cleared = clearLines(state.grid);
  const totalLines = state.lines + cleared;
  const newLevel = levelForLines(totalLines);
  const newScore = state.score + scoreForLines(cleared, newLevel);
  const newCombo = getCombo();

  return spawnPiece({
    ...state,
    active: null,
    lines: totalLines,
    level: newLevel,
    score: newScore,
    combo: newCombo
  });
}

// --- pause / restart ---

export function togglePause(state: GameState): GameState {
  return { ...state, paused: !state.paused };
}

export function restart(state: GameState): GameState {
  const clearedGrid = state.grid.map((r) => r.fill(0));
  return {
    ...state,
    ...spawnPiece({
      ...state,
      grid: clearedGrid,
      score: 0,
      lines: 0,
      combo: 0,
      gameOver: false
    })
  };
}
