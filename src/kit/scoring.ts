// ============================================================
// File: src/kit/scoring.ts
// Purpose: Manage game score and level logic
// ------------------------------------------------------------
// Provides simple scoring and speed progression for RockFit
// and RockSwap. Designed for clarity, not realism.
// ============================================================

/**
 * Compute score increment based on number of cleared lines.
 */
export function scoreForLines(lines: number, level: number): number {
  const base = [0, 40, 100, 300, 1200][lines] ?? 0;
  return base * level;
}

/**
 * Return new level based on total lines cleared.
 * Example: +1 level every 10 lines.
 */
export function levelForLines(totalLines: number): number {
  return Math.floor(totalLines / 10) + 1;
}

/**
 * Compute drop speed (milliseconds per drop) for a given level.
 * Higher level → faster game.
 */
export function speedForLevel(level: number): number {
  const baseSpeed = 800; // ms at level 1
  return Math.max(100, baseSpeed - (level - 1) * 50);
}
