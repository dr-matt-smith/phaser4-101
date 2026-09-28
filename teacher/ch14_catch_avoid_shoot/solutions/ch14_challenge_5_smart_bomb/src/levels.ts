// levels.ts - what happens in each level, as DATA
//
// The game scene reads this table; it does not know how many levels there are or what is in them.
// To add a level, or make one harder, change the table - not the code.

// how a wave of enemies moves (see WaveSpawner)
export type WavePattern = "row" | "stream" | "swoop";

export interface WaveData {
  pattern: WavePattern;
  size: number;             // how many ships
  speed: number;            // pixels per second (for "swoop": how long each ship's flight lasts, in ms)
}

export interface LevelData {
  waves: WaveData[];
  enemyFireChance: number;  // 0 to 1: how likely a chosen enemy is to fire, each time one is chosen
  bossHealth: number;       // hits it takes to destroy the boss
  bossFireDelay: number;    // milliseconds between the boss's volleys
  bossSweepTime: number;    // milliseconds for the boss to cross the screen
}

export const LEVELS: LevelData[] = [
  {
    waves: [
      { pattern: "row", size: 6, speed: 50 },
      { pattern: "stream", size: 6, speed: 200 },
      { pattern: "swoop", size: 6, speed: 4500 },
    ],
    enemyFireChance: 0.25,
    bossHealth: 30,
    bossFireDelay: 1400,
    bossSweepTime: 3200,
  },
  {
    waves: [
      { pattern: "swoop", size: 8, speed: 4000 },
      { pattern: "row", size: 8, speed: 65 },
      { pattern: "stream", size: 8, speed: 240 },
      { pattern: "swoop", size: 10, speed: 3600 },
    ],
    enemyFireChance: 0.4,
    bossHealth: 45,
    bossFireDelay: 1100,
    bossSweepTime: 2600,
  },
  {
    waves: [
      { pattern: "stream", size: 10, speed: 260 },
      { pattern: "row", size: 12, speed: 80 },
      { pattern: "swoop", size: 12, speed: 3200 },
      { pattern: "stream", size: 12, speed: 300 },
    ],
    enemyFireChance: 0.55,
    bossHealth: 60,
    bossFireDelay: 850,
    bossSweepTime: 2000,
  },
];
