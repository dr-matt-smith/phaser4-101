// Records - the best score and the longest run, kept in the browser's local storage (Chapter 6),
// so they survive closing the page
//
// Plain TypeScript: the scenes make a Records, read it, and hand it each finished game.

const STORAGE_KEY = "guide-ch12-higher-or-lower-records";

export interface RecordData {
  bestScore: number;
  bestStreak: number;
}

// what submit() tells the game over screen
export interface NewRecords {
  newBestScore: boolean;
  newBestStreak: boolean;
}

export class Records {
  private data: RecordData = { bestScore: 0, bestStreak: 0 };

  constructor() {
    // local storage only holds strings, and may hold anything - or be switched off. If it cannot
    // be read, start from nothing rather than crash.
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        this.data = { ...this.data, ...JSON.parse(saved) };
      }
    } catch {
      // keep the empty records
    }
  }

  public get bestScore(): number {
    return this.data.bestScore;
  }

  public get bestStreak(): number {
    return this.data.bestStreak;
  }

  // Record a finished game; save and report anything it beat.
  public submit(score: number, streak: number): NewRecords {
    const result: NewRecords = {
      newBestScore: score > this.data.bestScore,
      newBestStreak: streak > this.data.bestStreak,
    };
    if (result.newBestScore) {
      this.data.bestScore = score;
    }
    if (result.newBestStreak) {
      this.data.bestStreak = streak;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // storage full or switched off: the records last until the page closes
    }
    return result;
  }
}
