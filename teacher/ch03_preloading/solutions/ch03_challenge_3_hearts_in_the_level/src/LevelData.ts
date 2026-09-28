// LevelData.ts - the shape of assets/data/level.json
//
// Phaser loads a JSON file without knowing what is in it, so it cannot tell TypeScript either.
// These interfaces are OUR description of the file. The build checks the code against them; nothing
// checks the file - if level.json and these ever disagree, the file wins, at run time.

export interface Point {
  x: number;
  y: number;
}

export interface LevelData {
  name: string;
  player: Point;
  gems: Point[];
  hearts: Point[];     // CHALLENGE 3: the new list in level.json
}
