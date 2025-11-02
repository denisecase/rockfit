// ============================================================
// File: src/kit/palettes.ts
// Purpose: Color palette definitions and theme management
// ------------------------------------------------------------
// Provides multiple color palettes and handles persistence
// via localStorage. Used by renderer and HUD.
// ============================================================

/**
 * Color palette definition
 */
export interface Palette {
  name: string;
  colors: readonly string[];
}

/**
 * Available color palettes
 * Index 0 is always the empty/background color
 * Indexes 1-7 are piece colors
 */
export const PALETTES: readonly Palette[] = [
  {
    name: "Classic",
    colors: [
      "#000000", // 0: empty
      "#2f4f4f", // 1: dark slate gray
      "#556b2f", // 2: dark olive green
      "#8b4513", // 3: saddle brown
      "#708090", // 4: slate gray
      "#b8860b", // 5: dark goldenrod
      "#7b3f00", // 6: chocolate
      "#1e90ff" // 7: dodger blue
    ]
  },
  {
    name: "Vibrant",
    colors: [
      "#000000", // 0: empty
      "#ff0080", // 1: hot pink
      "#00ff80", // 2: spring green
      "#8000ff", // 3: purple
      "#ff8000", // 4: orange
      "#00ffff", // 5: cyan
      "#ffff00", // 6: yellow
      "#ff0000" // 7: red
    ]
  },
  {
    name: "Pastel",
    colors: [
      "#000000", // 0: empty
      "#ffb3ba", // 1: pink
      "#bae1ff", // 2: light blue
      "#ffffba", // 3: light yellow
      "#baffc9", // 4: mint
      "#ffd4ba", // 5: peach
      "#e0bbff", // 6: lavender
      "#bfffdb" // 7: light green
    ]
  },
  {
    name: "Retro",
    colors: [
      "#000000", // 0: empty
      "#ff6b6b", // 1: coral red
      "#4ecdc4", // 2: turquoise
      "#45b7d1", // 3: sky blue
      "#f9ca24", // 4: yellow
      "#6c5ce7", // 5: purple
      "#fd79a8", // 6: pink
      "#00b894" // 7: green
    ]
  },
  {
    name: "Ocean",
    colors: [
      "#000000", // 0: empty
      "#0a3d62", // 1: deep blue
      "#1e5f74", // 2: teal
      "#3c6382", // 3: steel blue
      "#4a90a4", // 4: aqua
      "#60a3bc", // 5: light blue
      "#82ccdd", // 6: sky
      "#b8e6f0" // 7: pale blue
    ]
  },
  {
    name: "Sunset",
    colors: [
      "#000000", // 0: empty
      "#8b0000", // 1: dark red
      "#b22222", // 2: fire red
      "#cd5c5c", // 3: coral
      "#f08080", // 4: light coral
      "#ffa07a", // 5: light salmon
      "#ffb347", // 6: orange
      "#ffd700" // 7: gold
    ]
  }
] as const;

const STORAGE_KEY = "rockfit-palette";

/**
 * Current palette index (0-based)
 */
let currentPaletteIndex = 0;

/**
 * Initialize palette from localStorage
 */
export function initPalette(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const index = parseInt(stored, 10);
      if (index >= 0 && index < PALETTES.length) {
        currentPaletteIndex = index;
      }
    }
  } catch (e) {
    console.warn("[Palette] localStorage not available:", e);
  }
}

/**
 * Get the current palette
 */
export function getCurrentPalette(): Palette {
  return PALETTES[currentPaletteIndex]!;
}

/**
 * Get the current palette index (1-based for display)
 */
export function getCurrentPaletteNumber(): number {
  return currentPaletteIndex + 1;
}

/**
 * Get the current palette name
 */
export function getCurrentPaletteName(): string {
  return PALETTES[currentPaletteIndex]!.name;
}

/**
 * Cycle to the next palette
 */
export function nextPalette(): Palette {
  currentPaletteIndex = (currentPaletteIndex + 1) % PALETTES.length;
  savePalette();
  return getCurrentPalette();
}

/**
 * Cycle to the previous palette
 */
export function prevPalette(): Palette {
  currentPaletteIndex = (currentPaletteIndex - 1 + PALETTES.length) % PALETTES.length;
  savePalette();
  return getCurrentPalette();
}

/**
 * Set a specific palette by index (0-based)
 */
export function setPalette(index: number): Palette {
  if (index >= 0 && index < PALETTES.length) {
    currentPaletteIndex = index;
    savePalette();
  }
  return getCurrentPalette();
}

/**
 * Get total number of palettes
 */
export function getPaletteCount(): number {
  return PALETTES.length;
}

/**
 * Save current palette to localStorage
 */
function savePalette(): void {
  try {
    localStorage.setItem(STORAGE_KEY, currentPaletteIndex.toString());
  } catch (e) {
    console.warn("[Palette] Failed to save to localStorage:", e);
  }
}

/**
 * Get a color from the current palette
 */
export function colorFor(value: number): string {
  const palette = getCurrentPalette();
  if (!Number.isFinite(value) || value <= 0) return palette.colors[0]!;
  const idx = Math.min(value, palette.colors.length - 1);
  return palette.colors[idx] ?? palette.colors[0]!;
}
