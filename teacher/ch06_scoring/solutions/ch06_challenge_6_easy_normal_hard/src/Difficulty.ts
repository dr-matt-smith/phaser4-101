// CHALLENGE 6 - Difficulty: the three difficulties, and what each one changes
//
// A union of string literals: a Difficulty can only be one of these three strings, and the
// compiler rejects anything else ("Hard", "medium" ...).

export type Difficulty = "easy" | "normal" | "hard";

export interface DifficultySettings {
  name: string;
  lifetimeScale: number;   // how long coins stay: 1.4 = 40% longer
  spawnScale: number;      // the time between coins: 0.75 = they come a quarter faster
}

// Record<Difficulty, ...> - an object with exactly one entry for each difficulty; leave one out
// and it is a build error
export const DIFFICULTIES: Record<Difficulty, DifficultySettings> = {
  easy: { name: "EASY", lifetimeScale: 1.4, spawnScale: 1.25 },
  normal: { name: "NORMAL", lifetimeScale: 1, spawnScale: 1 },
  hard: { name: "HARD", lifetimeScale: 0.7, spawnScale: 0.75 },
};

export const DEFAULT_DIFFICULTY: Difficulty = "normal";
