// Progress - which levels the player has unlocked, kept in the browser's localStorage
//
// A plain class, not a scene: the menu asks it which levels are open, and the result scene tells
// it when one is finished. What comes back from localStorage is checked (Chapter 6) - it might
// be missing, or have been edited by hand.

import { isMedal, type Medal, MEDAL_RANK } from "./config/medals.ts";

const STORAGE_KEY = "ch15-platformer-unlocked";
const MEDALS_KEY = "ch15-platformer-medals"; // CHALLENGE 5

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

  // CHALLENGE 5: the best medal won on level `index` ("none" if never won)
  public static bestMedal(index: number): Medal {
    return Progress.loadMedals()[index] ?? "none";
  }

  // CHALLENGE 5: keep `medal` if it is better than the best so far; true if it was
  public static saveMedal(index: number, medal: Medal): boolean {
    const medals = Progress.loadMedals();
    if (MEDAL_RANK[medal] <= MEDAL_RANK[medals[index] ?? "none"]) {
      return false;
    }
    medals[index] = medal;
    try {
      localStorage.setItem(MEDALS_KEY, JSON.stringify(medals));
    } catch {
      // storage switched off: nothing is kept
    }
    return true;
  }

  // CHALLENGE 5: checked on the way in - anything that is not a medal counts as "none"
  private static loadMedals(): Medal[] {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(MEDALS_KEY) ?? "[]");
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map((m) => isMedal(m) ? m : "none");
    } catch {
      return [];
    }
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
