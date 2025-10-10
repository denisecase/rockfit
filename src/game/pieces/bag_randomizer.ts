// ============================================================
// File: src/game/pieces/bag_randomizer.ts
// Purpose: Provide two randomization strategies for piece order
// ------------------------------------------------------------
// 1. "Seven-bag" mode (fair): ensures all 7 piece types appear
//    once before any repeats, then reshuffles the next bag.
// 2. "Pure random" mode: picks each piece independently at random.
//
// Developers can choose between them in pieces.ts by setting
// USE_SEVEN_BAG = true or false.
// ============================================================

/**
 * Classic seven-bag randomizer.
 * Guarantees that all 7 piece types appear before any repeat.
 */
export class SevenBag {
  private bag: string[] = [];
  private readonly keys: string[];

  constructor(pieceKeys: string[]) {
    this.keys = [...pieceKeys];
  }

  /** Get the next piece key (refills and reshuffles as needed). */
  next(): string {
    if (this.bag.length === 0) {
      // refill and shuffle
      this.bag = [...this.keys];
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j]!, this.bag[i]!];
      }
    }
    return this.bag.pop()!;
  }
}

/**
 * Simple random pick (no fairness, may repeat).
 */
export function randomKeyPure(keys: string[]): string {
  if (keys.length === 0) {
    throw new Error("Cannot pick a random key from an empty array.");
  }
  return keys[Math.floor(Math.random() * keys.length)]!;
}
