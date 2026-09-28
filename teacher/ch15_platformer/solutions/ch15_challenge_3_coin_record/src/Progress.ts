// Progress - which levels the player has unlocked, kept in the browser's localStorage
//
// A plain class, not a scene: the menu asks it which levels are open, and the result scene tells
// it when one is finished. What comes back from localStorage is checked (Chapter 6) - it might
// be missing, or have been edited by hand.

const STORAGE_KEY = "ch15-platformer-unlocked";
const COINS_KEY = "ch15-platformer-coins"; // CHALLENGE 3

// CHALLENGE 3: the best coin count for one level, and how many coins the level has
export interface CoinRecord {
  coins: number;
  total: number;
}

export class Progress {
  // how many levels are open to play: 1 means only the first
  public static unlockedCount(levelCount: number): number {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY));
      if (Number.isInteger(saved) && saved >= 1) {
        return Math.min(saved, levelCount);
      }
    } catch {
      // storage can be switched off in the browser - then only level 1 is open
    }
    return 1;
  }

  // CHALLENGE 3: the record for level `index`, or null if it has never been finished
  public static coinRecord(index: number): CoinRecord | null {
    const record = Progress.loadCoinRecords()[index];
    return record ?? null;
  }

  // CHALLENGE 3: keep this result if it beats the record; true if it did
  public static saveCoins(index: number, coins: number, total: number): boolean {
    const records = Progress.loadCoinRecords();
    const old = records[index];
    if (old !== null && old !== undefined && old.coins >= coins) {
      return false;
    }
    records[index] = { coins, total };
    try {
      localStorage.setItem(COINS_KEY, JSON.stringify(records));
    } catch {
      // storage switched off: the record is simply not kept
    }
    return true;
  }

  // CHALLENGE 3: an array with a record (or null) for each level. Everything read back from
  // storage is checked: it might be missing, or not what we wrote
  private static loadCoinRecords(): (CoinRecord | null)[] {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(COINS_KEY) ?? "[]");
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map((item) => Progress.isCoinRecord(item) ? item : null);
    } catch {
      return []; // not valid JSON, or no storage
    }
  }

  private static isCoinRecord(item: unknown): item is CoinRecord {
    if (typeof item !== "object" || item === null) {
      return false;
    }
    const record = item as Record<string, unknown>;
    return typeof record.coins === "number" && typeof record.total === "number";
  }

  // called when level `index` (0, 1, 2 ...) is finished: open the one after it
  public static unlockAfter(index: number, levelCount: number): void {
    const next = Math.min(index + 2, levelCount);
    if (next > Progress.unlockedCount(levelCount)) {
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // nothing to be done - the level stays locked next time
      }
    }
  }
}
