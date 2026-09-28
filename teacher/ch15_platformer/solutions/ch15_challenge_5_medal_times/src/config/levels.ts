// levels.ts - everything that makes one level different from another
//
// The layout of each level is in its Tiled map; this list says which maps there are, in which
// order, and what each is called. Adding a fourth level is one more map and one more line here.

// CHALLENGE 5: the times, in seconds, to beat for each medal
export interface MedalTimes {
  gold: number;
  silver: number;
  bronze: number;
}

export interface LevelInfo {
  key: string; // the map's key in the loader's cache
  file: string; // the .tmj file, inside public/
  name: string;
  skyTint: number; // a colour the sky picture is multiplied by (0xffffff = unchanged)
  medals: MedalTimes; // CHALLENGE 5
}

export const LEVELS: LevelInfo[] = [
  // CHALLENGE 5: medal times for each level
  {
    key: "level1",
    file: "assets/maps/level1.tmj",
    name: "Green Hills",
    skyTint: 0xffffff,
    medals: { gold: 30, silver: 45, bronze: 70 },
  },
  {
    key: "level2",
    file: "assets/maps/level2.tmj",
    name: "Deep Caves",
    skyTint: 0x7080a0,
    medals: { gold: 40, silver: 60, bronze: 90 },
  },
  {
    key: "level3",
    file: "assets/maps/level3.tmj",
    name: "Lava Castle",
    skyTint: 0xff9070,
    medals: { gold: 35, silver: 50, bronze: 80 },
  },
];

export const START_LIVES = 3;
