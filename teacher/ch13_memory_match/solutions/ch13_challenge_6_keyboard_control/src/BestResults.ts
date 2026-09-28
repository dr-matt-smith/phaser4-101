import type { ThemeName } from "./themes/themes.ts";

// BestResults - the best result for every level, in each theme, kept in the browser's local
// storage so it survives closing the page (Chapter 6)
//
// A plain class, not a scene or a game object: it has nothing to draw. Scenes make one when they
// need it; each one reads what is stored.

export interface BestResult {
  stars: number;
  moves: number;
  seconds: number;
}

const STORAGE_KEY = "phaser4guide.ch13.memoryBest";

export class BestResults {
  // "pictures-0", "cards-2", ... -> the best result for that theme and level
  private results: Record<string, BestResult>;

  constructor() {
    this.results = BestResults.load();
  }

  public get(theme: ThemeName, level: number): BestResult | undefined {
    return this.results[`${theme}-${level}`];
  }

  // keeps the result if it beats the best so far (or there is none), and says whether it did
  public record(theme: ThemeName, level: number, result: BestResult): boolean {
    const best = this.get(theme, level);
    if (best !== undefined && !BestResults.isBetter(result, best)) {
      return false;
    }
    this.results[`${theme}-${level}`] = result;
    this.save();
    return true;
  }

  // more stars is better; with the same stars, fewer moves; with the same moves, less time
  private static isBetter(a: BestResult, b: BestResult): boolean {
    if (a.stars !== b.stars) {
      return a.stars > b.stars;
    }
    if (a.moves !== b.moves) {
      return a.moves < b.moves;
    }
    return a.seconds < b.seconds;
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.results));
    } catch {
      // storage can be full or switched off - the game still works, it just forgets
    }
  }

  // anything could be in storage (an old version's data, or a player's editing), so check it
  // piece by piece and keep only what looks right
  private static load(): Record<string, BestResult> {
    const results: Record<string, BestResult> = {};
    try {
      const text = localStorage.getItem(STORAGE_KEY);
      if (text === null) {
        return results;
      }
      const stored = JSON.parse(text);
      if (typeof stored !== "object" || stored === null) {
        return results;
      }
      for (const [key, value] of Object.entries(stored)) {
        const result = value as BestResult;    // "as": a guess, checked on the next line
        if (typeof result?.stars === "number" && typeof result.moves === "number" &&
          typeof result.seconds === "number") {
          results[key] = { stars: result.stars, moves: result.moves, seconds: result.seconds };
        }
      }
    } catch {
      // not valid JSON: start again with no results
    }
    return results;
  }
}
