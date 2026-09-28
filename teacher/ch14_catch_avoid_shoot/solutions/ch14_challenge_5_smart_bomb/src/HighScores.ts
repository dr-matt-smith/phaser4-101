// HighScores - the best five scores, kept in the browser's localStorage so they last (Chapter 6)
//
// A plain class, not a game object: it has nothing to draw. Its methods are static, because there
// is only one high-score table and nothing to remember between calls - the table lives in
// localStorage, not in an object.

export interface HighScore {
  score: number;
  level: number;             // the level the player reached
}

const STORAGE_KEY = "ch14-shooter-high-scores";
const TABLE_SIZE = 5;

export class HighScores {
  // The table, best first. Anything odd in storage (missing, not JSON, not a list of scores) is
  // treated as an empty table rather than crashing the game.
  public static load(): HighScore[] {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      if (!Array.isArray(saved)) {
        return [];
      }
      return saved.filter((entry) =>
        typeof entry?.score === "number" && typeof entry?.level === "number"
      ).slice(0, TABLE_SIZE);
    } catch {
      return [];
    }
  }

  // Adds a score, keeps the best TABLE_SIZE, saves them, and returns the new score's place in the
  // table (0 = top) - or -1 if it was not good enough to get in.
  public static add(entry: HighScore): number {
    const table = HighScores.load();
    table.push(entry);
    table.sort((a, b) => b.score - a.score);
    const kept = table.slice(0, TABLE_SIZE);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
    } catch {
      // storage can be switched off or full; the game still works, the scores just do not last
    }
    return kept.indexOf(entry);
  }
}
