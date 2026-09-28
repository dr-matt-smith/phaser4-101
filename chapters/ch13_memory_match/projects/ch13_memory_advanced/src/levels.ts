// levels.ts - the levels, as data
//
// Adding a level is adding a line here: nothing else in the game needs to change. The grid is
// scaled down to fit if it would not fit at full size (see GameScene.layOutGrid).

export interface LevelData {
  name: string;
  cols: number;
  rows: number;           // cols x rows must be even - every tile needs a partner
  shuffleAfter: number;   // after this many wrong pairs, the unmatched tiles swap places. 0 = never
}

export const LEVELS: LevelData[] = [
  { name: "Warm up", cols: 4, rows: 3, shuffleAfter: 0 },
  { name: "Four square", cols: 4, rows: 4, shuffleAfter: 0 },
  { name: "Shifting sands", cols: 5, rows: 4, shuffleAfter: 4 },
  { name: "The big one", cols: 6, rows: 4, shuffleAfter: 3 },
];
