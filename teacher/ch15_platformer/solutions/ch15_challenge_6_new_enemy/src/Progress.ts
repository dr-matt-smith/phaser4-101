// Progress - which levels the player has unlocked, kept in the browser's localStorage
//
// A plain class, not a scene: the menu asks it which levels are open, and the result scene tells
// it when one is finished. What comes back from localStorage is checked (Chapter 6) - it might
// be missing, or have been edited by hand.

const STORAGE_KEY = "ch15-platformer-unlocked";

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
