// ============================================================
// File: src/kit/types.ts
// Purpose: Shared type definitions for the RockFit kit
// ------------------------------------------------------------
// These types describe the basic grid, shapes, and coordinates
// used by RockFit.
// Keep these simple and well-documented.
// ============================================================

/**
 * A single grid cell value.
 * Usually 0 (empty) or 1 (filled), but can use other small ints
 * for colors or piece IDs.
 */
export type Cell = number;

/**
 * The 2D grid of the playfield (rows × columns).
 * The top row is index 0.
 */
export type Grid = Cell[][];

/**
 * A 2D shape for a falling piece.
 * Each sub-array represents one row.
 */
export type Shape = number[][];

/**
 * A coordinate in grid space.
 * (0,0) is the top-left corner.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * The current falling piece in play.
 * row / col give the upper-left grid coordinate
 * where shape[0][0] is drawn.
 */
export interface ActivePiece {
  shape: Shape;
  row: number;
  col: number;
}

/**
 * The full game state snapshot.
 * Updated continuously during play.
 */
export interface GameState {
  grid: Grid;
  active: ActivePiece | null;
  nextKey: string; // next piece identifier ("T", "L", etc.)
  score: number;
  level: number;
  lines: number;
  paused: boolean;
  gameOver: boolean;
}

/**
 * HUD update info (for rendering or UI).
 */
export interface HUDData {
  score: number;
  level: number;
  lines: number;
  paused: boolean;
  gameOver: boolean;
}

/**
 * Simple configuration values shared across the game.
 */
export interface GameConfig {
  width: number; // columns in the grid
  height: number; // rows in the grid
  cellSize: number; // pixels per cell in rendering
}

/**
 * Convenience type for functions that mutate or produce a new GameState.
 * Used in transitions and input handling.
 */
export type StateUpdater = (state: GameState) => GameState;
