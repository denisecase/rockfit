// ============================================================
// File: src/kit/scoring.ts
// Purpose: Manage game score and level logic with combo system
// ------------------------------------------------------------
// Adds drop bonuses, combos
// ============================================================

/**
 * Internal state for combo tracking
 * Module-scoped variable to keep track of current combo count.
 */
let currentCombo = 0;

/**
 * Compute score increment based on number of cleared lines.
 *
 * @param lines - Number of lines cleared (0-4)
 * @param level - Current game level
 * @returns Points earned for this clear
 */
export function scoreForLines(lines: number, level: number): number {
  const base = [0, 100, 300, 500, 800][lines] ?? 0;
  let score = base * level;

  // Update combo
  if (lines > 0) {
    currentCombo++;

    // Add combo bonus: 50 points per combo level, multiplied by game level
    if (currentCombo > 1) {
      const comboBonus = 50 * (currentCombo - 1) * level;
      score += comboBonus;
    }
  } else {
    // No lines cleared = combo breaks
    currentCombo = 0;
  }

  return score;
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
 * Higher level yields faster game.
 */
export function speedForLevel(level: number): number {
  const baseSpeed = 800; // ms at level 1
  return Math.max(100, baseSpeed - (level - 1) * 50);
}

/**
 * Get current combo count
 * For displaying combo in HUD
 */
export function getCombo(): number {
  return currentCombo;
}

/**
 * Reset combo counter
 * Call this when starting a new game
 */
export function resetCombo(): void {
  currentCombo = 0;
}

/**
 * Award points for soft drop (player holding down)
 *
 * @param cells - Number of cells dropped
 * @returns Points earned (1 point per cell)
 */
export function scoreForSoftDrop(cells: number): number {
  return cells * 1;
}

/**
 * Award points for hard drop (instant drop to bottom)
 *
 * @param cells - Number of cells dropped
 * @returns Points earned (2 points per cell)
 */
export function scoreForHardDrop(cells: number): number {
  return cells * 2;
}

/**
 * Get lines needed until next level
 * For HUD display
 */
export function linesUntilNextLevel(totalLines: number): number {
  const currentLevel = levelForLines(totalLines);
  const nextLevelLines = currentLevel * 10;
  return nextLevelLines - totalLines;
}
