// HighScoreTable - the ten best scores, kept in the browser's local storage so they last
//
// localStorage keeps strings, under string keys, for this web site, until the player clears their
// browser data - closing the tab or the browser does not lose them. So the table is turned into
// text (JSON) to save it, and turned back into objects when it is loaded.
//
// Anything read back from storage must be CHECKED before it is trusted: the player can edit it
// (it is in their browser's developer tools), an older version of the game may have saved it in a
// different shape, and another game served from the same address may have used the same key.

// one row of the table
export interface HighScore {
  initials: string;
  score: number;
  level: number;
}

export const TABLE_SIZE = 10;
export const MAX_INITIALS = 3;

// Every project in this book is served from http://127.0.0.1:8000/ - one web site, as far as the
// browser is concerned - so they all share ONE localStorage. A key naming the game keeps this
// game's scores apart from everyone else's.
const STORAGE_KEY = "phaser4-guide.coin-collector.high-scores";

export class HighScoreTable {
  // best first; never more than TABLE_SIZE entries
  private entries: HighScore[];

  // private: make a table with HighScoreTable.load(), which reads the saved one
  private constructor(entries: HighScore[]) {
    this.entries = entries;
  }

  // Read the saved table. If there is none, or what is there cannot be understood, the table
  // starts empty - a broken save should never stop the game from starting.
  public static load(): HighScoreTable {
    let text: string | null;
    try {
      text = localStorage.getItem(STORAGE_KEY);   // null if nothing has been saved yet
    } catch {
      return new HighScoreTable([]);              // storage turned off in this browser
    }
    if (text === null) {
      return new HighScoreTable([]);
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return new HighScoreTable([]);              // not JSON at all
    }
    if (!Array.isArray(data)) {
      return new HighScoreTable([]);              // JSON, but not a list
    }

    // keep only the entries that really are high scores, best first, ten at most
    const entries = data.filter(HighScoreTable.isHighScore);
    entries.sort((a, b) => b.score - a.score);
    return new HighScoreTable(entries.slice(0, TABLE_SIZE));
  }

  // A "type guard": if it returns true, TypeScript treats `value` as a HighScore from then on.
  private static isHighScore(value: unknown): value is HighScore {
    if (typeof value !== "object" || value === null) {
      return false;
    }
    // `as` - it is an object, but TypeScript cannot know what properties it has: look at them
    const entry = value as Record<string, unknown>;
    return typeof entry.initials === "string" && /^[A-Z]{1,3}$/.test(entry.initials) &&
      typeof entry.score === "number" && Number.isInteger(entry.score) && entry.score >= 0 &&
      typeof entry.level === "number" && Number.isInteger(entry.level) && entry.level >= 1;
  }

  // Write the table to local storage, as JSON text.
  public save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch {
      // storage full or turned off: the scores just are not kept - not worth stopping the game for
    }
  }

  // Would this score get into the table?
  public qualifies(score: number): boolean {
    if (score <= 0) {
      return false;
    }
    if (this.entries.length < TABLE_SIZE) {
      return true;
    }
    return score > this.entries[this.entries.length - 1].score;
  }

  // Put a new score in its place. Returns where it went (0 = top), or -1 if it did not make it.
  // An equal score goes BELOW the one already there: whoever got it first keeps their place.
  public add(entry: HighScore): number {
    if (!this.qualifies(entry.score)) {
      return -1;
    }
    let place = this.entries.findIndex((existing) => entry.score > existing.score);
    if (place === -1) {
      place = this.entries.length;   // lower than everything: it goes at the end
    }
    this.entries.splice(place, 0, entry);                 // insert at `place`
    this.entries = this.entries.slice(0, TABLE_SIZE);     // and drop anything pushed off the end
    return place;
  }

  // readonly HighScore[] - a list the caller can read but not change (no push, no sort)
  public getEntries(): readonly HighScore[] {
    return this.entries;
  }

  public getTopScore(): number {
    return this.entries.length > 0 ? this.entries[0].score : 0;
  }
}
