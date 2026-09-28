import { GRASS, SAND, WALL, WATER } from "./tiles.ts";

// level.ts - the map
//
// CHALLENGE 5: the map is written as strings - one string per ROW, one character per TILE - which
// is much easier to read and edit than numbers. parseLevel() turns it into the 2D array of tile
// indexes that the tilemap needs, and finds the player's start from the "@".
//
//   .  grass    ~  water    #  wall    s  sand    @  the player's start (on grass)

// CHALLENGE 5: the same map as before, as text
const MAP: string[] = [
  "#########################",
  "#.......................#",
  "#...sss.........~~~.....#",
  "#..ss~ss......~~~~~~....#",
  "#...sss......~~~~~~~~...#",
  "#.............~~~~~~....#",
  "#....#####......~~......#",
  "#....#.@.#..............#",
  "#....#...#..............#",
  "#....##.##.......sss....#",
  "#................sss....#",
  "#~~~~~~~~~~sss~~~~~~~~~~#",
  "#~~~~~~~~~~sss~~~~~~~~~~#",
  "#.......................#",
  "#..###...........ssss.#.#",
  "#....#...........ssss.#.#",
  "#....#................#.#",
  "#########################",
];

// CHALLENGE 5: which tile each character stands for. A Record<string, number> is an object used as
// a lookup table - like a Java Map<Character, Integer>, written as a literal
const TILE_FOR: Record<string, number> = {
  ".": GRASS,
  "~": WATER,
  "#": WALL,
  "s": SAND,
  "@": GRASS,
};

const START = "@";

// CHALLENGE 5: what parseLevel() gives back - the tiles, and where the player starts
export interface Level {
  tiles: number[][];
  startColumn: number;
  startRow: number;
}

// CHALLENGE 5: turn rows of characters into rows of tile indexes. A mistake in the map (an unknown
// character, a row of the wrong length, no "@") throws an Error with a message that says where -
// far better than a map that is silently wrong
export function parseLevel(rows: string[]): Level {
  const width = rows[0].length;
  const tiles: number[][] = [];
  let startColumn = -1;
  let startRow = -1;

  rows.forEach((text, row) => {
    if (text.length !== width) {
      throw new Error(`Map row ${row} is ${text.length} characters long, not ${width}`);
    }

    const line: number[] = [];
    text.split("").forEach((character, column) => {
      if (!(character in TILE_FOR)) {
        throw new Error(`Unknown map character "${character}" at column ${column}, row ${row}`);
      }
      if (character === START) {
        startColumn = column;
        startRow = row;
      }
      line.push(TILE_FOR[character]);
    });
    tiles.push(line);
  });

  if (startColumn < 0) {
    throw new Error(`The map has no ${START} to show where the player starts`);
  }
  return { tiles, startColumn, startRow };
}

// CHALLENGE 5: parsed once, when the game loads
export const LEVEL: Level = parseLevel(MAP);
